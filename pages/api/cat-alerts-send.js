// GET /api/cat-alerts-send?event=admit_card|response_sheet|answer_key|result  (Authorization: Bearer CRON_SECRET, or &secret=)
// Emails every active subscriber who has not had this alert yet, up to CAT_ALERTS_MAX per call (default 400).
// Call it again until "remaining" is 0. &dry=1 counts without sending. Never sends the same alert twice.
import { catDb } from "../../lib/catPlannerServer";
import { EVENTS, renderEvent } from "../../lib/catAlerts";
import { mailer } from "../../lib/mbaAlerts";
import { cityBySlug } from "../../lib/catPlanner";

export const config = { maxDuration: 60 };

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
  const event = String(req.query.event || "");
  if (!EVENTS[event]) return res.status(400).json({ error: `event must be one of: ${Object.keys(EVENTS).join(", ")}` });
  const dry = req.query.dry === "1";
  const max = Math.max(1, Math.min(2000, parseInt(process.env.CAT_ALERTS_MAX || "400", 10)));
  const started = Date.now();
  const db = catDb();

  try {
    const subs = await all(() => db.from("cat_alert_subscribers").select("id, token, name, email, city_slug").eq("active", true).order("id"));
    const done = new Set((await all(() => db.from("cat_alert_sent").select("subscriber_id").eq("event", event))).map((r) => r.subscriber_id));
    const todo = subs.filter((s) => !done.has(s.id));
    if (dry) return res.status(200).json({ event, dry: true, active: subs.length, alreadySent: done.size, wouldSend: Math.min(max, todo.length), remaining: todo.length });

    let sent = 0, failed = 0;
    for (const s of todo.slice(0, max)) {
      if (Date.now() - started > 50000) break;
      const m = renderEvent(event, s, s.city_slug ? cityBySlug(s.city_slug)?.name || "" : "");
      try {
        await mailer().sendMail({ from: { name: "IPM Careers", address: "info@ipmcareer.com" }, to: s.email, subject: m.subject, html: m.html, text: m.text, headers: { "List-Unsubscribe": `<https://register.ipmcareer.com/api/cat-alerts-unsubscribe?t=${s.token}>` } });
        await db.from("cat_alert_sent").upsert({ subscriber_id: s.id, event }, { onConflict: "subscriber_id,event" });
        sent++;
      } catch (e) {
        failed++;
        console.error("cat alert send failed:", s.id, e?.message);
      }
    }
    return res.status(200).json({ event, sent, failed, remaining: Math.max(0, todo.length - sent - failed) });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "send failed" });
  }
}
