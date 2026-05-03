// /hooks/useAuth.js — Supabase Auth hook for PI Prep
// Uses server-side /api/pi-auth for pi_users/pi_admins (bypasses RLS)
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [piUser, setPiUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchPiUser(session.user);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchPiUser(session.user);
        } else {
          setUser(null);
          setPiUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchPiUser(authUser) {
    try {
      const res = await fetch('/api/pi-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || null,
          action: 'check',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPiUser(data.piUser || null);
        setIsAdmin(data.isAdmin || false);
      } else {
        console.error('pi-auth API error:', res.status);
      }
    } catch (err) {
      console.error('fetchPiUser error:', err);
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/pi/profile`
          : undefined,
      },
    });
    if (error) console.error('Login error:', error);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPiUser(null);
    setIsAdmin(false);
  }

  // Check if user has active access (premium or in trial)
  function hasAccess() {
    if (!piUser) return false;
    if (piUser.is_premium) return true;
    if (piUser.trial_expires_at) {
      return new Date(piUser.trial_expires_at) > new Date();
    }
    return false;
  }

  function trialTimeLeft() {
    if (!piUser?.trial_expires_at) return null;
    const diff = new Date(piUser.trial_expires_at) - new Date();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  return (
    <AuthContext.Provider value={{
      user,
      piUser,
      isAdmin,
      loading,
      signInWithGoogle,
      signOut,
      hasAccess: hasAccess(),
      trialTimeLeft: trialTimeLeft(),
      isPremium: piUser?.is_premium || false,
      refreshUser: () => user && fetchPiUser(user),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
