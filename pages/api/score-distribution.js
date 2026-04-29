import { getSupabaseServer } from '../../utils/supabaseClient';

// Hardcoded IPMAT score distribution estimates
const ESTIMATED_DISTRIBUTION = {
  '250+': 10, '220-250': 20, '200-220': 25, '170-200': 22,
  '140-170': 15, 'Below 140': 8,
};

const BRACKETS = [
  { label: '250+', min: 250, max: 360 },
  { label: '220-250', min: 220, max: 249 },
  { label: '200-220', min: 200, max: 219 },
  { label: '170-200', min: 170, max: 199 },
  { label: '140-170', min: 140, max: 169 },
  { label: 'Below 140', min: 0, max: 139 },
];

function predictAIR(score) {
  if (score >= 320) return { min: 1, max: 50, label: 'Top 50' };
  if (score >= 300) return { min: 50, max: 200, label: 'Top 200' };
  if (score >= 280) return { min: 200, max: 500, label: '200-500' };
  if (score >= 260) return { min: 500, max: 1200, label: '500-1,200' };
  if (score >= 240) return { min: 1200, max: 2500, label: '1,200-2,500' };
  if (score >= 220) return { min: 2500, max: 5000, label: '2,500-5,000' };
  if (score >= 200) return { min: 5000, max: 10000, label: '5,000-10,000' };
  if (score >= 180) return { min: 10000, max: 18000, label: '10,000-18,000' };
  if (score >= 160) return { min: 18000, max: 28000, label: '18,000-28,000' };
  return { min: 28000, max: 50000, label: '28,000+' };
}

function estimatePercentile(score) {
  if (score >= 320) return 99.9;
  if (score >= 300) return 99.5;
  if (score >= 280) return 98;
  if (score >= 260) return 95;
  if (score >= 240) return 90;
  if (score >= 220) return 82;
  if (score >= 200) return 70;
  if (score >= 180) return 55;
  if (score >= 160) return 38;
  if (score >= 140) return 22;
  return 10;
}

// In-memory cache (persists across warm Vercel invocations)
let cachedDistribution = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache response for 5 min at CDN + browser level
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const userScore = parseInt(req.query.score) || 0;
  const air = predictAIR(userScore);
  const percentile = estimatePercentile(userScore);

  try {
    const now = Date.now();
    let responses;

    // Use cached data if fresh
    if (cachedDistribution && (now - cacheTimestamp) < CACHE_TTL) {
      responses = cachedDistribution;
    } else {
      const supabase = getSupabaseServer();
      // Only fetch the total column, limit to 500 most recent for speed
      const { data, error } = await supabase
        .from('responses')
        .select('total')
        .not('total', 'is', null)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data && data.length >= 10) {
        cachedDistribution = data;
        cacheTimestamp = now;
        responses = data;
      } else {
        responses = null;
      }
    }

    let distribution = {};
    let totalStudents = 0;
    let studentsAbove = 0;

    if (responses && responses.length >= 10) {
      BRACKETS.forEach(b => { distribution[b.label] = 0; });
      responses.forEach(r => {
        const s = r.total;
        totalStudents++;
        if (s > userScore) studentsAbove++;
        for (const b of BRACKETS) {
          if (s >= b.min && s <= b.max) { distribution[b.label]++; break; }
        }
      });
      return res.status(200).json({
        distribution, userBracket: getBracket(userScore), userScore,
        predictedAIR: air, percentile, totalStudents, studentsAbove,
        isRealData: true, sampleSize: responses.length,
      });
    }

    // Fallback to estimates
    return res.status(200).json({
      distribution: ESTIMATED_DISTRIBUTION,
      userBracket: getBracket(userScore), userScore,
      predictedAIR: air, percentile,
      totalStudents: 100, studentsAbove: 0,
      isRealData: false, sampleSize: 0,
    });

  } catch (ex) {
    console.error('Score distribution error:', ex);
    return res.status(200).json({
      distribution: ESTIMATED_DISTRIBUTION,
      userBracket: getBracket(userScore), userScore,
      predictedAIR: air, percentile,
      totalStudents: 100, studentsAbove: 0,
      isRealData: false, sampleSize: 0,
    });
  }
}

function getBracket(score) {
  for (const b of BRACKETS) {
    if (score >= b.min && score <= b.max) return b.label;
  }
  return 'Below 140';
}
