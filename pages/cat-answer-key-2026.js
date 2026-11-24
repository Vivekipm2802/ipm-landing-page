import Link from "next/link";
import CatSheetLanding from "../components/CatSheetLanding";
import s from "./CatPlanner.module.css";

const FAQS = [
  { q: "When will the CAT 2026 answer key be released?", a: "The IIMs have not announced the date yet. Last year the provisional answer key for CAT 2025 came out with the response sheet on 4 December 2025, four days after the 30 November exam. CAT 2026 is on 29 November 2026, so expect the provisional key in the first week of December 2026." },
  { q: "How do I check my score with the CAT answer key?", a: "Paste your CAT 2026 response sheet link into the IPM Careers score calculator. It matches every answer against the answer key and gives your VARC, DILR, QA and total out of 204, with correct, wrong and unattempted counts." },
  { q: "What happens if the answer key changes after objections?", a: "Your saved report link on IPM Careers re-scores itself with the final official key once it is released, so you do not need to check again." },
  { q: "How do I raise an objection to the CAT answer key?", a: "Objections are raised on the CAT website during the window announced with the provisional key. For CAT 2025 the window ran from 8 to 10 December 2025 and the fee was ₹1,500 per question, refunded only if the objection was accepted. Check the CAT 2026 notice for this year's dates and fee." },
  { q: "Does the answer key give my percentile?", a: "No. The answer key only tells you which answers are correct, so you can work out your raw score. Percentiles come with the result, after the IIMs normalise scores across slots. For an estimate, use the CAT percentile predictor." },
  { q: "Is there negative marking for TITA questions?", a: "No. A wrong TITA (type in the answer) question gets 0. Only a wrong MCQ costs 1 mark." },
];

export default function CatAnswerKey2026() {
  return (
    <CatSheetLanding
      path="/cat-answer-key-2026"
      pageTitle="CAT Answer Key 2026"
      seoTitle="CAT Answer Key 2026: Release Date, Objections & Score Check"
      seoDesc="CAT 2026 answer key: expected release date, how objections work, and a free calculator that checks your response sheet against the key for VARC, DILR, QA and total out of 204."
      h1="CAT Answer Key 2026"
      sub="When the key comes out, how objections work, and your score checked against it in one minute."
      statusLine="Status: awaited. Expected with the response sheet in the first week of December 2026."
      alertTitle="Get an email the minute the answer key is out"
      alertText="We email you as soon as the IIMs release the CAT 2026 answer key, with a 1-minute score check, then the final key and result."
      keywords="CAT answer key 2026, CAT 2026 answer key, CAT answer key release date, CAT provisional answer key, CAT answer key objection, CAT 2026 answer key slot 1, CAT 2026 answer key slot 2, CAT 2026 answer key slot 3, CAT score calculator"
      faqs={FAQS}
    >
      <h2>CAT answer key 2026: key dates</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Event</th><th>CAT 2026</th><th>Last year (CAT 2025)</th></tr></thead>
          <tbody>
            <tr><td>Exam</td><td>29 Nov 2026</td><td>30 Nov 2025</td></tr>
            <tr><td>Provisional answer key + response sheet</td><td>Awaited (first week of Dec expected)</td><td>4 Dec 2025</td></tr>
            <tr><td>Objection window</td><td>Awaited</td><td>8 to 10 Dec 2025 (₹1,500 per question)</td></tr>
            <tr><td>Final answer key and result</td><td>Awaited</td><td>December 2025</td></tr>
          </tbody>
        </table>
      </div>

      <h2>How the CAT answer key works</h2>
      <p>The IIMs first publish a provisional answer key, slot by slot, together with each candidate's response sheet. Candidates can challenge any answer during the objection window. After reviewing the objections, the IIMs fix the final key, which is used for the result. Questions can be dropped or have their answers changed at this stage.</p>

      <h2>Check your score against the key</h2>
      <p>You do not need to tally answers by hand. Paste your response sheet link in the box above and the <Link href="/cat-score-calculator">CAT score calculator</Link> applies the key: +3 for each correct answer, -1 for each wrong MCQ and 0 for a wrong TITA or an unattempted question. Your report link updates on its own when the final key is out.</p>

      <h2>After the answer key</h2>
      <p>Estimate your percentile with the <Link href="/cat-percentile-predictor">CAT percentile predictor</Link>, check which IIMs your profile clears with the <Link href="/iim-call-predictor">IIM call predictor</Link>, and do not miss <Link href="/mba-application-forms">MBA forms that close in December</Link>.</p>
    </CatSheetLanding>
  );
}
