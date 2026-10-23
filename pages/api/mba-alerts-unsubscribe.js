// GET /api/mba-alerts-unsubscribe?t=<token> → stop all deadline emails (one click, from the email footer)
import { catDb } from "../../lib/catPlannerServer";

const page = (title, body) => `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex"/><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0b0c;font-family:Inter,Arial,sans-serif;color:#ece8e1;">
<div style="max-width:420px;padding:28px;text-align:center;border:1px solid rgba(236,232,225,.12);border-radius:18px;background:#121318;">
<div style="font-family:Georgia,serif;font-size:22px;margin-bottom:8px;">${title}</div><div style="color:#cfc9bf;font-size:14px;line-height:1.6;">${body}</div>
<a href="https://register.ipmcareer.com/mba-application-forms" style="display:inline-block;margin-top:16px;color:#f9a01b;font-weight:700;text-decoration:none;">MBA Forms &amp; Deadlines →</a></div></body></html>`;

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  const t = String(req.query.t || "");
  if (!/^[a-f0-9]{24}$/.test(t)) return res.status(400).send(page("Link not valid", "This unsubscribe link looks incomplete. Open it again from the email."));
  try {
    const db = catDb();
    const { data } = await db.from("mba_alert_subscribers").update({ active: false, updated_at: new Date().toISOString() }).eq("token", t).select("id").maybeSingle();
    if (!data) return res.status(404).send(page("Already stopped", "We could not find active alerts for this link."));
    return res.status(200).send(page("Alerts stopped", "You will not get any more MBA deadline emails. Tap the 🔔 on any college to turn them back on."));
  } catch {
    return res.status(500).send(page("Something went wrong", "Please try the link again in a minute."));
  }
}
