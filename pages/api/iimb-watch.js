// GET /api/iimb-watch  (called every 10 minutes by Supabase pg_cron)
// Watches IIMB's official UG admissions pages and the candidate login page. The moment a new link or notice
// appears (response sheet, answer key, objection window, result...), it emails the IPM Careers team once.
// Safe to call by anyone: it only reads public pages, and each change is emailed a single time.
import { catDb } from "../../lib/catPlannerServer";
import { mailer } from "../../lib/mbaAlerts";

export const config = { maxDuration: 30 };

const TO = "ipmcareeronline@gmail.com";
const PAGES = [
  { id: "admissions", name: "IIMB UG Admissions 2027 page", url: "https://ug.iimb.ac.in/ug-admissions-2027/", kind: "links", all: true },
  { id: "home", name: "IIMB UG home page", url: "https://ug.iimb.ac.in/", kind: "links" },
  { id: "login", name: "IIMB UG candidate login (digialm)", url: "https://cdn.digialm.com/EForms/configuredHtml/1345/101967/login.html", kind: "text" },
];
const HOT = /respon|answer|key|objection|challenge|result|score|shortlist|interview|merit|call letter/i;

const strip = (h) => String(h || "").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

function links(html, base) {
  const out = {};
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1].trim();
    try { href = new URL(href, base).toString(); } catch { continue; }
    if (/^(mailto|tel|javascript):/i.test(href)) continue;
    const text = strip(m[2]).slice(0, 160);
    out[href] = text || out[href] || "";
  }
  return out;
}

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (IPM Careers IIMB UG watcher)", "Cache-Control": "no-cache" } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; } finally { clearTimeout(t); }
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const db = catDb();
  const { data: rows } = await db.from("iimb_watch_state").select("key, value").in("key", PAGES.map((p) => p.id));
  const state = Object.fromEntries((rows || []).map((r) => [r.key, r.value || {}]));
  const now = new Date().toISOString();
  const changes = [];
  const baseline = [];

  for (const p of PAGES) {
    const html = await get(p.url);
    if (!html) continue;
    const prev = state[p.id];
    if (p.kind === "links") {
      const cur = links(html, p.url);
      if (!prev || !prev.links) { baseline.push({ p, count: Object.keys(cur).length }); }
      else {
        const added = Object.entries(cur).filter(([h]) => !(h in prev.links));
        const items = added.map(([h, t]) => ({ href: h, text: t, hot: HOT.test(t) || HOT.test(h) })).filter((i) => p.all || i.hot);
        if (items.length) changes.push({ p, items });
      }
      await db.from("iimb_watch_state").upsert({ key: p.id, value: { links: { ...(prev?.links || {}), ...cur } }, updated_at: now });
    } else {
      const text = strip(html).slice(0, 20000);
      if (!prev || prev.text == null) baseline.push({ p, count: text.length });
      else if (prev.text !== text) {
        const words = new Set(prev.text.split(" "));
        const fresh = text.split(" ").filter((w) => !words.has(w)).join(" ").slice(0, 600);
        if (HOT.test(fresh)) changes.push({ p, items: [{ href: p.url, text: fresh, hot: true }] }); // ignore cosmetic changes
      }
      await db.from("iimb_watch_state").upsert({ key: p.id, value: { text }, updated_at: now });
    }
  }

  let emailed = false;
  if (process.env.SMTP_PASS && (changes.length || baseline.length)) {
    const hot = changes.some((c) => c.items.some((i) => i.hot));
    const subject = changes.length
      ? `${hot ? "🚨 " : ""}IIMB UG update: ${hot ? "response sheet / answer key / result link posted" : "new link on IIMB's UG pages"}`
      : "IIMB UG watcher is on: you will get an email the moment IIMB posts the response sheet or answer key";
    const body = changes.length
      ? changes.map((c) => `<h3 style="margin:16px 0 6px;">${esc(c.p.name)}</h3><ul>${c.items.map((i) => `<li style="margin-bottom:6px;">${i.hot ? "<b style=\"color:#c2410c\">[important]</b> " : ""}${esc(i.text || "(no link text)")}<br/><a href="${esc(i.href)}">${esc(i.href)}</a></li>`).join("")}</ul><p><a href="${esc(c.p.url)}">Open the page</a></p>`).join("")
        + `<p style="margin-top:18px;">Next: send the official answer key to Claude to load it into the IIM-B UG calculator, then email the students on the alerts list.</p>`
      : `<p>The watcher checks these pages every 10 minutes and emails you once for every new link or notice:</p><ul>${baseline.map((b) => `<li>${esc(b.p.name)}: <a href="${esc(b.p.url)}">${esc(b.p.url)}</a></li>`).join("")}</ul>`;
    try {
      await mailer().sendMail({ from: { name: "IPM Careers Watcher", address: "info@ipmcareer.com" }, to: TO, subject, html: `<div style="font-family:Arial,sans-serif;max-width:620px;">${body}<p style="color:#888;font-size:12px;">Checked ${esc(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))} IST.</p></div>` });
      emailed = true;
    } catch (e) { console.error("iimb-watch email failed:", e?.message); }
  }
  return res.status(200).json({ checked: PAGES.length, baseline: baseline.map((b) => b.p.id), changes: changes.map((c) => ({ page: c.p.id, items: c.items.length })), emailed });
}
