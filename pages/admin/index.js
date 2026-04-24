// /pages/admin/index.js — Admin Portal for PI Prep
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../utils/supabaseClient';

const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'users', icon: '👥', label: 'Users' },
  { key: 'questions', icon: '📚', label: 'Questions' },
  { key: 'sessions', icon: '📹', label: 'Sessions' },
  { key: 'experts', icon: '🎓', label: 'Experts' },
  { key: 'admins', icon: '🔐', label: 'Admins' },
];

const CATEGORIES = ['SOP', 'Academics', 'GK', 'Situational', 'Why IIM'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const ADMIN_PASSWORD = 'PIPrep@dmin!';
export default function AdminPortal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [experts, setExperts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');

  // Form states
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.push('/pi/login?redirect=/admin');
        return;
      }
      setUser(session.user);

      // Check if admin
      const { data } = await supabase
        .from('pi_admins')
        .select('email')
        .eq('email', session.user.email)
        .single();

      if (!data) {
        router.push('/pi/profile');
        return;
      }
      setIsAdmin(true);
      setLoading(false);
      loadData();
    });
  }, []);

  async function loadData() {
    const [usersRes, questionsRes, sessionsRes, expertsRes, adminsRes, paymentsRes] = await Promise.all([
      supabase.from('pi_users').select('*').order('created_at', { ascending: false }),
      supabase.from('pi_questions').select('*').order('sort_order', { ascending: true }),
      supabase.from('pi_sessions').select('*').order('session_date', { ascending: false }),
      supabase.from('pi_experts').select('*').order('id', { ascending: true }),
      supabase.from('pi_admins').select('*').order('added_at', { ascending: true }),
      supabase.from('pi_payments').select('*').eq('status', 'paid').order('created_at', { ascending: false }),
    ]);

    setUsers(usersRes.data || []);
    setQuestions(questionsRes.data || []);
    setSessions(sessionsRes.data || []);
    setExperts(expertsRes.data || []);
    setAdmins(adminsRes.data || []);
    setPayments(paymentsRes.data || []);

    // Compute stats
    const totalUsers = (usersRes.data || []).length;
    const premiumUsers = (usersRes.data || []).filter(u => u.is_premium).length;
    const totalRevenue = (paymentsRes.data || []).reduce((s, p) => s + (p.amount || 0), 0);
    const activeTrials = (usersRes.data || []).filter(u => !u.is_premium && new Date(u.trial_expires_at) > new Date()).length;
    setStats({ totalUsers, premiumUsers, totalRevenue, activeTrials });
  }

  // ── CRUD Helpers ──
  async function togglePremium(email, currentStatus) {
    await supabase.from('pi_users').update({ is_premium: !currentStatus }).eq('email', email);
    loadData();
  }

  async function saveQuestion(formData) {
    if (formData.id) {
      await supabase.from('pi_questions').update({
        category: formData.category,
        question_text: formData.question_text,
        model_answer: formData.model_answer,
        difficulty: formData.difficulty,
        sort_order: formData.sort_order || 0,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      }).eq('id', formData.id);
    } else {
      await supabase.from('pi_questions').insert({
        category: formData.category,
        question_text: formData.question_text,
        model_answer: formData.model_answer,
        difficulty: formData.difficulty,
        sort_order: formData.sort_order || 0,
        is_published: formData.is_published !== false,
      });
    }
    setShowForm(false);
    setEditItem(null);
    loadData();
  }

  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;
    await supabase.from('pi_questions').delete().eq('id', id);
    loadData();
  }

  async function saveSession(formData) {
    const payload = {
      session_type: formData.session_type,
      title: formData.title,
      speaker: formData.speaker || 'Vivek Sharma',
      session_date: formData.session_date || null,
      session_time: formData.session_time || null,
      duration: formData.duration || null,
      youtube_id: formData.youtube_id || null,
      youtube_link: formData.youtube_link || null,
      description: formData.description || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      is_published: formData.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    if (formData.id) {
      await supabase.from('pi_sessions').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('pi_sessions').insert(payload);
    }
    setShowForm(false);
    setEditItem(null);
    loadData();
  }

  async function deleteSession(id) {
    if (!confirm('Delete this session?')) return;
    await supabase.from('pi_sessions').delete().eq('id', id);
    loadData();
  }

  async function saveExpert(formData) {
    let slotsObj = {};
    try { slotsObj = typeof formData.slots === 'string' ? JSON.parse(formData.slots) : (formData.slots || {}); } catch {}

    const payload = {
      name: formData.name,
      title: formData.title || '',
      bio: formData.bio || '',
      specialties: formData.specialties ? (typeof formData.specialties === 'string' ? formData.specialties.split(',').map(s => s.trim()) : formData.specialties) : [],
      rating: parseFloat(formData.rating) || 4.5,
      sessions_count: parseInt(formData.sessions_count) || 0,
      price: parseInt(formData.price) || 499,
      slots: slotsObj,
      phone: formData.phone || '',
      is_active: formData.is_active !== false,
      updated_at: new Date().toISOString(),
    };

    if (formData.id) {
      await supabase.from('pi_experts').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('pi_experts').insert(payload);
    }
    setShowForm(false);
    setEditItem(null);
    loadData();
  }

  async function deleteExpert(id) {
    if (!confirm('Delete this expert?')) return;
    await supabase.from('pi_experts').delete().eq('id', id);
    loadData();
  }

  async function addAdmin(email) {
    if (!email || !email.includes('@')) return;
    await supabase.from('pi_admins').insert({ email: email.trim() });
    loadData();
  }

  async function removeAdmin(email) {
    if (email === user?.email) { alert("Can't remove yourself"); return; }
    if (!confirm(`Remove admin access for ${email}?`)) return;
    await supabase.from('pi_admins').delete().eq('email', email);
    loadData();
  }

  if (loading) return <div style={S.loadingPage}>Loading...</div>;
  if (!isAdmin) return <div style={S.loadingPage}>Not authorized</div>;

  // Password gate
  if (!passwordVerified) {
    return (
      <>
        <Head><title>Admin Login — IPM Careers</title></Head>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f23', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: '#1a1a3e', borderRadius: 16, padding: '48px 40px', maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F510;</div>
            <h1 style={{ color: '#fff', fontSize: 22, margin: '0 0 8px' }}>Admin Access</h1>
            <p style={{ color: '#9999bb', fontSize: 14, margin: '0 0 28px' }}>Enter the admin password to continue</p>
            <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === ADMIN_PASSWORD) { setPasswordVerified(true); setPasswordError(''); } else { setPasswordError('Incorrect password'); setPasswordInput(''); } }}>
              <input type='password' placeholder='Enter admin password' value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }} autoFocus style={{ width: '100%', padding: '14px 16px', fontSize: 16, borderRadius: 10, border: passwordError ? '2px solid #ff4d6a' : '2px solid #2d2d5e', background: '#12122a', color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
              {passwordError && <p style={{ color: '#ff4d6a', fontSize: 13, margin: '4px 0 8px', textAlign: 'left' }}>{passwordError}</p>}
              <button type='submit' style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6c5ce7, #a855f7)', color: '#fff', cursor: 'pointer', marginTop: 8 }}>Unlock Admin Panel</button>
            </form>
            <p style={{ color: '#555577', fontSize: 12, marginTop: 20 }}>Logged in as {user?.email}</p>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Head><title>Admin Portal — IPM Careers PI Prep</title></Head>
      <div style={S.shell}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.sidebarLogo}>
            <span style={{ fontSize: '1.3rem' }}>⚡</span>
            <span style={S.sidebarLogoText}>PI Admin</span>
          </div>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditItem(null); }}
              style={{ ...S.sidebarItem, ...(activeTab === tab.key ? S.sidebarItemActive : {}) }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div style={S.sidebarDivider}></div>
          <button onClick={() => router.push('/pi/profile')} style={S.sidebarItem}>
            <span>←</span><span>Back to App</span>
          </button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} style={S.sidebarItem}>
            <span>🚪</span><span>Logout</span>
          </button>
          <div style={S.sidebarUser}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Logged in as</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', wordBreak: 'break-all' }}>{user?.email}</div>
          </div>
        </aside>

        {/* Main */}
        <main style={S.main}>
          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <>
              <h1 style={S.pageTitle}>Dashboard</h1>
              <div style={S.statGrid}>
                <div style={{ ...S.statCard, borderLeft: '4px solid #6c63ff' }}>
                  <div style={S.statLabel}>Total Users</div>
                  <div style={S.statValue}>{stats.totalUsers}</div>
                </div>
                <div style={{ ...S.statCard, borderLeft: '4px solid #22c55e' }}>
                  <div style={S.statLabel}>Premium Users</div>
                  <div style={S.statValue}>{stats.premiumUsers}</div>
                </div>
                <div style={{ ...S.statCard, borderLeft: '4px solid #f5a623' }}>
                  <div style={S.statLabel}>Active Trials</div>
                  <div style={S.statValue}>{stats.activeTrials}</div>
                </div>
                <div style={{ ...S.statCard, borderLeft: '4px solid #ef4444' }}>
                  <div style={S.statLabel}>Total Revenue</div>
                  <div style={S.statValue}>₹{stats.totalRevenue}</div>
                </div>
              </div>
              <div style={S.statGrid}>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Questions</div>
                  <div style={S.statValue}>{questions.length}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Sessions</div>
                  <div style={S.statValue}>{sessions.length}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Experts</div>
                  <div style={S.statValue}>{experts.length}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Payments</div>
                  <div style={S.statValue}>{payments.length}</div>
                </div>
              </div>
            </>
          )}

          {/* ── Users ── */}
          {activeTab === 'users' && (
            <>
              <div style={S.headerRow}>
                <h1 style={S.pageTitle}>Users ({users.length})</h1>
                <input style={S.searchInput} placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <span style={{ flex: 2 }}>Email</span>
                  <span style={{ flex: 1 }}>Name</span>
                  <span style={{ flex: 1 }}>Status</span>
                  <span style={{ flex: 1 }}>Trial Ends</span>
                  <span style={{ flex: 1 }}>Joined</span>
                  <span style={{ width: 100 }}>Action</span>
                </div>
                {users
                  .filter(u => !search || u.email?.includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
                  .map(u => (
                  <div key={u.id} style={S.tableRow}>
                    <span style={{ flex: 2, fontSize: '0.82rem', wordBreak: 'break-all' }}>{u.email}</span>
                    <span style={{ flex: 1, fontSize: '0.82rem' }}>{u.name || '—'}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ ...S.badge, background: u.is_premium ? '#dcfce7' : '#fef3c7', color: u.is_premium ? '#166534' : '#92400e' }}>
                        {u.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </span>
                    <span style={{ flex: 1, fontSize: '0.78rem', color: '#64748b' }}>
                      {u.trial_expires_at ? new Date(u.trial_expires_at).toLocaleDateString() : '—'}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.78rem', color: '#64748b' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ width: 100 }}>
                      <button style={{ ...S.smallBtn, background: u.is_premium ? '#fef2f2' : '#f0fdf4', color: u.is_premium ? '#dc2626' : '#166534' }} onClick={() => togglePremium(u.email, u.is_premium)}>
                        {u.is_premium ? 'Revoke' : 'Upgrade'}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Questions ── */}
          {activeTab === 'questions' && (
            <>
              <div style={S.headerRow}>
                <h1 style={S.pageTitle}>Questions ({questions.length})</h1>
                <button style={S.primaryBtn} onClick={() => { setEditItem({ category: 'SOP', difficulty: 'medium', is_published: true }); setShowForm(true); }}>+ Add Question</button>
              </div>
              {showForm && <QuestionForm item={editItem} onSave={saveQuestion} onCancel={() => { setShowForm(false); setEditItem(null); }} />}
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <span style={{ width: 40 }}>#</span>
                  <span style={{ flex: 2 }}>Question</span>
                  <span style={{ width: 90 }}>Category</span>
                  <span style={{ width: 70 }}>Difficulty</span>
                  <span style={{ width: 60 }}>Status</span>
                  <span style={{ width: 120 }}>Actions</span>
                </div>
                {questions.map(q => (
                  <div key={q.id} style={S.tableRow}>
                    <span style={{ width: 40, fontSize: '0.8rem', color: '#94a3b8' }}>{q.id}</span>
                    <span style={{ flex: 2, fontSize: '0.82rem' }}>{q.question_text?.substring(0, 80)}...</span>
                    <span style={{ width: 90 }}><span style={{ ...S.badge, background: '#6c63ff15', color: '#6c63ff' }}>{q.category}</span></span>
                    <span style={{ width: 70 }}><span style={{ ...S.badge, background: q.difficulty === 'easy' ? '#dcfce7' : q.difficulty === 'hard' ? '#fce7f3' : '#fef3c7', color: q.difficulty === 'easy' ? '#166534' : q.difficulty === 'hard' ? '#9d174d' : '#92400e' }}>{q.difficulty}</span></span>
                    <span style={{ width: 60, fontSize: '0.78rem' }}>{q.is_published ? '✅' : '❌'}</span>
                    <span style={{ width: 120, display: 'flex', gap: 4 }}>
                      <button style={S.smallBtn} onClick={() => { setEditItem(q); setShowForm(true); }}>Edit</button>
                      <button style={{ ...S.smallBtn, color: '#dc2626' }} onClick={() => deleteQuestion(q.id)}>Del</button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Sessions ── */}
          {activeTab === 'sessions' && (
            <>
              <div style={S.headerRow}>
                <h1 style={S.pageTitle}>Sessions ({sessions.length})</h1>
                <button style={S.primaryBtn} onClick={() => { setEditItem({ session_type: 'recorded', is_published: true, speaker: 'Vivek Sharma' }); setShowForm(true); }}>+ Add Session</button>
              </div>
              {showForm && <SessionForm item={editItem} onSave={saveSession} onCancel={() => { setShowForm(false); setEditItem(null); }} />}
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <span style={{ width: 70 }}>Type</span>
                  <span style={{ flex: 2 }}>Title</span>
                  <span style={{ width: 100 }}>Date</span>
                  <span style={{ width: 80 }}>YouTube</span>
                  <span style={{ width: 60 }}>Status</span>
                  <span style={{ width: 120 }}>Actions</span>
                </div>
                {sessions.map(s => (
                  <div key={s.id} style={S.tableRow}>
                    <span style={{ width: 70 }}><span style={{ ...S.badge, background: s.session_type === 'recorded' ? '#dbeafe' : '#fce7f3', color: s.session_type === 'recorded' ? '#1d4ed8' : '#9d174d' }}>{s.session_type === 'recorded' ? '📼' : '🔴'} {s.session_type}</span></span>
                    <span style={{ flex: 2, fontSize: '0.82rem' }}>{s.title}</span>
                    <span style={{ width: 100, fontSize: '0.78rem', color: '#64748b' }}>{s.session_date || '—'}</span>
                    <span style={{ width: 80, fontSize: '0.78rem' }}>{s.youtube_id ? '✅' : '—'}</span>
                    <span style={{ width: 60, fontSize: '0.78rem' }}>{s.is_published ? '✅' : '❌'}</span>
                    <span style={{ width: 120, display: 'flex', gap: 4 }}>
                      <button style={S.smallBtn} onClick={() => { setEditItem({ ...s, tags: (s.tags || []).join(', ') }); setShowForm(true); }}>Edit</button>
                      <button style={{ ...S.smallBtn, color: '#dc2626' }} onClick={() => deleteSession(s.id)}>Del</button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Experts ── */}
          {activeTab === 'experts' && (
            <>
              <div style={S.headerRow}>
                <h1 style={S.pageTitle}>Experts ({experts.length})</h1>
                <button style={S.primaryBtn} onClick={() => { setEditItem({ is_active: true, rating: 4.5, price: 499, slots: '{}' }); setShowForm(true); }}>+ Add Expert</button>
              </div>
              {showForm && <ExpertForm item={editItem} onSave={saveExpert} onCancel={() => { setShowForm(false); setEditItem(null); }} />}
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <span style={{ flex: 1 }}>Name</span>
                  <span style={{ flex: 1 }}>Title</span>
                  <span style={{ width: 60 }}>Price</span>
                  <span style={{ width: 60 }}>Rating</span>
                  <span style={{ width: 60 }}>Active</span>
                  <span style={{ width: 120 }}>Actions</span>
                </div>
                {experts.map(e => (
                  <div key={e.id} style={S.tableRow}>
                    <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600 }}>{e.name}</span>
                    <span style={{ flex: 1, fontSize: '0.82rem', color: '#64748b' }}>{e.title}</span>
                    <span style={{ width: 60, fontSize: '0.82rem' }}>₹{e.price}</span>
                    <span style={{ width: 60, fontSize: '0.82rem' }}>⭐ {e.rating}</span>
                    <span style={{ width: 60, fontSize: '0.82rem' }}>{e.is_active ? '✅' : '❌'}</span>
                    <span style={{ width: 120, display: 'flex', gap: 4 }}>
                      <button style={S.smallBtn} onClick={() => { setEditItem({ ...e, specialties: (e.specialties || []).join(', '), slots: JSON.stringify(e.slots || {}, null, 2) }); setShowForm(true); }}>Edit</button>
                      <button style={{ ...S.smallBtn, color: '#dc2626' }} onClick={() => deleteExpert(e.id)}>Del</button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Admins ── */}
          {activeTab === 'admins' && (
            <>
              <h1 style={S.pageTitle}>Admin Access</h1>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input id="newAdminEmail" style={S.searchInput} placeholder="Enter email to add as admin..." />
                <button style={S.primaryBtn} onClick={() => { const el = document.getElementById('newAdminEmail'); addAdmin(el.value); el.value = ''; }}>Add Admin</button>
              </div>
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <span style={{ flex: 1 }}>Email</span>
                  <span style={{ width: 120 }}>Added</span>
                  <span style={{ width: 80 }}>Action</span>
                </div>
                {admins.map(a => (
                  <div key={a.id} style={S.tableRow}>
                    <span style={{ flex: 1, fontSize: '0.85rem' }}>{a.email}</span>
                    <span style={{ width: 120, fontSize: '0.78rem', color: '#64748b' }}>{new Date(a.added_at).toLocaleDateString()}</span>
                    <span style={{ width: 80 }}>
                      <button style={{ ...S.smallBtn, color: '#dc2626' }} onClick={() => removeAdmin(a.email)}>Remove</button>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ── Form Components ──
function QuestionForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item || {});
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <h3 style={S.formTitle}>{item?.id ? 'Edit Question' : 'Add Question'}</h3>
      <div style={S.formGrid}>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Category</label>
          <select style={S.formInput} value={form.category || ''} onChange={e => upd('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Difficulty</label>
          <select style={S.formInput} value={form.difficulty || ''} onChange={e => upd('difficulty', e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Question</label>
          <textarea style={{ ...S.formInput, minHeight: 80 }} value={form.question_text || ''} onChange={e => upd('question_text', e.target.value)} />
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Model Answer</label>
          <textarea style={{ ...S.formInput, minHeight: 100 }} value={form.model_answer || ''} onChange={e => upd('model_answer', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Sort Order</label>
          <input type="number" style={S.formInput} value={form.sort_order || 0} onChange={e => upd('sort_order', parseInt(e.target.value))} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Published</label>
          <select style={S.formInput} value={form.is_published !== false ? 'true' : 'false'} onChange={e => upd('is_published', e.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No (Draft)</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={S.primaryBtn} onClick={() => onSave(form)}>Save</button>
        <button style={S.smallBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SessionForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item || {});
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <h3 style={S.formTitle}>{item?.id ? 'Edit Session' : 'Add Session'}</h3>
      <div style={S.formGrid}>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Type</label>
          <select style={S.formInput} value={form.session_type || 'recorded'} onChange={e => upd('session_type', e.target.value)}>
            <option value="recorded">Recorded</option>
            <option value="upcoming">Upcoming Live</option>
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Speaker</label>
          <input style={S.formInput} value={form.speaker || ''} onChange={e => upd('speaker', e.target.value)} />
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Title</label>
          <input style={S.formInput} value={form.title || ''} onChange={e => upd('title', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Date</label>
          <input type="date" style={S.formInput} value={form.session_date || ''} onChange={e => upd('session_date', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Time</label>
          <input style={S.formInput} placeholder="e.g., 6:00 PM IST" value={form.session_time || ''} onChange={e => upd('session_time', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Duration</label>
          <input style={S.formInput} placeholder="e.g., 45 min" value={form.duration || ''} onChange={e => upd('duration', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>YouTube Video ID</label>
          <input style={S.formInput} placeholder="e.g., dQw4w9WgXcQ" value={form.youtube_id || ''} onChange={e => upd('youtube_id', e.target.value)} />
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>YouTube Link (for upcoming)</label>
          <input style={S.formInput} placeholder="Full YouTube URL" value={form.youtube_link || ''} onChange={e => upd('youtube_link', e.target.value)} />
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Description</label>
          <textarea style={{ ...S.formInput, minHeight: 60 }} value={form.description || ''} onChange={e => upd('description', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Tags (comma-separated)</label>
          <input style={S.formInput} placeholder="Strategy, PI Tips" value={form.tags || ''} onChange={e => upd('tags', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Published</label>
          <select style={S.formInput} value={form.is_published !== false ? 'true' : 'false'} onChange={e => upd('is_published', e.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={S.primaryBtn} onClick={() => onSave(form)}>Save</button>
        <button style={S.smallBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ExpertForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item || {});
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={S.formCard}>
      <h3 style={S.formTitle}>{item?.id ? 'Edit Expert' : 'Add Expert'}</h3>
      <div style={S.formGrid}>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Name</label>
          <input style={S.formInput} value={form.name || ''} onChange={e => upd('name', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Title</label>
          <input style={S.formInput} value={form.title || ''} onChange={e => upd('title', e.target.value)} />
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Bio</label>
          <textarea style={{ ...S.formInput, minHeight: 80 }} value={form.bio || ''} onChange={e => upd('bio', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Specialties (comma-separated)</label>
          <input style={S.formInput} value={form.specialties || ''} onChange={e => upd('specialties', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Phone (with country code)</label>
          <input style={S.formInput} placeholder="918299470392" value={form.phone || ''} onChange={e => upd('phone', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Price (₹)</label>
          <input type="number" style={S.formInput} value={form.price || 499} onChange={e => upd('price', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Rating</label>
          <input type="number" step="0.1" style={S.formInput} value={form.rating || 4.5} onChange={e => upd('rating', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Sessions Count</label>
          <input type="number" style={S.formInput} value={form.sessions_count || 0} onChange={e => upd('sessions_count', e.target.value)} />
        </div>
        <div style={S.formGroup}>
          <label style={S.formLabel}>Active</label>
          <select style={S.formInput} value={form.is_active !== false ? 'true' : 'false'} onChange={e => upd('is_active', e.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div style={{ ...S.formGroup, gridColumn: '1/-1' }}>
          <label style={S.formLabel}>Slots (JSON)</label>
          <textarea style={{ ...S.formInput, minHeight: 100, fontFamily: 'monospace', fontSize: '0.8rem' }} placeholder='{"Mon": ["4:00 PM", "5:00 PM"], "Wed": ["4:00 PM"]}' value={form.slots || '{}'} onChange={e => upd('slots', e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button style={S.primaryBtn} onClick={() => onSave(form)}>Save</button>
        <button style={S.smallBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Inline Styles ──
const S = {
  loadingPage: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1rem', color: '#64748b' },
  shell: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" },
  sidebar: { width: 220, background: '#0f172a', color: '#e2e8f0', padding: '20px 12px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 20 },
  sidebarLogoText: { fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em' },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', marginBottom: 2 },
  sidebarItemActive: { background: '#1e293b', color: '#fff' },
  sidebarDivider: { height: 1, background: '#1e293b', margin: '12px 0' },
  sidebarUser: { marginTop: 'auto', padding: '12px 14px', background: '#1e293b', borderRadius: 10 },
  main: { flex: 1, padding: '28px 32px', background: '#f8fafc', overflowY: 'auto' },
  pageTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.02em' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' },
  statLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: 4 },
  searchInput: { padding: '10px 16px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', minWidth: 250 },
  table: { background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb' },
  tableHeader: { display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', gap: 12 },
  tableRow: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', gap: 12 },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 },
  smallBtn: { padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s' },
  primaryBtn: { padding: '10px 20px', border: 'none', borderRadius: 10, background: '#6c63ff', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'inherit' },
  formCard: { background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e5e7eb', marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  formLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#64748b' },
  formInput: { padding: '9px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
};
