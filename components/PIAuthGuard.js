// /components/PIAuthGuard.js — Wraps PI pages with login + paywall checks
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import styles from '../pages/pi/PIPrep.module.css';

export default function PIAuthGuard({ children }) {
  const router = useRouter();
  const { user, piUser, loading, hasAccess, trialTimeLeft, isPremium, signInWithGoogle } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login gate
  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
          Sign in to access PI Prep
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 8px', lineHeight: 1.6 }}>
          Get access to AI Mock Interviews, SOP Builder, Question Bank, Expert Sessions and more.
        </p>
        <p style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 24px' }}>
          First 24 hours free — then just ₹99 one-time
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', border: '2px solid #e5e7eb', borderRadius: 14,
            background: '#fff', cursor: 'pointer', fontSize: '0.95rem',
            fontWeight: 700, color: '#1a1a2e', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: 32, padding: '16px 20px', background: '#f8fafc', borderRadius: 14, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a2e', marginBottom: 10 }}>What you get:</div>
          {['AI Mock Interview with IIM-style panel', 'SOP Builder with AI review & trap detection', '40+ curated PI questions with model answers', 'Expert booking for 1-on-1 coaching', 'Recorded strategy sessions'].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: '0.82rem', color: '#475569' }}>
              <span style={{ color: '#22c55e' }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Logged in but trial expired and not premium — show paywall
  if (!hasAccess) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏰</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
          Your free trial has ended
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 20px', lineHeight: 1.6 }}>
          Unlock unlimited access to all PI Prep tools for a one-time payment of just ₹99.
        </p>

        <button
          onClick={() => initiatePayment(piUser?.email, router)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 36px', border: 'none', borderRadius: 14,
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            color: '#fff', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
            transition: 'all 0.2s',
          }}
        >
          🔓 Unlock for ₹99
        </button>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 10 }}>
          One-time payment • Lifetime access • Secure Razorpay checkout
        </p>

        <div style={{
          marginTop: 24, padding: '14px 18px', background: '#fef3c7',
          borderRadius: 12, fontSize: '0.82rem', color: '#92400e', textAlign: 'left'
        }}>
          <strong>💡 Can't pay online?</strong> Send ₹99 via UPI to <strong>8299470392@paytm</strong> and
          share the screenshot on <a href="https://wa.me/918299470392?text=Hi%2C%20I%20paid%20%E2%82%B999%20for%20PI%20Prep%20access.%20My%20email%3A%20${encodeURIComponent(piUser?.email || '')}" target="_blank" rel="noopener" style={{ color: '#6c63ff', fontWeight: 700 }}>WhatsApp</a>.
          We'll activate your account within 1 hour.
        </div>
      </div>
    );
  }

  // Has access — show the page + trial banner if applicable
  return (
    <>
      {!isPremium && trialTimeLeft && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fef9c3)',
          borderBottom: '1px solid #fde68a',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#92400e',
        }}>
          ⏳ Free trial: <strong>{trialTimeLeft}</strong> remaining •{' '}
          <span
            onClick={() => initiatePayment(piUser?.email, router)}
            style={{ color: '#6c63ff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Upgrade for ₹99
          </span>
        </div>
      )}
      {children}
    </>
  );
}

// Razorpay payment initiation
async function initiatePayment(email, router) {
  try {
    // 1. Create order on server
    const res = await fetch('/api/pi/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const order = await res.json();
    if (order.error) throw new Error(order.error);

    // 2. Open Razorpay checkout
    const options = {
      key: order.razorpayKeyId,
      amount: order.amount,
      currency: 'INR',
      name: 'IPM Careers',
      description: 'PI Prep — Lifetime Access',
      order_id: order.orderId,
      prefill: { email },
      theme: { color: '#6c63ff' },
      handler: async function (response) {
        // 3. Verify payment on server
        const verifyRes = await fetch('/api/pi/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email,
          }),
        });
        const result = await verifyRes.json();
        if (result.success) {
          alert('Payment successful! You now have lifetime access.');
          router.reload();
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
    };

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => new window.Razorpay(options).open();
      document.body.appendChild(script);
    } else {
      new window.Razorpay(options).open();
    }
  } catch (err) {
    alert('Payment initiation failed: ' + err.message);
  }
}
