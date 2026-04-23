// /pages/api/pi/create-order.js — Create Razorpay order for PI Prep
import Razorpay from 'razorpay';
import { getSupabaseServer } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 9900, // ₹99 in paise
      currency: 'INR',
      receipt: `pi_${Date.now()}`,
      notes: { email, product: 'PI Prep Lifetime Access' },
    });

    // Save order to Supabase
    const supabase = getSupabaseServer();
    await supabase.from('pi_payments').insert({
      user_email: email,
      razorpay_order_id: order.id,
      amount: 99,
      status: 'created',
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
}
