// MBA deadline alerts: what is due today, and the email. Server only.
import nodemailer from "nodemailer";
import { MBA_FORMS, computeStatus, fmtDate } from "./mbaForms";

export const SITE = "https://register.ipmcareer.com";
const DAY = 86400000;

export function todayIST(now = Date.now()) {
  return new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
const daysBetween = (fromDate, toDate) => Math.round((new Date(`${toDate}T00:00:00Z`) - new Date(`${fromDate}T00:00:00Z`)) / DAY);

// Every date a student should be reminded about for one form: rounds (not exam days) + the last date
export function reminderDates(f) {
  const out = [];
  (f.rounds || []).forEach((r) => {
    if (r.date && !/exam|test \d|window ends/i.test(r.label)) out.push({ date: r.date, label: r.label });
  });
  if (f.deadline && !out.some((x) => x.date === f.deadline)) out.push({ date: f.deadline, label: "Last date" });
  return out;
}

// Items due today: { form, kind: 'd7'|'d1', date, label, days } ; 7-day window also fires at 6 days, 1-day at 0 days (a missed run catches up)
export function dueToday(today) {
  const items = [];
  for (const f of MBA_FORMS) {
    for (const r of reminderDates(f)) {
      const d = daysBetween(today, r.date);
      if (d === 7 || d === 6) items.push({ form: f, kind: "d7", date: r.date, label: r.label, days: d });
      else if (d === 1 || d === 0) items.push({ form: f, kind: "d1", date: r.date, label: r.label, days: d });
    }
  }
  return items;
}

export function isOpenNow(f, now = Date.now()) {
  const k = computeStatus(f, now).key;
  return k === "open" || k === "closing";
}
export function isSoon(f, now = Date.now()) {
  return computeStatus(f, now).key === "soon";
}
export const formById = (id) => MBA_FORMS.find((f) => f.id === id) || null;

let transporter = null;
export function mailer() {
  if (!transporter) {
    transporter = nodemailer.createTransport({ host: "smtp.zeptomail.in", port: 587, secure: false, pool: true, maxConnections: 3, auth: { user: "emailapikey", pass: process.env.SMTP_PASS } });
  }
  return transporter;
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function row(item) {
  const f = item.form;
  const when = item.kind === "open" ? "Applications are now open" : item.days === 0 ? `<b style="color:#ef4444">Today</b> is the ${esc(item.label.toLowerCase())}` : item.days === 1 ? `<b style="color:#f97316">Tomorrow</b>: ${esc(item.label)}` : `<b style="color:#f9a01b">${item.days} days left</b>: ${esc(item.label)}`;
  return `<tr><td style="padding:14px 16px;border-top:1px solid #1e2533;">
    <div style="font-size:16px;font-weight:700;color:#f4f1ea;">${esc(f.name)}</div>
    <div style="font-size:13px;color:#9a958c;margin-top:2px;">${esc(f.programme)}</div>
    <div style="font-size:14px;color:#cfc9bf;margin-top:8px;">${when}${item.date ? ` · ${esc(fmtDate(item.date))}` : ""}</div>
    ${f.fee ? `<div style="font-size:12px;color:#9a958c;margin-top:4px;">Fee: ${esc(f.fee)}</div>` : ""}
    <a href="${esc(f.link)}" style="display:inline-block;margin-top:10px;padding:9px 16px;border-radius:999px;background:#f9a01b;color:#0b0b0c;font-weight:700;font-size:13px;text-decoration:none;">Apply on the official site →</a>
  </td></tr>`;
}

export function buildEmail({ name, items, token }) {
  const first = String(name || "").trim().split(/\s+/)[0] || "there";
  const urgent = items.some((i) => i.kind === "d1");
  const opens = items.filter((i) => i.kind === "open");
  const subject = items.length === 1
    ? items[0].kind === "open" ? `${items[0].form.name}: applications are now open`
      : items[0].days <= 1 ? `${items[0].days === 0 ? "Today" : "Tomorrow"} is the ${items[0].label.toLowerCase()} for ${items[0].form.name}`
      : `${items[0].days} days left: ${items[0].form.name} ${items[0].label.toLowerCase()}`
    : `${urgent ? "⚠️ " : ""}${items.length} MBA deadlines and updates for you`;
  const unsub = `${SITE}/api/mba-alerts-unsubscribe?t=${encodeURIComponent(token)}`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#05070a;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#0f1117;border:1px solid #1e2533;border-radius:18px;overflow:hidden;">
<tr><td style="padding:24px 20px 10px;text-align:center;">
  <img src="${SITE}/whitelogoipm.svg" alt="IPM Careers" height="32" style="margin-bottom:12px;"/>
  <div style="font-family:Georgia,serif;font-size:22px;color:#f4f1ea;">Hi ${esc(first)}, ${opens.length === items.length ? "a form you were waiting for is open" : "your MBA deadline reminder"}</div>
  <div style="font-size:13px;color:#9a958c;margin-top:6px;">From the MBA Forms &amp; Deadlines tracker you follow.</div>
</td></tr>
${items.map(row).join("")}
<tr><td style="padding:16px 20px;border-top:1px solid #1e2533;text-align:center;">
  <a href="${SITE}/mba-application-forms" style="color:#f9a01b;font-size:13px;font-weight:700;text-decoration:none;">See every MBA form and last date →</a>
  <div style="font-size:11px;color:#6b665e;margin-top:12px;line-height:1.5;">Colleges can change dates at any time: always confirm the last date on the official website before you pay.<br/>
  You get this because you turned on deadline alerts on register.ipmcareer.com. <a href="${unsub}" style="color:#9a958c;">Stop all alerts</a></div>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Hi ${first},\n\n${items.map((i) => `${i.form.name}: ${i.kind === "open" ? "applications are now open" : `${i.days === 0 ? "today" : i.days === 1 ? "tomorrow" : `${i.days} days left`} (${i.label}, ${fmtDate(i.date)})`}\nApply: ${i.form.link}`).join("\n\n")}\n\nAll forms: ${SITE}/mba-application-forms\nConfirm dates on the official websites.\nStop alerts: ${unsub}`;
  return { subject, html, text, unsub };
}
