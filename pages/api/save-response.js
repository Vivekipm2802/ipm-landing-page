import { getSupabaseServer } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseServer();
  const row = req.body;

  if (!row || !row.uuid || !row.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error } = await supabase.from('responses').insert(row);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
