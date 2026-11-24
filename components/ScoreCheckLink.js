// One quiet line that points every CAT page at the score calculator (and the response sheet / answer key pages).
import Link from "next/link";

const box = { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "6px 14px", margin: "16px 0", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(249,160,27,0.30)", background: "rgba(249,160,27,0.06)", fontSize: ".9rem", color: "#cfc9bf", lineHeight: 1.45 };
const main = { color: "#f9a01b", fontWeight: 700, textDecoration: "none" };
const small = { color: "#9a958c", fontSize: ".8rem" };
const smallLink = { color: "#cfc9bf", textDecoration: "underline", textUnderlineOffset: 3 };

export default function ScoreCheckLink({ style }) {
  return (
    <div style={{ ...box, ...style }}>
      <span>
        CAT 2026 response sheet out?{" "}
        <Link href="/cat-score-calculator" style={main}>Check your CAT score in 1 minute →</Link>
      </span>
      <span style={small}>
        <Link href="/cat-response-sheet-2026" style={smallLink}>Response sheet 2026</Link>
        {" · "}
        <Link href="/cat-answer-key-2026" style={smallLink}>Answer key 2026</Link>
      </span>
    </div>
  );
}
