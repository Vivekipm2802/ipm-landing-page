// /api/og-cat?n=Riya&t=94&v=38&d=26&q=22&p=99.07&y=2026 → 1200×630 scorecard image for link previews
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const num = (v, lo, hi) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const name = String(searchParams.get("n") || "").replace(/[^\p{L} .'-]/gu, "").slice(0, 24);
  const t = Math.round(num(searchParams.get("t"), -70, 204) ?? 0);
  const v = num(searchParams.get("v"), -24, 72), d = num(searchParams.get("d"), -22, 66), q = num(searchParams.get("q"), -22, 66);
  const p = num(searchParams.get("p"), 0, 100);
  const y = String(searchParams.get("y") || "").replace(/\D/g, "").slice(0, 4);
  const secs = [["VARC", v, 72], ["DILR", d, 66], ["QA", q, 66]];

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", background: "linear-gradient(135deg, #0b0b0c 0%, #1a1206 55%, #3a2408 100%)", color: "#f4f1ea" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: "26px", fontWeight: 700, color: "#f9a01b", letterSpacing: "2px" }}><span>{`CAT ${y} · SCORECARD`}</span></div>
          <div style={{ display: "flex", fontSize: "24px", color: "#cfc9bf" }}><span>IPM Careers</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "36px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "40px", color: "#cfc9bf" }}><span>{name ? `${name}'s score` : "My score"}</span></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <span style={{ fontSize: "190px", fontWeight: 800, lineHeight: 1, color: "#f9a01b" }}>{t}</span>
              <span style={{ fontSize: "56px", color: "#9a958c", marginLeft: "12px", marginBottom: "22px" }}>/204</span>
            </div>
          </div>
          {p != null && (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "30px", padding: "16px 24px", borderRadius: "24px", background: "rgba(249,160,27,0.14)", border: "2px solid rgba(249,160,27,0.5)" }}>
              <span style={{ fontSize: "54px", fontWeight: 800, color: "#ffbe5c" }}>{`~${p.toFixed(2)}`}</span>
              <span style={{ fontSize: "22px", color: "#cfc9bf" }}>estimated percentile</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {secs.map(([k, s, max]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 24px", borderRadius: "22px", background: "rgba(236,232,225,0.06)", border: "2px solid rgba(236,232,225,0.12)" }}>
              <span style={{ fontSize: "24px", color: "#9a958c", fontWeight: 700 }}>{k}</span>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <span style={{ fontSize: "56px", fontWeight: 800 }}>{s == null ? "–" : String(Math.round(s))}</span>
                <span style={{ fontSize: "26px", color: "#9a958c", marginLeft: "6px", marginBottom: "8px" }}>{`/${max}`}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: "#9a958c" }}><span>Check yours free: register.ipmcareer.com/cat-score-calculator</span></div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
