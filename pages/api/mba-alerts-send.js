// GET /api/mba-alerts-send  → daily Vercel cron (Authorization: Bearer CRON_SECRET).
// Emails each subscriber at most once a day: forms they follow (or all forms) with a date 7 days or 1 day away,
// and forms they were waiting for that have now opened. ?dry=1 reports without sending.
import { catDb } from "../../lib/catPlannerServer";
import { todayIST, dueToday, isOpenNow, formById, buildEmail, mailer } from "../../lib/mbaAlerts";

function authorised(req) {
  const got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const ok = [process.env.CRON_SECRET, process.env.CONTENT_AUTOMATION_TOKEN].filter(Boolean);
  return ok.includes(got) || (process.env.CRON_SECRET && req.query.secret === process.env.CRON_SECRET);
}

async function all(q) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await q().range(from, from + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export default async function handler(req, res) {
  if (!authorised(req)) return res.status(401).json({ error: "Unauthorized" });
  const dry = req.query.dry === "1";
  const max = Math.max(1, Math.min(2000, parseInt(process.env.MBA_ALERTS_MAX || "400", 10)));
  const today = todayIST();
  const db = catDb();

  try {
    const due = dueToday(today);
    const dueByForm = {};
    due.forEach((d) => { (dueByForm[d.form.id] = dueByForm[d.form.id] || []).push(d); });

    const subs = await all(() => db.from("mba_alert_subscribers").select("id, name, email, token, all_forms").eq("active", true).order("id"));
    if (!subs.length) return res.status(200).json({ ok: true, today, due: due.length, subscribers: 0, sent: 0 });
    const follows = await all(() => db.from("mba_alert_follows").select("subscriber_id, form_id, wait_open").order("subscriber_id"));
    const dates = Array.from(new Set([...due.map((d) => d.date), "-"]));
    const sentRows = await all(() => db.from("mba_alert_sent").select("subscriber_id, form_id, kind, target_date").in("target_date", dates).order("subscriber_id"));
    const sentKey = new Set(sentRows.map((r) => `${r.subscriber_id}|${r.form_id}|${r.kind}|${r.target_date}`));

    const followsBySub = {};
    follows.forEach((f) => { (followsBySub[f.subscriber_id] = followsBySub[f.subscriber_id] || []).push(f); });

    const queue = [];
    for (const s of subs) {
      const items = [];
      const mine = followsBySub[s.id] || [];
      const formIds = new Set(s.all_forms ? Object.keys(dueByForm) : mine.map((f) => f.form_id));
      formIds.forEach((id) => (dueByForm[id] || []).forEach((d) => { if (!sentKey.has(`${s.id}|${id}|${d.kind}|${d.date}`)) items.push(d); }));
      mine.filter((f) => f.wait_open).forEach((f) => {
        const form = formById(f.form_id);
        if (form && isOpenNow(form) && !sentKey.has(`${s.id}|${f.form_id}|open|-`)) items.push({ form, kind: "open", date: form.deadline || null, label: "Last date", days: null });
      });
      // one reminder per form per email: keep the most urgent
      const best = {};
      items.forEach((i) => { const k = i.form.id; if (!best[k] || (i.kind === "d1" && best[k].kind !== "d1")) best[k] = i; });
      const list = Object.values(best).sort((a, b) => (a.days ?? 99) - (b.days ?? 99));
      if (list.length) queue.push({ s, list, extra: items });
    }

    if (dry) return res.status(200).json({ ok: true, dry: true, today, due: due.map((d) => `${d.form.id}:${d.kind}:${d.date}`), subscribers: subs.length, toEmail: queue.length });

    let sent = 0, failed = 0;
    const batch = queue.slice(0, max);
    for (let i = 0; i < batch.length; i += 5) {
      await Promise.all(batch.slice(i, i + 5).map(async ({ s, list, extra }) => {
        try {
          const m = buildEmail({ name: s.name, items: list, token: s.token });
          await mailer().sendMail({ from: { name: "IPM Careers", address: "info@ipmcareer.com" }, to: s.email, subject: m.subject, html: m.html, text: m.text, headers: { "List-Unsubscribe": `<${m.unsub}>` } });
          const rows = extra.map((x) => ({ subscriber_id: s.id, form_id: x.form.id, kind: x.kind, target_date: x.kind === "open" ? "-" : x.date }));
          await db.from("mba_alert_sent").upsert(rows, { onConflict: "subscriber_id,form_id,kind,target_date", ignoreDuplicates: true });
          const opened = extra.filter((x) => x.kind === "open").map((x) => x.form.id);
          if (opened.length) await db.from("mba_alert_follows").update({ wait_open: false }).eq("subscriber_id", s.id).in("form_id", opened);
          sent += 1;
        } catch {
          failed += 1;
        }
      }));
    }
    return res.status(200).json({ ok: true, today, due: due.length, subscribers: subs.length, queued: queue.length, sent, failed, leftover: Math.max(0, queue.length - batch.length) });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Alert run failed" });
  }
}

export const config = { maxDuration: 60 };
