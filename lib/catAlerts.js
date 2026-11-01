// CAT 2026 "notify me" alerts: events, what the bell says on each date, and the emails. Emails are server only.
export const SITE = "https://register.ipmcareer.com";
export const ADMIT_DATE = "2026-11-04";
export const EXAM_DATE = "2026-11-29";

export const EVENTS = {
  admit_card: { label: "Admit card" },
  response_sheet: { label: "Response sheet" },
  answer_key: { label: "Answer key" },
  result: { label: "Result" },
};

const todayIST = (now = Date.now()) => new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

// What the bell offers today (copy only; every subscriber gets every alert)
export function alertPhase(now = Date.now()) {
  const t = todayIST(now);
  if (t < ADMIT_DATE) return { key: "admit", pill: "Admit card alert", title: "Get CAT 2026 alerts", lead: "Know the minute your admit card is out (4 Nov), then the response sheet, answer key and result." };
  if (t <= EXAM_DATE) return { key: "response", pill: "Score alert", title: "Get your CAT score on day one", lead: "We email you the minute the response sheet and answer key are out, with a 1-minute score check. Then the result." };
  return { key: "result", pill: "Result alert", title: "Get CAT answer key & result alerts", lead: "We email you the minute the answer key and result are out, with your score and IIM call check." };
}

/* ───────────────────────── server only below (emails) ───────────────────────── */

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const btn = (href, text) => `<a href="${href}" style="display:inline-block;margin:6px 6px 0 0;background:#f9a01b;color:#0b0b0c;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;">${esc(text)}</a>`;
const btn2 = (href, text) => `<a href="${href}" style="display:inline-block;margin:6px 6px 0 0;border:1px solid #3a3f4b;color:#f4f1ea;padding:11px 16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">${esc(text)}</a>`;
const utm = (path, campaign) => `${SITE}${path}${path.includes("?") ? "&" : "?"}utm_source=email&utm_medium=cat_alerts&utm_campaign=${campaign}`;

function shell({ pre, title, body, token }) {
  const unsub = `${SITE}/api/cat-alerts-unsubscribe?t=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#0b0b0c;font-family:Inter,Arial,sans-serif;color:#ece8e1;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(pre)}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0c;"><tr><td align="center" style="padding:24px 12px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121318;border:1px solid #262a33;border-radius:18px;">
<tr><td style="padding:22px 22px 6px;"><div style="font-size:12px;letter-spacing:2px;font-weight:800;color:#f9a01b;">CAT 2026 · IPM CAREERS</div>
<div style="font-family:Georgia,serif;font-size:24px;line-height:1.25;color:#f4f1ea;margin-top:8px;">${title}</div></td></tr>
<tr><td style="padding:6px 22px 22px;font-size:15px;line-height:1.6;color:#cfc9bf;">${body}</td></tr>
</table>
<div style="max-width:560px;font-size:12px;color:#6f6b64;padding:14px 8px;line-height:1.5;">You asked for CAT 2026 alerts on register.ipmcareer.com. IPM Careers is not linked to the IIMs; always check iimcat.ac.in for official information.<br/><a href="${unsub}" style="color:#9a958c;">Stop CAT alerts</a></div>
</td></tr></table></body></html>`;
}

const first = (name) => esc(String(name || "").trim().split(/\s+/)[0] || "there");

export function welcomeEmail(sub, cityName) {
  const subject = "You're on the list: CAT 2026 alerts are on";
  const body = `<p>Hi ${first(sub.name)},</p>
<p>Done. We'll email you <b style="color:#f4f1ea;">the minute</b> each of these is out:</p>
<ul style="padding-left:18px;margin:0 0 12px;"><li>CAT 2026 admit card (expected 4 November)</li><li>Response sheet and provisional answer key, with a 1-minute score check</li><li>Final answer key and result, with your IIM call check</li></ul>
<p>Until then, these are free:</p>
${btn(utm("/cat-exam-day-planner", "welcome"), "Plan my exam day")}${cityName ? btn2(utm(`/cat-exam-centres/${encodeURIComponent(sub.city_slug)}`, "welcome"), `CAT centres in ${cityName}`) : ""}${btn2(utm("/iim-call-predictor", "welcome"), "IIM call predictor")}${btn2(utm("/mba-application-forms", "welcome"), "MBA form deadlines")}
<p style="margin-top:16px;">All the best,<br/>Team IPM Careers</p>`;
  return { subject, html: shell({ pre: "We'll email you the minute the CAT admit card, response sheet and result are out.", title: "Your CAT 2026 alerts are on 🔔", body, token: sub.token }), text: `Hi ${sub.name}, your CAT 2026 alerts are on. We'll email you when the admit card, response sheet, answer key and result are out.\nPlan your exam day: ${SITE}/cat-exam-day-planner\nStop alerts: ${SITE}/api/cat-alerts-unsubscribe?t=${sub.token}` };
}

