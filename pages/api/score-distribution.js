import { getSupabaseServer } from '../../utils/supabaseClient';

// Hardcoded IPMAT score distribution estimates (fallback)
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

// Predicted AIR based on database rank:
// - Rank 1-10: show exact rank
// - Rank 11+: show rank × 3
function predictAIRFromRank(rank) {
  if (!rank || rank <= 0) return { rank: null, label: 'N/A' };
  if (rank <= 10) return { rank, label: `AIR ${rank}` };
  const air = rank * 3;
  return { rank: air, label: `AIR ${air}` };
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
  const percentile = estimatePercentile(userScore);

  try {
    const now = Date.now();
    let responses;

    // Use cached data if fresh
    if (cachedDistribution && (now - cacheTimestamp) < CACHE_TTL) {
      responses = cachedDistribution;
    } else {
      const supabase = getSupabaseServer();
      // Fetch all totals to compute rank and distribution
      const { data, error } = await supabase
        .from('responses')
        .select('total')
        .not('total', 'is', null)
        .order('total', { ascending: false });

      if (!error && data && data.length >= 1) {
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

    if (responses && responses.length >= 1) {
      // Calculate rank: position among all students sorted by total descending
      // Students with the same score get the same rank (dense ranking)
      let rank = 1;
      for (let i = 0; i < responses.length; i++) {
        if (responses[i].total > userScore) {
          rank = i + 2; // rank is 1-indexed, and this student is after all who scored higher
        } else {
          rank = i + 1;
          break;
        }
        if (i === responses.length - 1) {
          rank = responses.length + 1; // user scored lower than everyone
        }
      }

      const air = predictAIRFromRank(rank);

      // Build distribution
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
        dbRank: rank,
        isRealData: true, sampleSize: responses.length,
      });
    }

    // Fallback — no data
    return res.status(200).json({
      distribution: ESTIMATED_DISTRIBUTION,
      userBracket: getBracket(userScore), userScore,
      predictedAIR: { rank: null, label: 'N/A' }, percentile,
      totalStudents: 0, studentsAbove: 0,
      dbRank: null,
      isRealData: false, sampleSize: 0,
    });

  } catch (ex) {
    console.error('Score distribution error:', ex);
    return res.status(200).json({
      distribution: ESTIMATED_DISTRIBUTION,
      userBracket: getBracket(userScore), userScore,
      predictedAIR: { rank: null, label: 'N/A' }, percentile,
      totalStudents: 0, studentsAbove: 0,
      dbRank: null,
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
