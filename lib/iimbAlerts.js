// IIM Bangalore UG Test 2026 "notify me" alerts: events and emails. Emails are server only.
export const SITE = "https://register.ipmcareer.com";
export const IIMB_EVENTS = {
  response_sheet: { label: "Response sheet" },
  answer_key: { label: "Official answer key" },
  result: { label: "Result" },
};

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const btn = (href, text) => `<a href="${href}" style="display:inline-block;margin:6px 6px 0 0;background:#f9a01b;color:#0b0b0c;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;">${esc(text)}</a>`;
const btn2 = (href, text) => `<a href="${href}" style="display:inline-block;margin:6px 6px 0 0;border:1px solid #3a3f4b;color:#f4f1ea;padding:11px 16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">${esc(text)}</a>`;
const utm = (path, c) => `${SITE}${path}${path.includes("?") ? "&" : "?"}utm_source=email&utm_medium=iimb_alerts&utm_campaign=${c}`;
const first = (n) => esc(String(n || "").trim().split(/\s+/)[0] || "there");

function shell({ pre, title, body, token }) {
  const unsub = `${SITE}/api/iimb-alerts-unsubscribe?t=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#0b0b0c;font-family:Inter,Arial,sans-serif;color:#ece8e1;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(pre)}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0c;"><tr><td align="center" style="padding:24px 12px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121318;border:1px solid #262a33;border-radius:18px;">
<tr><td style="padding:22px 22px 6px;"><div style="font-size:12px;letter-spacing:2px;font-weight:800;color:#f9a01b;">IIM BANGALORE UG 2026 · IPM CAREERS</div>
<div style="font-family:Georgia,serif;font-size:24px;line-height:1.25;color:#f4f1ea;margin-top:8px;">${title}</div></td></tr>
<tr><td style="padding:6px 22px 22px;font-size:15px;line-height:1.6;color:#cfc9bf;">${body}</td></tr>
</table>
<div style="max-width:560px;font-size:12px;color:#6f6b64;padding:14px 8px;line-height:1.5;">You asked for IIMB UG alerts on register.ipmcareer.com. IPM Careers is not linked to IIM Bangalore; always check ug.iimb.ac.in for official information.<br/><a href="${unsub}" style="color:#9a958c;">Stop these alerts</a></div>
</td></tr></table></body></html>`;
}
const sign = `<p style="margin-top:16px;">All the best,<br/>Team IPM Careers</p>`;

export function iimbWelcome(sub) {
  const body = `<p>Hi ${first(sub.name)},</p><p>Done. We'll email you the minute IIMB releases each of these:</p>
<ul style="padding-left:18px;margin:0 0 12px;"><li>Response sheet, with a 1-minute score check</li><li>Official answer key (your saved report re-scores itself)</li><li>UG Test result (expected 15 Dec 2026, tentative)</li></ul>
<p>Interviews are expected in the 2nd and 3rd week of January 2027, so it is worth starting PI prep early.</p>
${btn(utm("/response-v1", "welcome"), "IIMB UG score calculator")}${btn2(utm("/pi-batch", "welcome"), "PI batch")}${sign}`;
  return { subject: "You're on the list: IIM Bangalore UG alerts are on", html: shell({ pre: "We'll email you when the IIMB UG response sheet, answer key and result are out.", title: "Your IIMB UG alerts are on 🔔", body, token: sub.token }), text: `Hi ${sub.name}, your IIM Bangalore UG alerts are on. Score calculator: ${SITE}/response-v1\nStop alerts: ${SITE}/api/iimb-alerts-unsubscribe?t=${sub.token}` };
}

export function iimbEvent(event, sub) {
  const hi = `<p>Hi ${first(sub.name)},</p>`;
  const E = {
    response_sheet: { subject: "IIMB UG response sheet is out: check your score in 1 minute", pre: "Paste your response sheet link and get QADI, LR, VARC and total.", title: "Your IIMB UG response sheet is out",
      body: `${hi}<p>IIM Bangalore has released the UG Test response sheets. Log in with your IIMB UG credentials, open your response sheet, copy the page link and paste it into our calculator for your QADI, LR and VARC scores, accuracy and rank among students.</p>${btn(utm("/response-v1", "response_sheet"), "Check my IIMB UG score")}${sign}` },
    answer_key: { subject: "IIMB UG official answer key is out: your score is updated", pre: "Your saved report re-scores with the official key.", title: "The IIMB UG official answer key is out",
      body: `${hi}<p>IIM Bangalore has released the official answer key for the UG Test. If you already used our calculator, open your report link again: it now uses the official key. If not, it takes a minute.</p>${btn(utm("/response-v1", "answer_key"), "Check my IIMB UG score")}${btn2(utm("/pi-batch", "answer_key"), "Start PI prep")}${sign}` },
    result: { subject: "IIMB UG Test result is out: next up, the interview", pre: "Check your result on IIMB's portal, then prepare for the January interviews.", title: "The IIMB UG Test result is out",
      body: `${hi}<p>IIM Bangalore has declared the UG Test result. Check yours on the official IIMB UG portal. Interviews are expected in the 2nd and 3rd week of January 2027 and carry 40 of 100 in the final score, as much as the test.</p>${btn(utm("/pi-batch", "result"), "Join the PI batch")}${sign}` },
  }[event];
  if (!E) return null;
  const text = `${E.title}\n\n${E.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n\nStop alerts: ${SITE}/api/iimb-alerts-unsubscribe?t=${sub.token}`;
  return { subject: E.subject, html: shell({ pre: E.pre, title: esc(E.title), body: E.body, token: sub.token }), text };
}
