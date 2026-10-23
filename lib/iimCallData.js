// IIM shortlisting criteria for the IIM Call Predictor.
// Every number below comes from the IIM's own admission policy (status "official"), except IIM Rohtak
// (official PDF is a scanned image; figures as reported by Careers360). Read 23 Oct 2026.
// min: minimum CAT percentiles to be considered for a PI shortlist. o = overall, v = VARC, d = DILR, q = QA.
// callCutoff: the actual PI-shortlist percentiles the IIM published for last year (only JAP did).

const m = (o, v, d, q) => ({ o, v, d, q });

export const CATEGORIES = [
  { key: "GEN", label: "General" },
  { key: "EWS", label: "EWS" },
  { key: "OBC", label: "NC-OBC" },
  { key: "SC", label: "SC" },
  { key: "ST", label: "ST" },
  { key: "PWD", label: "PwD" },
];

const JAP_MIN = { GEN: m(90, 75, 75, 75), EWS: m(75, 60, 60, 60), OBC: m(75, 60, 60, 60), SC: m(50, 45, 45, 45), ST: m(30, 25, 25, 25), PWD: m(30, 25, 25, 25) };
const JAP_CALL = { GEN: m(95.25, 75, 75, 75), EWS: m(89, 60, 60, 60), OBC: m(88.5, 60, 60, 60), SC: m(75, 45, 45, 45), ST: m(44, 25, 25, 25), PWD: m(30, 25, 25, 25) };
const JAP_ACAD = { GEN: { x: 60, xii: 60, ug: 50 }, EWS: { x: 60, xii: 60, ug: 50 }, OBC: { x: 60, xii: 60, ug: 50 }, SC: { x: 55, xii: 55, ug: 45 }, ST: { x: 55, xii: 55, ug: 45 }, PWD: { x: 45, xii: 45, ug: 45 } };
const JAP_URLS = ["https://www.iimtrichy.ac.in/en/pgpm-admin-criteria", "https://iimranchi.ac.in/media/2026/04/Admission-Criteria-2026.pdf", "https://jap2026.iimraipur.edu.in/admission-policy"];
const JAP_NOTE = "Shortlisted through the Joint Admission Process (JAP) with IIM Trichy, Ranchi, Raipur and Kashipur, by CAT percentile within category. Last year's call cutoffs were published by IIM Trichy and IIM Ranchi.";

const CAP_MIN = { GEN: m(90, 65, 65, 65), EWS: m(75, 50, 50, 50), OBC: m(75, 45, 45, 45), SC: m(60, 40, 40, 40), ST: m(38, 25, 30, 30), PWD: m(38, 25, 30, 30) };
const CAP_MIN_F = { GEN: m(85, 65, 65, 65), EWS: m(70, 50, 50, 50), OBC: m(70, 45, 45, 45), SC: m(55, 40, 40, 40), ST: m(35, 25, 30, 30), PWD: m(35, 25, 30, 30) };
const CAP_URL = "https://cap2026.iimj.ac.in/public/uploads/document/CAP-2026-cut-off_policy_MBA.pdf";
const CAP_NOTE = "Shortlisted through the Common Admission Process (CAP) with IIM Bodh Gaya, Jammu and Sirmaur, by CAT percentile and intake. The real cutoff can be higher than the minimum.";