export function eventEmail(event, sub, cityName) {
  const hi = `<p>Hi ${first(sub.name)},</p>`;
  const sign = `<p style="margin-top:16px;">All the best,<br/>Team IPM Careers</p>`;
  if (event === "admit_card") {
    return {
      subject: "CAT 2026 admit card is out: download it now",
      pre: "Download it from iimcat.ac.in, then get your leave-by time and route.",
      title: "Your CAT 2026 admit card is out",
      body: `${hi}<p>The CAT 2026 admit card can now be downloaded from <a href="https://iimcat.ac.in" style="color:#f9a01b;">iimcat.ac.in</a> (log in with your CAT user ID and password).</p>
<p>Then upload it to our free planner. It reads your slot, reporting time and centre, and gives you a leave-by time, route, cab links and phone alarms. The admit card stays on your phone.</p>
${btn(utm("/cat-exam-day-planner", "admit_card"), "Plan my exam day")}${cityName ? btn2(utm(`/cat-exam-centres/${encodeURIComponent(sub.city_slug)}`, "admit_card"), `CAT centres in ${cityName}`) : btn2(utm("/cat-exam-centres", "admit_card"), "Find my CAT centre")}${sign}`,
    };
  }
  if (event === "response_sheet") {
    return {
      subject: "CAT 2026 response sheet is out: check your score in 1 minute",
      pre: "Paste your response sheet link and get your score, sectionals and estimated percentile.",
      title: "Your CAT response sheet is out",
      body: `${hi}<p>The CAT 2026 response sheet is now on <a href="https://iimcat.ac.in" style="color:#f9a01b;">iimcat.ac.in</a>. Open it, copy the link from your browser, and paste it into our calculator for your score, sectional scores and estimated percentile in about a minute.</p>
${btn(utm("/cat-score-calculator", "response_sheet"), "Calculate my CAT score")}${btn2(utm("/cat-percentile-predictor", "response_sheet"), "Percentile predictor")}${sign}`,
    };
  }
  if (event === "answer_key") {
    return {
      subject: "CAT 2026 answer key is out: your score is now final(ish)",
      pre: "Your saved score report updates with the official key.",
      title: "The CAT 2026 answer key is out",
      body: `${hi}<p>The official CAT 2026 answer key is out on <a href="https://iimcat.ac.in" style="color:#f9a01b;">iimcat.ac.in</a>. If you already used our calculator, open your report again: it re-scores with the official key. If not, it takes a minute.</p>
${btn(utm("/cat-score-calculator", "answer_key"), "Check my CAT score")}${btn2(utm("/iim-call-predictor", "answer_key"), "IIM call predictor")}${sign}`,
    };
  }
  if (event === "result") {
    return {
      subject: "CAT 2026 result is out: check which IIMs may call you",
      pre: "Put your percentile into the IIM call predictor, then track MBA form deadlines.",
      title: "The CAT 2026 result is out",
      body: `${hi}<p>The CAT 2026 scorecard is out on <a href="https://iimcat.ac.in" style="color:#f9a01b;">iimcat.ac.in</a>. Put your percentiles into our IIM call predictor to see where you clear the official shortlisting criteria, and keep an eye on the MBA forms still open.</p>
${btn(utm("/iim-call-predictor", "result"), "Check my IIM calls")}${btn2(utm("/mba-application-forms", "result"), "MBA form deadlines")}${sign}`,
    };
  }
  return null;
}

export function renderEvent(event, sub, cityName) {
  const e = eventEmail(event, sub, cityName);
  if (!e) return null;
  const text = `${e.title}\n\n${e.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n\nStop alerts: ${SITE}/api/cat-alerts-unsubscribe?t=${sub.token}`;
  return { subject: e.subject, html: shell({ pre: e.pre, title: esc(e.title), body: e.body, token: sub.token }), text };
}
