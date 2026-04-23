// /hooks/useAuth.js — Supabase Auth hook for PI Prep
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [piUser, setPiUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchPiUser(session.user.email);
        checkAdmin(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchPiUser(session.user.email);
          await checkAdmin(session.user.email);
        } else {
          setUser(null);
          setPiUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchPiUser(email) {
    try {
      const { data, error } = await supabase
        .from('pi_users')
        .select('*')
        .eq('email', email)
        .single();

      if (data) {
        setPiUser(data);
      } else {
        // First login — create user with 1-day trial
        const { data: newUser, error: insertError } = await supabase
          .from('pi_users')
          .insert({
            email,
            name: user?.user_metadata?.full_name || email.split('@')[0],
            avatar_url: user?.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (newUser) setPiUser(newUser);
      }
    } catch (err) {
      console.error('fetchPiUser error:', err);
    }
    setLoading(false);
  }

  async function checkAdmin(email) {
    try {
      const { data } = await supabase
        .from('pi_admins')
        .select('email')
        .eq('email', email)
        .single();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
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
      refreshUser: () => user && fetchPiUser(user.email),
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
