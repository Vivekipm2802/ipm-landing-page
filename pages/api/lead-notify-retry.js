// GET /api/lead-notify-retry  (called every 10 minutes by Supabase pg_cron)
// Re-sends lead emails that could not be delivered at the time (mail down, timeout). Harmless to call:
// it only sends queued lead emails to the team, and each is marked sent once delivered.
import { resendQueued } from "../../lib/leadNotify";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const out = await resendQueued(40);
  return res.status(200).json(out);
}
