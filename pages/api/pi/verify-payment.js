// /pages/api/pi/verify-payment.js — Verify Razorpay payment and mark premium
import crypto from 'crypto';
import { getSupabaseServer } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
    return res.status(400).json({ error: 'Missing payment data' });
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  try {
    const supabase = getSupabaseServer();

    // Update payment record
    await supabase
      .from('pi_payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // Mark user as premium
    await supabase
      .from('pi_users')
      .update({ is_premium: true, updated_at: new Date().toISOString() })
      .eq('email', email);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
