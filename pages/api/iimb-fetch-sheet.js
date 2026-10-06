// Fetches an IIMB UG response sheet from cdn.digialm.com so the browser can
// parse it (the CDN does not allow cross-origin reads from our domain).
// Locked to cdn.digialm.com over HTTPS to prevent this being used as an open proxy.

const ALLOWED_HOST = "cdn.digialm.com";
const MAX_BYTES = 8 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const raw = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  let target;
  try {
    target = new URL(raw);
  } catch {
    return res.status(400).json({ error: "Please paste the full response sheet link." });
  }

  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST || target.port) {
    return res.status(400).json({ error: "Only IIMB response sheet links from https://cdn.digialm.com are supported." });
  }
  if (!/\.html?$/i.test(target.pathname)) {
    return res.status(400).json({ error: "This does not look like a response sheet page link. It should end with .html" });
  }
  target.hash = "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (IPM Careers IIMB UG Score Calculator)" },
    });

    if (upstream.status !== 200) {
      return res.status(400).json({ error: "This response sheet link has expired or is not public. Save the page as HTML and use 'Upload file' instead." });
    }

    const len = Number(upstream.headers.get("content-length") || 0);
    if (len > MAX_BYTES) {
      return res.status(413).json({ error: "Response sheet is too large to process." });
    }

    const html = await upstream.text();
    if (html.length > MAX_BYTES) {
      return res.status(413).json({ error: "Response sheet is too large to process." });
    }
    if (!html.includes("question-pnl")) {
      return res.status(400).json({ error: "We opened the link but found no questions. Make sure it is your Response Sheet / Answer Key page." });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ html });
  } catch (e) {
    const timedOut = e?.name === "AbortError";
    return res.status(502).json({
      error: timedOut
        ? "The response sheet server took too long. Try again, or upload the saved HTML file."
        : "Could not open the response sheet link. Try again, or upload the saved HTML file.",
    });
  } finally {
    clearTimeout(timer);
  }
}

export const config = {
  api: { responseLimit: "10mb" },
};