export const IIMS = [
  {
    id: "ahmedabad", name: "IIM Ahmedabad", policy: "2027-29", status: "official",
    urls: ["https://www.iima.ac.in/sites/default/files/2026-09/AdmissionProcedure_PGP_1009_2026.pdf"],
    min: { GEN: m(95, 85, 85, 85), EWS: m(95, 85, 85, 85), OBC: m(90, 80, 80, 80), SC: m(85, 75, 75, 75), ST: m(75, 65, 65, 65), PWD: m(85, 75, 75, 75) },
    acad: { ug: 50, ugReserved: 45 },
    shortlist: [["CAT percentile", 65], ["Academics, work-ex, gender (AR)", 35]],
    note: "Composite is then compared within your graduation discipline. PwD minimum shown is for General/EWS-PwD.",
    profile: "iima",
  },
  {
    id: "bangalore", name: "IIM Bangalore", policy: "2027-29", status: "official",
    urls: ["https://www.iimb.ac.in/sites/default/files/inline-files/pgp-admissions-process-2027.pdf"],
    min: { GEN: m(85, 80, 75, 75), EWS: m(75, 70, 65, 65), OBC: m(75, 70, 65, 65), SC: m(70, 65, 60, 60), ST: m(65, 55, 55, 55), PWD: m(60, 50, 50, 50) },
    acad: { ug: 50, ugReserved: 45 },
    shortlist: [["CAT (VARC 19, DILR 21, QA 15)", 55], ["10th", 10], ["12th", 10], ["Graduation", 10], ["Work-ex or CA/CS/ICWA", 10], ["Gender diversity", 5]],
    note: "The 2027-29 document refers to a pre-set minimum; the table shown is the one IIM B published for CAT 2025. Positive raw score needed in every section.",
  },
  {
    id: "calcutta", name: "IIM Calcutta", policy: "2027-29", status: "official",
    urls: ["https://www.iimcal.ac.in/programs/pgp/admission/admission-policy/admission-procedure-for-domestic-candidates"],
    min: { GEN: m(85, 80, 80, 75), EWS: m(75, 70, 65, 65), OBC: m(75, 70, 65, 65), SC: m(70, 65, 60, 60), ST: m(65, 55, 55, 55), PWD: m(55, 45, 45, 45) },
    acad: { ug: 50, ugReserved: 45 },
    shortlist: [["CAT score", 56], ["12th", 15], ["10th", 10], ["Gender diversity", 4]],
    note: "Non-negative raw score needed in every section. Graduation marks and work-ex are not used at the shortlist stage.",
    profile: "iimc",
  },
  {
    id: "lucknow", name: "IIM Lucknow", policy: "2026-28", status: "official",
    urls: ["https://www.iiml.ac.in/sites/default/files/2025-07/IIML%20Admission%20Policy%20Batch%202026-2028.pdf"],
    min: { GEN: m(90, 85, 85, 85), EWS: m(82, 77, 77, 77), OBC: m(82, 77, 77, 77), SC: m(65, 55, 55, 55), ST: m(60, 50, 50, 50), PWD: m(60, 50, 50, 50) },
    shortlist: [["CAT score", 60], ["12th (vs your board)", 10], ["Graduation (vs your discipline)", 10], ["Work-ex", 10], ["Non-engineering degree", 5], ["Gender diversity", 5]],
    fact: "Last year IIM Lucknow shortlisted 1,268 General-category candidates out of 152,584 General-category applicants (IIM Lucknow RTI disclosure).",
  },
  {
    id: "kozhikode", name: "IIM Kozhikode", policy: "2026-28", status: "official",
    urls: ["https://iimk.ac.in/uploads/programsmenu/PGP%20Admissions%20Policy%2026-28_20251209102809.pdf"],
    min: { GEN: m(85, 75, 75, 75), EWS: m(75, 65, 65, 65), OBC: m(75, 65, 65, 65), SC: m(65, 55, 55, 55), ST: m(55, 45, 45, 45), PWD: m(55, 45, 45, 45) },
    acad: { x: 60, xii: 60, xReserved: 55, xiiReserved: 55, ug: 60 },
    shortlist: [["CAT (3 sections equally)", 50], ["12th (vs board topper)", 20], ["10th (vs board topper)", 15], ["Gender (10) or non-engineering degree (5)", 10], ["Work-ex", 5]],
    note: "Positive score needed in every section. Work-ex points peak at 35-36 months.",
  },
  {
    id: "indore", name: "IIM Indore", policy: "2026-28", status: "official",
    urls: ["https://iimidr.ac.in/wp-content/uploads/2025/12/Admissions-Procedure-PGP-2026-28-Batch.pdf", "https://iimidr.ac.in/wp-content/uploads/2026/01/RTI-Information_PGP-PGPHRM_2026.pdf"],
    min: { GEN: m(90, 80, 80, 80), EWS: m(90, 80, 80, 80), OBC: m(80, 70, 70, 70), SC: m(60, 55, 55, 55), ST: m(45, 40, 40, 40), PWD: m(45, 40, 40, 40) },
    acad: { ug: 50, ugReserved: 45 },
    shortlist: [["12th", 25], ["CAT QA", 23], ["CAT VARC", 16], ["CAT DILR", 16], ["10th", 10], ["Diversity", 7], ["Work-ex", 3]],
    fact: "Last year IIM Indore shortlisted 1,817 General-category candidates out of 147,066 General-category applicants (IIM Indore RTI disclosure).",
  },
  {
    id: "mumbai", name: "IIM Mumbai", policy: "2026-28", status: "official",
    urls: ["https://iimmumbai.ac.in/admissions/assets/admission-policy-2026-MBA.pdf"],
    min: { GEN: m(85, 80, 80, 75), EWS: m(75, 70, 65, 65), OBC: m(75, 70, 65, 65), SC: m(70, 65, 60, 60), ST: m(65, 55, 55, 55), PWD: m(55, 45, 45, 45) },
    acad: { ug: 50, ugReserved: 45 },
    shortlist: [["CAT score", 100]],
    note: "Interview shortlist uses CAT score and sectional cutoffs only; academics and work-ex count only in the final selection. Needs a separate IIM Mumbai application.",
  },
  {
    id: "shillong", name: "IIM Shillong", policy: "2026-28", status: "official",
    urls: ["https://www.iimshillong.ac.in/wp-content/uploads/2026/01/PGP-2026-28-Admission-Process.pdf"],
    min: { GEN: m(null, 75, 75, 75), EWS: m(null, 75, 75, 75), OBC: m(null, 75, 75, 75), SC: m(null, 60, 60, 60), ST: m(null, 50, 50, 50), PWD: m(null, 50, 50, 50) },
    shortlist: [["CAT percentile", 65], ["Academic rating (10th, 12th, grad, work-ex)", 35]],
    note: "Sectional minimums only (no overall). IIM Shillong publishes one 'Others' row, applied here to General and NC-OBC. Calls are split by discipline and gender in proportion to CAT takers.",
    profile: "shillong",
  },
  {
    id: "udaipur", name: "IIM Udaipur", policy: "2026-28", status: "official",
    urls: ["https://mba.iimu.ac.in/admissions/"],
    min: { GEN: m(94, 75, 75, 75), EWS: m(81, 55, 55, 55), OBC: m(81, 52, 52, 52), SC: m(66, 45, 45, 45), ST: m(42, 25, 25, 30), PWD: m(42, 25, 25, 30) },
    shortlist: [["CAT score + profile (10th, 12th, grad, work-ex, gender)", null]],
    note: "Separate registration after the CAT result. IIM Udaipur says the cutoffs may be raised or lowered to get the number of calls it needs.",
  },
  { id: "trichy", name: "IIM Tiruchirappalli", policy: "2026-28", status: "official", urls: JAP_URLS, process: "JAP", min: JAP_MIN, callCutoff: JAP_CALL, academics: JAP_ACAD, shortlist: [["CAT percentile (within category)", 100]], note: JAP_NOTE },
  { id: "ranchi", name: "IIM Ranchi", policy: "2026-28", status: "official", urls: JAP_URLS, process: "JAP", min: JAP_MIN, callCutoff: JAP_CALL, academics: JAP_ACAD, shortlist: [["CAT percentile (within category)", 100]], note: JAP_NOTE },
  { id: "raipur", name: "IIM Raipur", policy: "2026-28", status: "official", urls: JAP_URLS, process: "JAP", min: JAP_MIN, callCutoff: JAP_CALL, academics: JAP_ACAD, shortlist: [["CAT percentile (within category)", 100]], note: JAP_NOTE },
  { id: "kashipur", name: "IIM Kashipur", policy: "2026-28", status: "official", urls: JAP_URLS, process: "JAP", min: JAP_MIN, callCutoff: JAP_CALL, academics: JAP_ACAD, shortlist: [["CAT percentile (within category)", 100]], note: JAP_NOTE },
  {
    id: "rohtak", name: "IIM Rohtak", policy: "2026-28", status: "reported",
    urls: ["https://bschool.careers360.com/articles/iim-rohtak-admission-criteria-2026-released-selection-process-cat-2025-cutoff-pi-weightage-fees"],
    min: { GEN: m(97, null, null, null), EWS: m(93, null, null, null), OBC: m(83, null, null, null), SC: m(60, null, null, null), ST: m(50, null, null, null), PWD: m(87, null, null, null) },
    shortlist: [["CAT + diversity", null]],
    note: "Not verified: IIM Rohtak's official policy PDF is a scanned image, so these overall-only cutoffs are as reported by Careers360. Needs a separate IIM Rohtak registration (fee ₹3,095). PwD shown is for PwD-General.",
  },
  {
    id: "amritsar", name: "IIM Amritsar", policy: "2026-28", status: "official",
    urls: ["https://iimamritsar.ac.in/academics/mba/admission"],
    min: { GEN: m(90, 80, 75, 80), EWS: m(90, 77, 75, 80), OBC: m(80, 65, 60, 65), SC: m(55, 52, 50, 55), ST: m(40, 37, 35, 40), PWD: m(40, 37, 35, 40) },
    shortlist: [["CAT", 50], ["Work-ex", 15], ["10th", 10], ["12th", 10], ["Gender diversity", 10], ["Graduation", 5]],
    note: "Positive raw score needed in every section.",
  },
  { id: "bodhgaya", name: "IIM Bodh Gaya", policy: "2026-28", status: "official", urls: [CAP_URL, "https://iimbg.ac.in/wp-content/uploads/2026/01/IIMBG_MBA_Admission-Policy_2026-28.pdf"], process: "CAP", min: CAP_MIN, minFemale: CAP_MIN_F, shortlist: [["CAT percentile and intake", 100]], note: CAP_NOTE },
  { id: "jammu", name: "IIM Jammu", policy: "2026-28", status: "official", urls: [CAP_URL, "https://www.iimj.ac.in/programs/post-graduate-program-pgp/admission-policy.php"], process: "CAP", min: CAP_MIN, minFemale: CAP_MIN_F, shortlist: [["CAT percentile and intake", 100]], note: CAP_NOTE },
  { id: "sirmaur", name: "IIM Sirmaur", policy: "2026-28", status: "official", urls: [CAP_URL, "https://admissions.iimsirmaur.ac.in/mba-admissions-policy-2026"], process: "CAP", min: CAP_MIN, minFemale: CAP_MIN_F, acad: { x: 60, xii: 60, ug: 60, xReserved: 55, xiiReserved: 55, ugReserved: 55 }, shortlist: [["CAT percentile and intake", 100]], note: CAP_NOTE + " IIM Sirmaur also needs 60% in 10th, 12th and graduation (55% reserved)." },
  {
    id: "nagpur", name: "IIM Nagpur", policy: "2026-28", status: "official",
    urls: ["https://www.iimnagpur.ac.in/admissions/mba/admissions-policy/"],
    min: { GEN: m(95, 70, 70, 70), EWS: m(85, 55, 55, 55), OBC: m(85, 55, 55, 55), SC: m(65, 40, 40, 40), ST: m(40, 30, 30, 30), PWD: m(40, 25, 25, 25) },
    shortlist: [["CAT + profile (10th, 12th, grad, work-ex, gender)", null]],
    note: "Positive score needed in every section. Work-ex points peak at 18-24 months.",
  },
  {
    id: "sambalpur", name: "IIM Sambalpur", policy: "2026-28", status: "official",
    urls: ["https://iimsambalpur.ac.in/wp-content/uploads/2026/01/MBA-2026-28-Admission-Policy-1.pdf"],
    min: { GEN: m(90, null, null, null), EWS: m(80, null, null, null), OBC: m(75, null, null, null), SC: m(55, null, null, null), ST: m(40, null, null, null), PWD: m(40, null, null, null) },
    shortlist: [["CAT", 40], ["Work-ex", 20], ["Gender diversity", 5], ["Graduation", 4], ["10th", 3], ["12th", 3]],
    note: "Overall minimum only, plus a positive score in every section. General overall minimum drops to 85 for women and for men with at least a year of work-ex.",
    sambalpurRelax: true,
  },
  {
    id: "visakhapatnam", name: "IIM Visakhapatnam", policy: "2026-28", status: "official",
    urls: ["https://www.iimv.ac.in/programs/pgp/admissions/pgp-adms-adm-prcs-crtra"],
    min: { GEN: m(82, 70, 70, 70), EWS: m(72, 63, 63, 63), OBC: m(72, 63, 63, 63), SC: m(50, 40, 40, 40), ST: m(40, 30, 30, 30), PWD: m(40, 30, 30, 30) },
    shortlist: [["CAT (VARC 18, DILR 14, QA 18)", 50], ["10th", 10], ["12th", 10], ["Graduation", 10], ["Gender diversity", 10], ["Work-ex", 10]],
    note: "You must have chosen IIM Visakhapatnam in the CAT form.",
  },
  {
    id: "guwahati", name: "IIM Guwahati", policy: "2026-28", status: "official",
    urls: ["https://www.iimg.ac.in/admission-process/"],
    min: { GEN: m(85, 75, 75, 75), EWS: m(85, 75, 75, 75), OBC: m(80, 70, 70, 70), SC: m(75, 65, 65, 65), ST: m(65, 55, 55, 55), PWD: m(75, 65, 65, 65) },
    shortlist: [["CAT", 65], ["Academics and work-ex", 35]],
    note: "New IIM, mentored by IIM Ahmedabad; first batch 2026-28. PwD minimum shown is for General/EWS-PwD.",
  },
];

