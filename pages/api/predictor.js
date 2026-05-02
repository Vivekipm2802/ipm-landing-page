// IPMAT Indore Call Predictor — cutoffs from 2025 data (RTI-confirmed + Career Launcher)
// Only colleges that accept IPMAT Indore scores

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { category, sa, va, qa } = req.body;
  const saScore = parseFloat(sa);   // QA Short Answer — out of 60
  const mcqScore = parseFloat(qa);  // QA MCQ — out of 120
  const vaScore = parseFloat(va);   // Verbal Ability — out of 180
  const total = saScore + mcqScore + vaScore; // out of 360

  // ATS formula (used by Sirmaur, Amritsar):
  // 25% × (MCQ/120×100) + 25% × (SA/60×100) + 50% × (VA/180×100)
  const ats =
    0.25 * (mcqScore / 120) * 100 +
    0.25 * (saScore / 60) * 100 +
    0.50 * (vaScore / 180) * 100;

  const cat = (category || "").toLowerCase();
  const colleges = [];

  // ─── 1. IIM Indore ───
  // Must clear ALL THREE sectional cutoffs (2025 RTI-confirmed)
  const indoreCutoffs = {
    gen: { sa: 24, mcq: 28, va: 112 },
    ews: { sa: 16, mcq: 18, va: 87 },
    obc: { sa: 12, mcq: 15, va: 78 },
    sc:  { sa: 12, mcq: 10, va: 65 },
    st:  { sa: 8,  mcq: 6,  va: 48 },
    pwd: { sa: 8,  mcq: 5,  va: 47 },
  };
  const ic = indoreCutoffs[cat];
  if (ic && saScore >= ic.sa && mcqScore >= ic.mcq && vaScore >= ic.va) {
    colleges.push("IIM Indore");
  }

  // ─── 2. IIM Ranchi ───
  // Composite = (total / 360) × 100  (50% VA + 50% QA basis)
  const ranchiComposite = (total / 360) * 100;
  const ranchiCutoffs = {
    gen: 88.5, ews: 69.0, obc: 60.0, sc: 47.5, st: 24.5, pwd: 31.0,
  };
  if (ranchiCutoffs[cat] !== undefined && ranchiComposite >= ranchiCutoffs[cat]) {
    colleges.push("IIM Ranchi");
  }

  // ─── 3. IIM Shillong ───
  // Composite-based shortlisting (IPMAT Indore accepted)
  const shillongComposite = (total / 360) * 100;
  const shillongCutoffs = {
    gen: 86.975, ews: 70.267, obc: 64.042, sc: 29.987, st: 36.798, pwd: 45.257,
  };
  if (shillongCutoffs[cat] !== undefined && shillongComposite >= shillongCutoffs[cat]) {
    colleges.push("IIM Shillong");
  }

  // ─── 4. IIM Sirmaur ───
  // ATS cutoff (4-yr BMS, NOT 5-yr IPM)
  const sirmaurCutoffs = {
    gen: 55, ews: 25, obc: 20, sc: 17, st: 17, pwd: 16,
  };
  if (sirmaurCutoffs[cat] !== undefined && ats >= sirmaurCutoffs[cat]) {
    colleges.push("IIM Sirmaur");
  }

  // ─── 5. IIM Amritsar ───
  // ATS-based shortlisting (safe ATS ~50+ for General)
  const amritsarCutoffs = {
    gen: 50, ews: 35, obc: 30, sc: 20, st: 15, pwd: 15,
  };
  if (amritsarCutoffs[cat] !== undefined && ats >= amritsarCutoffs[cat]) {
    colleges.push("IIM Amritsar");
  }

  // ─── 6. Nirma University ───
  // Uses IIM Indore sectional cutoffs as filter + total ≥ 215/360
  const nirmaTotal = { gen: 215, ews: 180, obc: 160, sc: 140, st: 100, pwd: 100 };
  if (
    ic &&
    saScore >= ic.sa &&
    mcqScore >= ic.mcq &&
    vaScore >= ic.va &&
    nirmaTotal[cat] !== undefined &&
    total >= nirmaTotal[cat]
  ) {
    colleges.push("NIRMA");
  }

  // ─── 7. IIFT Kakinada ───
  // IPMAT 78% weight in composite; estimated IPMAT total thresholds
  const iiftCutoffs = { gen: 250, ews: 210, obc: 200, sc: 170, st: 140, pwd: 140 };
  if (iiftCutoffs[cat] !== undefined && total >= iiftCutoffs[cat]) {
    colleges.push("IIFT");
  }

  // ─── 8. NALSAR Hyderabad ───
  // 75% entrance + 25% PI; estimated IPMAT total thresholds
  const nalsarCutoffs = { gen: 230, ews: 190, obc: 180, sc: 150, st: 120, pwd: 120 };
  if (nalsarCutoffs[cat] !== undefined && total >= nalsarCutoffs[cat]) {
    colleges.push("NALSAR");
  }

  // ─── 9. TAPMI Manipal ───
  // Multi-test acceptance (IPMAT/JIPMAT/JEE/CLAT/SAT); lower bar
  const tapmiCutoffs = { gen: 200, ews: 170, obc: 160, sc: 130, st: 100, pwd: 100 };
  if (tapmiCutoffs[cat] !== undefined && total >= tapmiCutoffs[cat]) {
    colleges.push("TAPMI");
  }

  return res.status(200).json({ colleges });
}
