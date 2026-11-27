// One quiet line on every CAT page. Around exam day it points to the exam analysis tool (expected percentile
// from attempts); otherwise to the score calculator. Worked out in the browser so cached pages stay correct.
import { useEffect, useState } from "react";
import Link from "next/link";

const box = { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "6px 14px", margin: "16px 0", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(249,160,27,0.30)", background: "rgba(249,160,27,0.06)", fontSize: ".9rem", color: "#cfc9bf", lineHeight: 1.45 };
const main = { color: "#f9a01b", fontWeight: 700, textDecoration: "none" };
const small = { color: "#9a958c", fontSize: ".8rem" };
const smallLink = { color: "#cfc9bf", textDecoration: "underline", textUnderlineOffset: 3 };

const EXAM_START = new Date("2026-11-28T00:00:00+05:30").getTime(); // day before the exam
const SLOT1_END = new Date("2026-11-29T10:30:00+05:30").getTime();
const ANALYSIS_END = new Date("2026-12-04T00:00:00+05:30").getTime(); // response sheet expected around then

export default function ScoreCheckLink({ style }) {
  const [phase, setPhase] = useState("calc");
  useEffect(() => {
    const now = Date.now();
    if (now >= EXAM_START && now < SLOT1_END) setPhase("before");
    else if (now >= SLOT1_END && now < ANALYSIS_END) setPhase("after");
  }, []);

  if (phase !== "calc") {
    return (
      <div style={{ ...box, ...style }}>
        <span>
          {phase === "before" ? "Writing CAT 2026 on 29 Nov? Right after your slot, " : "Just wrote CAT 2026? "}
          <Link href="/cat-2026-analysis" style={main}>{phase === "before" ? "see your expected percentile →" : "Get your expected percentile from attempts →"}</Link>
        </span>
        <span style={small}>
          <Link href="/cat-2026-analysis" style={smallLink}>Slot-wise analysis</Link>
          {" · "}
          <Link href="/cat-response-sheet-2026" style={smallLink}>Response sheet 2026</Link>
        </span>
      </div>
    );
  }
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
