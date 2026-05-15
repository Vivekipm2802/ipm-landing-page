import { getSupabaseServer } from '../../utils/supabaseClient';

const PI_CUTOFFS = { General: 164, EWS: 121, 'NC-OBC': 105, SC: 87, ST: 62, PwD: 60 };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseServer();

  // Fetch all responses — Supabase limits to 1000 per query, so paginate
  let allRows = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('responses')
      .select('name, email, phone, total, sa_score, mcq_score, va_score, category, city, uuid, created_at')
      .order('total', { ascending: false })
      .range(from, from + batchSize - 1);
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  // Segment each student
  const segmented = allRows.map(r => {
    const score = r.total || 0;
    const cat = r.category || 'General';
    const cutoff = PI_CUTOFFS[cat] || PI_CUTOFFS['General'];
    const lowestCutoff = 60; // PwD

    let bucket, action;
    if (score >= cutoff) {
      bucket = '1-PI_QUALIFIER';
      action = 'Pitch PI Batch ₹99 — urgent, PI dates coming';
    } else if (score >= cutoff - 20) {
      bucket = '2-BORDERLINE';
      action = 'Pitch PI Batch as insurance — prepare now in case you qualify';
    } else if (score >= 100) {
      bucket = '3-DROP_YEAR';
      action = 'Nurture for IPMAT 2027 — YouTube, GK capsules, coaching pitch later';
    } else {
      bucket = '4-PARTNER_COLLEGES';
      action = 'Pitch Master\'s Union, UPES, Doon, Alliance via UTM links';
    }

    // Also check if they qualify under ANY category (for PI qualifier override)
    const qualifiesAny = Object.values(PI_CUTOFFS).some(c => score >= c);
    if (qualifiesAny && bucket !== '1-PI_QUALIFIER') {
      bucket = '1-PI_QUALIFIER_OTHER_CAT';
      action = 'May qualify under reserved category — pitch PI Batch';
    }

    return {
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      city: r.city || '',
      category: cat,
      total: score,
      sa_score: r.sa_score || 0,
      mcq_score: r.mcq_score || 0,
      va_score: r.va_score || 0,
      bucket,
      action,
      report_link: `https://register.ipmcareer.com/report/${r.uuid}`,
      created_at: r.created_at || '',
    };
  });

  // Summary
  const summary = {
    total: segmented.length,
    pi_qualifiers: segmented.filter(r => r.bucket.startsWith('1-')).length,
    borderline: segmented.filter(r => r.bucket === '2-BORDERLINE').length,
    drop_year: segmented.filter(r => r.bucket === '3-DROP_YEAR').length,
    partner_colleges: segmented.filter(r => r.bucket === '4-PARTNER_COLLEGES').length,
  };

  return res.status(200).json({ summary, leads: segmented });
}