// ── profile points from formulas the IIMs publish with exact bands ───────
const band = (x, rows) => { for (const [min, pts] of rows) if (x >= min) return pts; return 0; };
const IIMA_BAND = (p) => (p > 90 ? 10 : p > 80 ? 8 : p > 70 ? 5 : p > 60 ? 3 : p > 55 ? 2 : 1);

export const PROFILE = {
  iima: {
    label: "IIM Ahmedabad academic rating (AR)", max: 38,
    calc: (p) => {
      const we = p.workex < 12 ? 0 : p.workex <= 36 ? 0.2 * (p.workex - 11) : 5;
      const parts = [["10th", IIMA_BAND(p.x), 10], ["12th", IIMA_BAND(p.xii), 10], ["Graduation", IIMA_BAND(p.ug), 10], ["Work-ex", Math.round(we * 10) / 10, 5], ["Gender diversity", p.gender !== "male" ? 3 : 0, 3]];
      return parts;
    },
  },
  iimc: {
    label: "IIM Calcutta profile points", max: 29,
    calc: (p) => [
      ["10th", band(p.x, [[80, 10], [75, 8], [70, 6], [65, 4], [60, 2]]), 10],
      ["12th", band(p.xii, [[80, 15], [75, 12], [70, 9], [65, 6], [60, 3]]), 15],
      ["Gender diversity", p.gender !== "male" ? 4 : 0, 4],
    ],
  },
  shillong: {
    label: "IIM Shillong academic rating (ARS)", max: 40,
    calc: (p) => [
      ["10th", band(p.x, [[95, 10], [90, 9], [85, 8], [80, 5], [75, 2]]), 10],
      ["12th", band(p.xii, [[95, 10], [90, 9], [85, 8], [80, 5], [75, 2]]), 10],
      ["Graduation", band(p.ug, [[95, 10], [90, 9], [85, 8], [80, 6], [75, 4], [70, 2]]), 10],
      ["Work-ex", p.workex < 7 ? 0 : p.workex < 12 ? 6 : p.workex < 18 ? 12 : p.workex < 24 ? 14 : p.workex < 30 ? 10 : p.workex < 36 ? 6 : p.workex < 42 ? 2 : 0, 14],
    ],
  },
};

