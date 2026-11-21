// "X marks in CAT percentile" pages: one page per overall scaled score, from the CAT 2025 and 2024 curves.
// Every number is an estimate: linear interpolation between the score/percentile pairs students reported
// from their scorecards (see lib/catPercentile.js for sources). The bracketing real data points are shown too.
import { CURVES, APPEARED, MAX_TOTAL, scoreToPct } from "./catPercentile";
import { IIMS } from "./iimCallData";

export const MARK_MIN = 20;
export const MARK_MAX = 130;
export const MARKS = Array.from({ length: MARK_MAX - MARK_MIN + 1 }, (_, i) => MARK_MIN + i);
export const marksPath = (m) => `/cat-percentile/${m}-marks`;
export const parseMarksSlug = (slug) => {
  const m = /^(\d{1,3})-marks$/.exec(String(slug || ""));
  const n = m ? Number(m[1]) : NaN;
  return n >= MARK_MIN && n <= MARK_MAX ? n : null;
};

const r2 = (x) => Math.round(x * 100) / 100;

function bracket(curve, m) {
  let lo = null, hi = null;
  for (const [s, p] of curve) {
    if (s <= m) lo = [s, p];
    if (s >= m && !hi) hi = [s, p];
  }
  return { lo, hi };
}

function yearInfo(year, m) {
  const curve = CURVES[year].overall;
  const e = scoreToPct(curve, m);
  if (!e) return null;
  const { lo, hi } = bracket(curve, m);
  return { pct: r2(e.pct), below: Boolean(e.below), above: Boolean(e.above), lo, hi, exact: Boolean(lo && hi && lo[0] === m) };
}

const IIM_GEN = IIMS.filter((i) => i.min.GEN.o != null).map((i) => ({ name: i.name, o: i.min.GEN.o }));

export function marksInfo(m) {
  const y25 = yearInfo(2025, m);
  const y24 = yearInfo(2024, m);
  const main = y25 && !y25.below ? y25.pct : null;
  const rank = main != null ? Math.max(1, Math.round(((100 - main) / 100) * APPEARED[2025])) : null;
  const clears = main != null ? IIM_GEN.filter((i) => i.o <= main).map((i) => i.name) : [];
  return { m, max: MAX_TOTAL, y25, y24, main, rank, clears, iimTotal: IIM_GEN.length, appeared: APPEARED[2025] };
}

export const fmtPct = (p) => (p == null ? "–" : p >= 99.99 ? "99.99+" : p.toFixed(2));
export const fmtN = (n) => Number(n).toLocaleString("en-IN");
