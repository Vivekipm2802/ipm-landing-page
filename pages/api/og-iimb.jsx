// /api/og-iimb?n=Riya&t=94&v=21&l=41&q=32&a=81 → 1200×630 scorecard image for WhatsApp / social link previews
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const num = (v, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : null; };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const name = String(searchParams.get("n") || "My").replace(/[^\p{L} .'-]/gu, "").slice(0, 24) || "My";
  const t = num(searchParams.get("t"), -60, 180) ?? 0;
  const v = num(searchParams.get("v"), -15, 45), l = num(searchParams.get("l"), -15, 45), q = num(searchParams.get("q"), -30, 90);
  const a = num(searchParams.get("a"), 0, 100);
  const secs = [["VARC", v, 45], ["LR", l, 45], ["QADI", q, 90]];

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", background: "linear-gradient(135deg, #0b0b0c 0%, #1a1206 55%, #3a2408 100%)", color: "#f4f1ea" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: "26px", fontWeight: 700, color: "#f9a01b", letterSpacing: "2px" }}><span>IIM BANGALORE UG · SCORECARD</span></div>
          <div style={{ display: "flex", fontSize: "24px", color: "#cfc9bf" }}><span>IPM Careers</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "36px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "40px", color: "#cfc9bf" }}><span>{name === "My" ? "My score" : `${name}'s score`}</span></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <span style={{ fontSize: "190px", fontWeight: 800, lineHeight: 1, color: "#f9a01b" }}>{t}</span>
              <span style={{ fontSize: "56px", color: "#9a958c", marginLeft: "12px", marginBottom: "22px" }}>/180</span>
            </div>
          </div>
          {a != null && (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "30px", padding: "16px 24px", borderRadius: "24px", background: "rgba(249,160,27,0.14)", border: "2px solid rgba(249,160,27,0.5)" }}>
              <span style={{ fontSize: "54px", fontWeight: 800, color: "#ffbe5c" }}>{a}%</span>
              <span style={{ fontSize: "22px", color: "#cfc9bf" }}>accuracy</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {secs.map(([k, s, max]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", flex: 1, padding: "18px 24px", borderRadius: "22px", background: "rgba(236,232,225,0.06)", border: "2px solid rgba(236,232,225,0.12)" }}>
              <span style={{ fontSize: "24px", color: "#9a958c", fontWeight: 700 }}>{k}</span>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <span style={{ fontSize: "56px", fontWeight: 800 }}>{s ?? "–"}</span>
                <span style={{ fontSize: "26px", color: "#9a958c", marginLeft: "6px", marginBottom: "8px" }}>/{max}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: "#9a958c" }}><span>Check yours free: register.ipmcareer.com/response-v1</span></div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
