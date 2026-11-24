import Link from "next/link";
import CatSheetLanding from "../components/CatSheetLanding";
import s from "./CatPlanner.module.css";

const FAQS = [
  { q: "When will the CAT 2026 response sheet be released?", a: "The IIMs have not announced the date yet. CAT 2026 is on Sunday 29 November 2026. Last year the CAT 2025 response sheet and provisional answer key came out on 4 December 2025, four days after the exam, so expect the CAT 2026 response sheet in the first week of December 2026." },
  { q: "How do I download the CAT 2026 response sheet?", a: "Log in at iimcat.ac.in with your CAT user ID and password once the response sheet is released and open the response sheet. It opens from the TCS iON server, so the address starts with https://cdn.digialm.com/ and ends with .html. Save the page, or copy that link." },
  { q: "How do I calculate my CAT score from the response sheet?", a: "Paste your response sheet link into the IPM Careers CAT score calculator. It reads every answer and applies the CAT marking scheme: +3 for a correct answer, -1 for a wrong MCQ and 0 for a wrong TITA or an unattempted question. You get VARC, DILR, QA and a total out of 204 in under a minute." },
  { q: "My response sheet opens inside the portal. How do I get the link?", a: "Press Ctrl + U to view the page source, search for digialm and copy the link that ends with .html. On a phone, use the browser's share or copy-link option on the response sheet page. If that fails, save the page and upload the file in the score calculator." },
  { q: "Is the score from the response sheet my final CAT score?", a: "No. It is your raw score. The IIMs normalise scores across the three slots and then work out percentiles, so the official scaled score and percentile can differ from the raw total." },
  { q: "What is in the CAT response sheet?", a: "Every question you saw, the option or answer you marked, and the question ID. It does not show the correct answer; that comes in the provisional answer key, usually released with the response sheet." },
];

export default function CatResponseSheet2026() {
  return (
    <CatSheetLanding
      path="/cat-response-sheet-2026"
      pageTitle="CAT Response Sheet 2026"
      seoTitle="CAT Response Sheet 2026: Release Date, Download & Score"
      seoDesc="CAT 2026 response sheet: expected release date, how to download it from iimcat.ac.in, and a free calculator that turns your response sheet link into VARC, DILR, QA and total out of 204."
      h1="CAT Response Sheet 2026"
      sub="When it comes out, how to download it, and how to turn it into your exact score in one minute."
      statusLine="Status: awaited. Expected in the first week of December 2026 (last year: 4 Dec)."
      alertTitle="Get an email the minute the response sheet is out"
      alertText="We email you as soon as the IIMs release the CAT 2026 response sheet, with a 1-minute score check, then the answer key and result."
      keywords="CAT response sheet 2026, CAT 2026 response sheet, CAT response sheet release date, CAT response sheet download, how to download CAT response sheet, CAT response sheet link, CAT score from response sheet, CAT 2026 score calculator"
      faqs={FAQS}
    >
      <h2>CAT response sheet 2026: key dates</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Event</th><th>CAT 2026</th><th>Last year (CAT 2025)</th></tr></thead>
          <tbody>
            <tr><td>Exam</td><td>29 Nov 2026</td><td>30 Nov 2025</td></tr>
            <tr><td>Response sheet + provisional answer key</td><td>Awaited (first week of Dec expected)</td><td>4 Dec 2025</td></tr>
            <tr><td>Objection window</td><td>Awaited</td><td>8 to 10 Dec 2025 (₹1,500 per question)</td></tr>
          </tbody>
        </table>
      </div>

      <h2>How to download the CAT 2026 response sheet</h2>
      <ol>
        <li>Go to iimcat.ac.in and log in with your CAT user ID and password.</li>
        <li>Open the response sheet link shown after login.</li>
        <li>The sheet opens from the TCS iON server; its address starts with <b>https://cdn.digialm.com/</b> and ends with <b>.html</b>.</li>
        <li>Copy that link and paste it in the box above, or save the page as HTML and upload it in the <Link href="/cat-score-calculator">score calculator</Link>.</li>
      </ol>

      <h2>CAT 2026 marking scheme</h2>
      <p>68 questions, 204 marks: VARC 24 questions (72 marks), DILR 22 (66) and QA 22 (66). A correct answer is +3, a wrong MCQ is -1, and a wrong TITA answer or an unattempted question is 0.</p>

      <h2>After the response sheet</h2>
      <p>Once you have your raw score, see what it could mean in percentile terms with the <Link href="/cat-percentile-predictor">CAT percentile predictor</Link> or the <Link href="/cat-percentile">marks vs percentile tables</Link>, check which IIMs your profile clears with the <Link href="/iim-call-predictor">IIM call predictor</Link>, and keep an eye on <Link href="/mba-application-forms">MBA form deadlines</Link>, as several close in December.</p>
    </CatSheetLanding>
  );
}
