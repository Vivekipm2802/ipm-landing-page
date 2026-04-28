import { getSupabaseServer } from '../../utils/supabaseClient';

// Hardcoded IPMAT score distribution estimates (based on typical patterns)
// These serve as fallback when real data is insufficient
const ESTIMATED_DISTRIBUTION = {
  '300+': 2,
  '280-300': 5,
  '260-280': 8,
  '240-260': 12,
  '220-240': 18,
  '200-220': 22,
  '180-200': 15,
  '160-180': 10,
  '140-160': 5,
  'Below 140': 3,
};

// Score brackets for bar chart
const BRACKETS = [
  { label: '300+', min: 300, max: 360 },
  { label: '280-300', min: 280, max: 299 },
  { label: '260-280', min: 260, max: 279 },
  { label: '240-260', min: 240, max: 259 },
  { label: '220-240', min: 220, max: 239 },
  { label: '200-220', min: 200, max: 219 },
  { label: '180-200', min: 180, max: 199 },
  { label: '160-180', min: 160, max: 179 },
  { label: '140-160', min: 140, max: 159 },
  { label: 'Below 140', min: 0, max: 139 },
];

// Predicted AIR estimation based on score
function predictAIR(score) {
  // Based on IPMAT historical patterns (~50,000 applicants)
  const totalApplicants = 50000;
  if (score >= 320) return { min: 1, max: 50, label: 'Top 50' };
  if (score >= 300) return { min: 50, max: 200, label: 'Top 200' };
  if (score >= 280) return { min: 200, max: 500, label: '200-500' };
  if (score >= 260) return { min: 500, max: 1200, label: '500-1,200' };
  if (score >= 240) return { min: 1200, max: 2500, label: '1,200-2,500' };
  if (score >= 220) return { min: 2500, max: 5000, label: '2,500-5,000' };
  if (score >= 200) return { min: 5000, max: 10000, label: '5,000-10,000' };
  if (score >= 180) return { min: 10000, max: 18000, label: '10,000-18,000' };
  if (score >= 160) return { min: 18000, max: 28000, label: '18,000-28,000' };
  return { min: 28000, max: totalApplicants, label: '28,000+' };
}

// Percentile estimation
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userScore = parseInt(req.query.score) || 0;

  try {
    const supabase = getSupabaseServer();

    // Get all scores from Supabase
    const { data: responses, error } = await supabase
      .from('responses')
      .select('total')
      .not('total', 'is', null);

    let distribution = {};
    let totalStudents = 0;
    let studentsAbove = 0;

    if (!error && responses && responses.length >= 10) {
      // Use real data — enough sample size
      BRACKETS.forEach(b => { distribution[b.label] = 0; });

      responses.forEach(r => {
        const s = r.total;
        totalStudents++;
        if (s > userScore) studentsAbove++;
        for (const b of BRACKETS) {
          if (s >= b.min && s <= b.max) {
            distribution[b.label]++;
            break;
          }
        }
      });
    } else {
      // Use estimated distribution
      distribution = { ...ESTIMATED_DISTRIBUTION };
      totalStudents = 100; // percentage-based
      // Estimate students above
      let above = 0;
      for (const b of BRACKETS) {
        if (b.min > userScore) {
          above += ESTIMATED_DISTRIBUTION[b.label] || 0;
        } else if (userScore >= b.min && userScore <= b.max) {
          above += Math.round((ESTIMATED_DISTRIBUTION[b.label] || 0) * ((b.max - userScore) / (b.max - b.min + 1)));
        }
      }
      studentsAbove = above;
    }

    // Find user's bracket
    let userBracket = 'Below 140';
    for (const b of BRACKETS) {
      if (userScore >= b.min && userScore <= b.max) {
        userBracket = b.label;
        break;
      }
    }

    const air = predictAIR(userScore);
    const percentile = estimatePercentile(userScore);

    return res.status(200).json({
      distribution,
      userBracket,
      userScore,
      predictedAIR: air,
      percentile,
      totalStudents,
      studentsAbove,
      isRealData: !error && responses && responses.length >= 10,
      sampleSize: responses?.length || 0,
    });
  } catch (ex) {
    console.error('Score distribution error:', ex);
    // Return estimated data on error
    const air = predictAIR(userScore);
    const percentile = estimatePercentile(userScore);
    return res.status(200).json({
      distribution: ESTIMATED_DISTRIBUTION,
      userBracket: 'Below 140',
      userScore,
      predictedAIR: air,
      percentile,
      totalStudents: 100,
      studentsAbove: 0,
      isRealData: false,
      sampleSize: 0,
    });
  }
}
