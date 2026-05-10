// /pages/api/seed-pi-data.js — ONE-TIME seed script. DELETE AFTER USE.
import { getSupabaseServer } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { secret, action } = req.body;
  if (secret !== "seed2026ipm") return res.status(403).json({ error: "Bad secret" });

  const supabase = getSupabaseServer();

  // ACTION: cleanup — remove duplicate questions/experts from double-run
  if (action === "cleanup") {
    // Delete ALL seed questions (sort_order 1-40) and experts, then re-insert fresh
    const { error: qDel } = await supabase.from('pi_questions').delete().gte('sort_order', 1).lte('sort_order', 40);
    const { error: eDel } = await supabase.from('pi_experts').delete().in('name', ['Vivek Sharma', 'Priya Mehta', 'Arjun Kapoor']);
    return res.status(200).json({
      cleaned: true,
      qError: qDel?.message || null,
      eError: eDel?.message || null,
    });
  }

  // ACTION: seed sessions only (with correct session_type)
  if (action === "sessions") {
    const sessions = [
      { session_type: 'recorded', title: 'How to Crack the IIM Indore PI — Complete Strategy', speaker: 'Vivek Sharma', session_date: '2026-03-15', duration: '45 min', youtube_id: '', tags: ['Strategy', 'PI Tips'], description: 'Full breakdown of the IIM Indore PI process — what panels look for, common mistakes, and how to structure your answers.', is_published: true },
      { session_type: 'recorded', title: 'SOP Masterclass — How to Write an SOP That Survives Cross-Questioning', speaker: 'Vivek Sharma', session_date: '2026-03-22', duration: '38 min', youtube_id: '', tags: ['SOP', 'Writing'], description: "Step-by-step guide to writing an SOP that the panel can't poke holes in. With live examples and rewrites.", is_published: true },
      { session_type: 'recorded', title: 'Current Affairs Rapid Fire — Top 30 GK Questions for PI', speaker: 'Vivek Sharma', session_date: '2026-04-01', duration: '30 min', youtube_id: '', tags: ['GK', 'Current Affairs'], description: "Quick-fire session covering the 30 most likely current affairs questions you'll face in your PI.", is_published: true },
      { session_type: 'recorded', title: 'Mock PI Live — Watch a Real Student Get Grilled', speaker: 'Vivek Sharma', session_date: '2026-04-10', duration: '55 min', youtube_id: '', tags: ['Mock PI', 'Live Demo'], description: "Live mock PI with a real IPMAT student. Panel asks tough questions, student answers, expert breaks down what worked and what didn't.", is_published: true },
      { session_type: 'upcoming', title: 'Body Language & Confidence Hacks for PI Day', speaker: 'Vivek Sharma', session_date: '2026-04-28', session_time: '6:00 PM IST', duration: '40 min', youtube_link: '', tags: ['Soft Skills', 'Confidence'], description: 'Non-verbal cues that make or break your PI. How to sit, where to look, when to smile, and how to handle awkward silences.', is_published: true },
      { session_type: 'upcoming', title: 'Live Mock PI — Open Slots for 3 Students', speaker: 'Vivek Sharma', session_date: '2026-05-03', session_time: '5:00 PM IST', duration: '60 min', youtube_link: '', tags: ['Mock PI', 'Interactive'], description: "Live mock PI on YouTube. 3 students will be selected to face the panel live — submit your name to participate!", is_published: true },
      { session_type: 'upcoming', title: 'Last-Minute PI Checklist — 48 Hours Before Your Interview', speaker: 'Vivek Sharma', session_date: '2026-05-10', session_time: '7:00 PM IST', duration: '35 min', youtube_link: '', tags: ['Strategy', 'Last Minute'], description: 'Everything you need to do in the final 48 hours. Document checklist, revision plan, sleep schedule, and mental preparation.', is_published: true },
    ];

    const { data, error } = await supabase.from('pi_sessions').insert(sessions).select('id');
    return res.status(200).json({ sessions: data?.length || 0, error: error?.message || null });
  }

  return res.status(400).json({ error: "Specify action: cleanup or sessions" });
}
