// CAT score → percentile, from published post-result data (scaled scores reported on actual scorecards).
// Sources:
//   2025 overall & sectional: cracku.in/cat-score-vs-percentile-2026/ and the VARC/DILR/QA 2025 pages (compiled
//   from student scorecards after the result; cross-checked with iquanta.in score-vs-percentile trend).
//   2024: cracku.in/cat-score-vs-percentile-2024/ (+ iQuanta, Careers360 scorecards).
// The IIMs do not publish a score-to-percentile table; these are estimates and every slot is normalised separately.

export const PATTERN = {
  VARC: { name: "VARC", full: "Verbal Ability & Reading Comprehension", questions: 24, max: 72 },
  DILR: { name: "DILR", full: "Data Interpretation & Logical Reasoning", questions: 22, max: 66 },
  QA: { name: "QA", full: "Quantitative Ability", questions: 22, max: 66 },
};
export const MAX_TOTAL = 204;
export const APPEARED = { 2025: 258000, 2024: 293000 }; // reported (Careers360 / Business Today citing IIM releases)

// [score, percentile] pairs, ascending
export const CURVES = {
  2025: {
    overall: [[20, 55], [23, 60], [26, 65], [29.5, 70], [33, 75], [38, 80], [44.2, 85], [51.5, 90], [62.3, 95], [70, 97], [76, 98], [84.8, 99], [93, 99.5], [111.48, 99.9], [118.37, 99.95], [132.79, 99.99]],
    VARC: [[-8.46, 1], [-6.3, 5], [-3.26, 10], [0.76, 20], [3.84, 30], [5.89, 40], [8.83, 50], [9.94, 55], [11.02, 60], [12.98, 65], [14.31, 70], [17.04, 75], [19.21, 80], [22.12, 85], [26.18, 90], [32.52, 95], [36.33, 97], [38.42, 98], [42.77, 99], [46.48, 99.5], [53.01, 99.9], [54.6, 99.95], [60.34, 99.99]],
    DILR: [[-9.05, 1], [-6.4, 5], [-4.1, 10], [-1.36, 20], [0.47, 30], [2.3, 40], [4.12, 50], [4.87, 55], [5.95, 60], [6.91, 65], [8.25, 70], [10.5, 75], [11.63, 80], [13.88, 85], [17.26, 90], [21.53, 95], [24.22, 97], [26.85, 98], [29.71, 99], [33.49, 99.5], [41.47, 99.9], [43.41, 99.95], [50.77, 99.99]],
    QA: [[-7.11, 1], [-5.03, 5], [-3.01, 10], [-0.79, 20], [0.81, 30], [2.22, 40], [3.68, 50], [4.35, 55], [5.33, 60], [6.36, 65], [7.44, 70], [9.41, 75], [10.36, 80], [12.58, 85], [14.65, 90], [18.96, 95], [21.85, 97], [23.9, 98], [27.08, 99], [31.22, 99.5], [39.02, 99.9], [42.84, 99.95], [48.83, 99.99]],
  },
  2024: {
    overall: [[19.5, 60], [25.3, 70], [37, 75], [44, 80], [49, 85], [58, 90], [64, 93], [70, 95], [78.97, 97], [95.13, 99], [103.97, 99.5], [127, 99.9]],
    VARC: [[15.6, 75], [18.2, 80], [20.42, 85], [24, 90], [30, 95], [33.54, 97], [40.3, 99], [44, 99.5], [55, 99.9]],
    DILR: [[14.95, 75], [17, 80], [19.5, 85], [22.5, 90], [27, 95], [30.8, 97], [37.8, 99], [41.4, 99.5], [50.1, 99.9]],
    QA: [[9.92, 75], [11.6, 80], [13.7, 85], [17, 90], [22, 95], [25, 97], [33, 99], [36.5, 99.5], [45, 99.9]],
  },
};

// Linear interpolation; returns { pct, below, above } where below/above flag scores outside the data
export function scoreToPct(curve, score) {
  if (!curve || score == null || Number.isNaN(score)) return null;
  const first = curve[0], last = curve[curve.length - 1];
  if (score < first[0]) return { pct: first[1], below: true };
  if (score >= last[0]) return { pct: last[1], above: true };
  for (let i = 1; i < curve.length; i++) {
    const [s1, p1] = curve[i - 1], [s2, p2] = curve[i];
    if (score <= s2) return { pct: p1 + ((score - s1) / (s2 - s1)) * (p2 - p1) };
  }
  return { pct: last[1] };
}

export function pctToScore(curve, pct) {
  for (let i = 1; i < curve.length; i++) {
    const [s1, p1] = curve[i - 1], [s2, p2] = curve[i];
    if (pct <= p2) return s1 + ((pct - p1) / (p2 - p1)) * (s2 - s1);
  }
  return null;
}

const round2 = (x) => Math.round(x * 100) / 100;

// One estimate per data year, plus the combined range
export function estimate(key, score) {
  const a = scoreToPct(CURVES[2025][key], score);
  const b = scoreToPct(CURVES[2024][key], score);
  const vals = [a, b].filter((x) => x && !x.below && !x.above).map((x) => x.pct);
  const main = a || b;
  return {
    y2025: a ? { ...a, pct: round2(a.pct) } : null,
    y2024: b ? { ...b, pct: round2(b.pct) } : null,
    low: vals.length ? round2(Math.min(...vals)) : main ? round2(main.pct) : null,
    high: vals.length ? round2(Math.max(...vals)) : main ? round2(main.pct) : null,
    main: main ? round2(main.pct) : null,
    below: Boolean(a?.below),
    above: Boolean(a?.above),
  };
}

export function predictAll({ VARC, DILR, QA }) {
  const total = round2((+VARC || 0) + (+DILR || 0) + (+QA || 0));
  const overall = estimate("overall", total);
  const rank = overall.main != null && !overall.below ? Math.max(1, Math.round(((100 - overall.main) / 100) * APPEARED[2025])) : null;
  return { total, overall, VARC: estimate("VARC", +VARC), DILR: estimate("DILR", +DILR), QA: estimate("QA", +QA), rank };
}

// Table rows for "marks needed" content
export const TARGETS = [99.9, 99.5, 99, 98, 97, 95, 90, 85, 80];
// Only real reported points (no interpolation) so published tables never show invented values
export function marksNeeded(year, key, pct) {
  const hit = CURVES[year][key].find(([, p]) => p === pct);
  return hit ? Math.round(hit[0] * 10) / 10 : null;
}
