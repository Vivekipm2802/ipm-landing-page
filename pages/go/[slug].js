// /go/<partner>?src=<where>  → logs one click (no personal data) and redirects to the school's referral link.
// Bots and link-preview fetchers are redirected but not counted.
import { PARTNER_LINKS } from "../../lib/partnerLinks";
import { catDb } from "../../lib/catServer";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|skype|curl|wget|python|axios|node-fetch|headless/i;

export async function getServerSideProps({ params, query, req, res }) {
  const slug = String(params.slug || "").toLowerCase();
  const p = PARTNER_LINKS[slug];
  if (!p) return { redirect: { destination: "/mba-application-forms", permanent: false } };

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  const ua = String(req.headers["user-agent"] || "");
  if (!BOT.test(ua)) {
    const row = {
      partner: slug,
      src: String(query.src || "direct").replace(/[^\w.-]/g, "").slice(0, 60) || "direct",
      referrer: String(req.headers.referer || "").replace(/^https?:\/\//, "").split("?")[0].slice(0, 200) || null,
      device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
      country: String(req.headers["x-vercel-ip-country"] || "").slice(0, 2) || null,
    };
    try {
      // never hold the student up for more than 1.5 s
      await Promise.race([catDb().from("partner_clicks").insert(row), new Promise((r) => setTimeout(r, 1500))]);
    } catch (e) {
      console.error("partner click log failed:", e?.message);
    }
  }
  return { redirect: { destination: p.url, permanent: false } };
}

export default function Go() {
  return null;
}