const reserved = (cat) => ["SC", "ST", "PWD"].includes(cat);

// ── evaluate one IIM for one candidate ──────────────────────────────────
export function evaluate(iim, p) {
  const cat = p.category || "GEN";
  let min = { ...(iim.min[cat] || iim.min.GEN) };
  if (iim.minFemale && p.gender !== "male") min = { ...(iim.minFemale[cat] || min) };
  if (iim.sambalpurRelax && cat === "GEN" && (p.gender !== "male" || p.workex >= 12)) min.o = 85;
  const call = iim.callCutoff ? iim.callCutoff[cat] : null;

  // academics
  const acadFails = [];
  const a = iim.academics ? iim.academics[cat] : null;
  if (a) {
    if (p.x != null && p.x < a.x) acadFails.push(`10th below ${a.x}%`);
    if (p.xii != null && p.xii < a.xii) acadFails.push(`12th below ${a.xii}%`);
    if (p.ug != null && p.ug < a.ug) acadFails.push(`graduation below ${a.ug}%`);
  } else if (iim.acad) {
    const r = reserved(cat);
    const need = { x: r ? iim.acad.xReserved ?? iim.acad.x : iim.acad.x, xii: r ? iim.acad.xiiReserved ?? iim.acad.xii : iim.acad.xii, ug: r ? iim.acad.ugReserved ?? iim.acad.ug : iim.acad.ug };
    if (need.x && p.x != null && p.x < need.x) acadFails.push(`10th below ${need.x}%`);
    if (need.xii && p.xii != null && p.xii < need.xii) acadFails.push(`12th below ${need.xii}%`);
    if (need.ug && p.ug != null && p.ug < need.ug) acadFails.push(`graduation below ${need.ug}%`);
  }

  const prof = iim.profile ? PROFILE[iim.profile] : null;
  const parts = prof && p.x != null ? prof.calc(p) : null;
  const profile = parts ? { label: prof.label, max: prof.max, total: Math.round(parts.reduce((s, x) => s + x[1], 0) * 10) / 10, parts } : null;

  const hasPct = p.o != null;
  if (!hasPct) return { iim, min, call, acadFails, profile, status: acadFails.length ? "acad" : "target" };

  const gaps = [];
  if (min.o != null && p.o < min.o) gaps.push(`overall ${min.o}`);
  [["v", "VARC"], ["d", "DILR"], ["q", "QA"]].forEach(([k, l]) => { if (min[k] != null && p[k] != null && p[k] < min[k]) gaps.push(`${l} ${min[k]}`); });
  if (gaps.length || acadFails.length) return { iim, min, call, acadFails, profile, gaps, status: "below" };

  if (call) {
    const above = p.o >= call.o && ["v", "d", "q"].every((k) => call[k] == null || p[k] == null || p[k] >= call[k]);
    return { iim, min, call, acadFails, profile, gaps, status: above ? "aboveCall" : "belowCall", margin: Math.round((p.o - call.o) * 100) / 100 };
  }
  const margins = [min.o != null ? p.o - min.o : null, ...["v", "d", "q"].map((k) => (min[k] != null && p[k] != null ? p[k] - min[k] : null))].filter((x) => x != null);
  const least = margins.length ? Math.min(...margins) : 0;
  return { iim, min, call, acadFails, profile, gaps, status: least >= 5 ? "comfortable" : "clears", margin: Math.round(((min.o != null ? p.o - min.o : least)) * 100) / 100 };
}

export const STATUS = {
  aboveCall: { label: "Above last year’s call cutoff", tone: "good", rank: 0 },
  comfortable: { label: "Clears minimum by 5+ points", tone: "good", rank: 1 },
  clears: { label: "Clears minimum, under 5 points spare", tone: "warn", rank: 2 },
  belowCall: { label: "Clears the minimum, below last year’s call cutoff", tone: "warn", rank: 3 },
  below: { label: "Below the minimum", tone: "bad", rank: 4 },
  acad: { label: "Academic minimum not met", tone: "bad", rank: 5 },
  target: { label: "Minimum to aim for", tone: "info", rank: 1 },
};
