// POST /api/share-event  { page, kind: 'share'|'visit', src, channel, form }
// Logs a share-button tap or a visit that arrived from a shared link. No personal data. Never fails loudly.
import { catDb } from "../../lib/catServer";

const clean = (v, n) => (v == null ? null : String(v).replace(/[^\w.:-]/g, "").slice(0, n) || null);
const BOT = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } } // sendBeacon sends text/plain
  b = b || {};
  const ua = String(req.headers["user-agent"] || "");
  const kind = b.kind === "visit" ? "visit" : "share";
  const page = clean(b.page, 40);
  if (!page || BOT.test(ua)) return res.status(204).end();
  try {
    await catDb().from("share_events").insert({
      page, kind,
      src: clean(b.src, 40),
      channel: clean(b.channel, 20),
      form_id: clean(b.form, 60),
      device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
    });
  } catch (e) {
    console.error("share-event:", e?.message);
  }
  return res.status(204).end();
}
