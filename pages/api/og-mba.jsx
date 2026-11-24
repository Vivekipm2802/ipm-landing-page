// /api/og-mba → 1200×630 link-preview image for /mba-application-forms, built from today's live data:
// how many forms are open and the next deadlines. Cached for an hour.
import { ImageResponse } from "@vercel/og";
import { MBA_FORMS, computeStatus, fmtDate } from "../../lib/mbaForms";

export const config = { runtime: "edge" };

const DAY = 86400000;
const short = (n) => n.replace(/\s*\(.*?\)/g, "").replace(/ \/ .*$/, "").slice(0, 34);

export default function handler() {
  const now = Date.now();
  const rows = MBA_FORMS.map((f) => ({ ...f, st: computeStatus(f, now) }));
  const open = rows.filter((r) => r.st.key === "open" || r.st.key === "closing").length;
  const closing = rows.filter((r) => r.st.key === "closing").length;
  const next = rows
    .filter((r) => (r.st.key === "open" || r.st.key === "closing") && r.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4)
    .map((r) => ({ name: short(r.name), date: fmtDate(r.deadline).replace(/ \d{4}$/, ""), days: Math.max(0, Math.ceil((new Date(`${r.deadline}T23:59:59+05:30`).getTime() - now) / DAY) - 1) }));

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", padding: "48px 64px 44px", background: "linear-gradient(135deg, #0b0b0c 0%, #17110a 60%, #2e1d07 100%)", color: "#f4f1ea" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "26px", fontWeight: 700, color: "#f9a01b", letterSpacing: "2px" }}>MBA FORMS 2027-29 · LIVE</span>
          <span style={{ fontSize: "24px", color: "#cfc9bf" }}>IPM Careers</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: "26px" }}>
          <span style={{ fontSize: "84px", fontWeight: 800, color: "#f9a01b", lineHeight: 1 }}>{String(closing)}</span>
          <span style={{ fontSize: "48px", fontWeight: 700, marginLeft: "18px" }}>{closing === 1 ? "form closes in 14 days" : "forms close in 14 days"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "24px", gap: "12px" }}>
          {next.map((r) => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 22px", borderRadius: "16px", background: "rgba(236,232,225,0.06)", border: "2px solid rgba(236,232,225,0.10)" }}>
              <span style={{ fontSize: "30px", fontWeight: 700 }}>{r.name}</span>
              <span style={{ fontSize: "28px", color: r.days <= 3 ? "#fbbf24" : "#cfc9bf", fontWeight: 700 }}>{`${r.date} · ${r.days === 0 ? "today" : r.days === 1 ? "1 day left" : `${r.days} days left`}`}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: "24px", color: "#9a958c" }}>
          <span>{`${open} forms open now · free deadline reminders`}</span>
          <span>register.ipmcareer.com/mba-application-forms</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
