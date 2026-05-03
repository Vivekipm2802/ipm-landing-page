// pages/api/pi-auth.js — Server-side auth check for PI Prep
// Uses service key to bypass RLS on pi_users and pi_admins
import { getSupabaseServer } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, avatar_url, action } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const supabase = getSupabaseServer();

  try {
    if (action === 'check') {
      // Fetch or create pi_user
      const { data: existing, error: selectErr } = await supabase
        .from('pi_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        // Check admin status
        const { data: adminRow } = await supabase
          .from('pi_admins')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        return res.status(200).json({
          piUser: existing,
          isAdmin: !!adminRow,
        });
      }

      // First login — create user with trial
      const { data: newUser, error: insertErr } = await supabase
        .from('pi_users')
        .insert({
          email,
          name: name || email.split('@')[0],
          avatar_url: avatar_url || null,
        })
        .select()
        .single();

      if (insertErr) {
        console.error('pi_users insert error:', insertErr);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.status(200).json({
        piUser: newUser,
        isAdmin: false,
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('pi-auth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
