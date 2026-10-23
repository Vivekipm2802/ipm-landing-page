// POST /api/cat-planner-reminders  (Authorization: Bearer CONTENT_AUTOMATION_TOKEN)
// Called every minute by Supabase pg_cron. Sends at most BIRD_WA_PER_RUN WhatsApp reminders per call:
//   1. "Admit card is out" (from 4 Nov, 10 AM) to students who signed up before the card was out
//   2. Night before (28 Nov, 5 PM to 10:30 PM)
//   3. Exam morning, 30 minutes before their leave-by time (never before 5 AM)
// Does nothing until BIRD_API_KEY and BIRD_WA_FROM are set in Vercel.
import { requireAuth } from "../../lib/auth";
import { catDb } from "../../lib/catPlannerServer";
import { birdConfigured, sendWhatsAppTemplate } from "../../lib/birdWhatsApp";
import { EXAM_YEAR, EXAM_DATE, ADMIT_CARD_DATE, planTimes, planUrl, fmtTime, cityBySlug, istDate, addMin } from "../../lib/catPlanner";

const TPL = {
  admit: process.env.BIRD_TPL_ADMIT || "cat_admit_card_out",
  eve: process.env.BIRD_TPL_EVE || "cat_exam_eve",
  morning: process.env.BIRD_TPL_MORNING || "cat_exam_morning",
};

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (!birdConfigured()) return res.status(200).json({ ok: true, disabled: true, reason: "BIRD_API_KEY / BIRD_WA_FROM not set" });

  const perRun = Math.max(1, Math.min(200, parseInt(process.env.BIRD_WA_PER_RUN || "9", 10)));
  const now = new Date();
  const db = catDb();
  const sent = { admit: 0, eve: 0, morning: 0 }, failed = [];
  let budget = perRun;

  const send = async (kind, plan, params) => {
    try {
      await sendWhatsAppTemplate({ to: `+91${plan.phone}`, slug: TPL[kind], params, idempotencyKey: `cat${EXAM_YEAR}-${kind}-${plan.uid}`, tags: { campaign: `cat${EXAM_YEAR}-planner`, kind } });
      await db.from("cat_planner").update({ [`remind_${kind}_at`]: new Date().toISOString(), remind_error: null }).eq("id", plan.id);
      sent[kind] += 1;
    } catch (e) {
      // mark as attempted so one bad number does not block the queue
      await db.from("cat_planner").update({ [`remind_${kind}_at`]: new Date().toISOString(), remind_error: String(e.message || e).slice(0, 300) }).eq("id", plan.id);
      failed.push({ kind, uid: plan.uid });
    }
    budget -= 1;
  };

  const first = (n) => String(n || "").trim().split(/\s+/)[0] || "there";

  try {
    // 1. morning (highest priority, time critical)
    const examDay = istDate(EXAM_DATE, "00:00");
    if (now >= addMin(examDay, 5 * 60) && now < addMin(examDay, 17 * 60)) {
      const { data } = await db.from("cat_planner")
        .select("id, uid, name, phone, slot, exam_date, exam_start, exam_end, reporting_time, gate_time, travel_mins, city_slug, centre_id")
        .eq("exam_year", EXAM_YEAR).eq("wa_opt_in", true).is("remind_morning_at", null).not("slot", "is", null)
        .order("slot", { ascending: true }).limit(300);
      for (const p of data || []) {
        if (budget <= 0) break;
        const t = planTimes(p, cityBySlug(p.city_slug));
        if (!t.reportingAt || now > t.gateAt) continue;
        let sendAt = t.leaveAt ? addMin(t.leaveAt, -30) : addMin(t.reportingAt, -120);
        if (sendAt < addMin(examDay, 5 * 60)) sendAt = addMin(examDay, 5 * 60);
        if (now < sendAt) continue;
        const { data: c } = p.centre_id ? await db.from("cat_centres").select("name").eq("id", p.centre_id).maybeSingle() : { data: null };
        await send("morning", p, {
          name: first(p.name),
          leave_by: t.leaveAt ? fmtTime(t.leaveAt) : `early (reporting ${fmtTime(t.reportingAt)})`,
          centre: c?.name || "your CAT centre",
          gate: fmtTime(t.gateAt),
          link: planUrl(p.uid),
        });
      }
    }

    // 2. night before
    const eveStart = istDate("2026-11-28", "17:00"), eveEnd = istDate("2026-11-28", "22:30");
    if (budget > 0 && now >= eveStart && now < eveEnd) {
      const { data } = await db.from("cat_planner")
        .select("id, uid, name, phone, slot, exam_date, exam_start, reporting_time, gate_time, travel_mins, city_slug, centre_id")
        .eq("exam_year", EXAM_YEAR).eq("wa_opt_in", true).is("remind_eve_at", null).limit(budget);
      for (const p of data || []) {
        if (budget <= 0) break;
        const t = planTimes(p, cityBySlug(p.city_slug));
        const { data: c } = p.centre_id ? await db.from("cat_centres").select("name").eq("id", p.centre_id).maybeSingle() : { data: null };
        await send("eve", p, {
          name: first(p.name),
          centre: c?.name || "your CAT centre (see your admit card)",
          reporting: t.reportingAt ? fmtTime(t.reportingAt) : "as on your admit card",
          gate: t.gateAt ? fmtTime(t.gateAt) : "as on your admit card",
          link: planUrl(p.uid),
        });
      }
    }

    // 3. admit card is out (early sign-ups only)
    const admitFrom = istDate(ADMIT_CARD_DATE, "10:00"), admitTo = istDate("2026-11-27", "21:00");
    if (budget > 0 && now >= admitFrom && now < admitTo && now.getUTCHours() >= 3 && now.getUTCHours() < 16) {
      const { data } = await db.from("cat_planner")
        .select("id, uid, name, phone")
        .eq("exam_year", EXAM_YEAR).eq("wa_opt_in", true).eq("input_mode", "early").is("remind_admit_at", null).limit(budget);
      for (const p of data || []) {
        if (budget <= 0) break;
        await send("admit", p, { name: first(p.name), link: planUrl(p.uid) });
      }
    }

    return res.status(200).json({ ok: true, sent, failed: failed.length });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Reminder run failed", sent });
  }
}

export const config = { maxDuration: 60 };
