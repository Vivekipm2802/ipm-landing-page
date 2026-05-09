// /pages/api/pi-admin-data.js — Server-side admin API (bypasses RLS)
// SECURITY: Verifies Supabase JWT before processing any admin action.
// The email is extracted from the verified token, NOT from req.body.
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { action, payload } = req.body;

  // ── Step 1: Extract and verify Supabase JWT ──
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Create a temporary client to verify the token
  let verifiedEmail;
  try {
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (error || !user || !user.email) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    verifiedEmail = user.email;
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }

  // ── Step 2: Use the verified email (not from body) to check admin status ──
  const email = verifiedEmail;
  const supabase = getSupabaseServer();

  const { data: adminRow } = await supabase
    .from("pi_admins")
    .select("email")
    .eq("email", email)
    .single();

  if (!adminRow) return res.status(403).json({ error: "Not an admin" });

  try {
    switch (action) {
      // ── Check admin status only ──
      case "check": {
        return res.status(200).json({ isAdmin: true });
      }

      // ── Load all dashboard data ──
      case "loadAll": {
        const [usersRes, questionsRes, sessionsRes, expertsRes, adminsRes, paymentsRes] = await Promise.all([
          supabase.from("pi_users").select("*").order("created_at", { ascending: false }),
          supabase.from("pi_questions").select("*").order("sort_order", { ascending: true }),
          supabase.from("pi_sessions").select("*").order("session_date", { ascending: false }),
          supabase.from("pi_experts").select("*").order("id", { ascending: true }),
          supabase.from("pi_admins").select("*").order("added_at", { ascending: true }),
          supabase.from("pi_payments").select("*").eq("status", "paid").order("created_at", { ascending: false }),
        ]);
        return res.status(200).json({
          users: usersRes.data || [],
          questions: questionsRes.data || [],
          sessions: sessionsRes.data || [],
          experts: expertsRes.data || [],
          admins: adminsRes.data || [],
          payments: paymentsRes.data || [],
        });
      }

      // ── Toggle premium ──
      case "togglePremium": {
        const { targetEmail, currentStatus } = payload;
        await supabase.from("pi_users").update({ is_premium: !currentStatus }).eq("email", targetEmail);
        return res.status(200).json({ success: true });
      }

      // ── Save question (create or update) ──
      case "saveQuestion": {
        const q = payload;
        if (q.id) {
          await supabase.from("pi_questions").update({
            category: q.category,
            question_text: q.question_text,
            model_answer: q.model_answer,
            difficulty: q.difficulty,
            sort_order: q.sort_order || 0,
            is_published: q.is_published,
            updated_at: new Date().toISOString(),
          }).eq("id", q.id);
        } else {
          await supabase.from("pi_questions").insert({
            category: q.category,
            question_text: q.question_text,
            model_answer: q.model_answer,
            difficulty: q.difficulty,
            sort_order: q.sort_order || 0,
            is_published: q.is_published !== false,
          });
        }
        return res.status(200).json({ success: true });
      }

      // ── Delete question ──
      case "deleteQuestion": {
        await supabase.from("pi_questions").delete().eq("id", payload.id);
        return res.status(200).json({ success: true });
      }

      // ── Save session ──
      case "saveSession": {
        const s = payload;
        const sessionPayload = {
          session_type: s.session_type,
          title: s.title,
          speaker: s.speaker || "Vivek Sharma",
          session_date: s.session_date || null,
          session_time: s.session_time || null,
          duration: s.duration || null,
          youtube_id: s.youtube_id || null,
          youtube_link: s.youtube_link || null,
          description: s.description || null,
          tags: s.tags ? (typeof s.tags === "string" ? s.tags.split(",").map(t => t.trim()) : s.tags) : [],
          is_published: s.is_published !== false,
          updated_at: new Date().toISOString(),
        };
        if (s.id) {
          await supabase.from("pi_sessions").update(sessionPayload).eq("id", s.id);
        } else {
          await supabase.from("pi_sessions").insert(sessionPayload);
        }
        return res.status(200).json({ success: true });
      }

      // ── Delete session ──
      case "deleteSession": {
        await supabase.from("pi_sessions").delete().eq("id", payload.id);
        return res.status(200).json({ success: true });
      }

      // ── Save expert ──
      case "saveExpert": {
        const e = payload;
        let slotsObj = {};
        try { slotsObj = typeof e.slots === "string" ? JSON.parse(e.slots) : (e.slots || {}); } catch {}
        const expertPayload = {
          name: e.name,
          title: e.title || "",
          bio: e.bio || "",
          specialties: e.specialties ? (typeof e.specialties === "string" ? e.specialties.split(",").map(s => s.trim()) : e.specialties) : [],
          rating: parseFloat(e.rating) || 4.5,
          sessions_count: parseInt(e.sessions_count) || 0,
          price: parseInt(e.price) || 499,
          slots: slotsObj,
          phone: e.phone || "",
          is_active: e.is_active !== false,
          updated_at: new Date().toISOString(),
        };
        if (e.id) {
          await supabase.from("pi_experts").update(expertPayload).eq("id", e.id);
        } else {
          await supabase.from("pi_experts").insert(expertPayload);
        }
        return res.status(200).json({ success: true });
      }

      // ── Delete expert ──
      case "deleteExpert": {
        await supabase.from("pi_experts").delete().eq("id", payload.id);
        return res.status(200).json({ success: true });
      }

      // ── Add admin ──
      case "addAdmin": {
        const { newEmail } = payload;
        if (!newEmail || !newEmail.includes("@")) return res.status(400).json({ error: "Invalid email" });
        await supabase.from("pi_admins").insert({ email: newEmail.trim() });
        return res.status(200).json({ success: true });
      }

      // ── Remove admin ──
      case "removeAdmin": {
        const { targetEmail: removeEmail } = payload;
        if (removeEmail === email) return res.status(400).json({ error: "Cannot remove yourself" });
        await supabase.from("pi_admins").delete().eq("email", removeEmail);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: "Unknown action" });
    }
  } catch (err) {
    console.error("Admin API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
