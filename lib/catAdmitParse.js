// CAT admit card reader. Runs in the student's browser: the PDF never leaves their device.
// We only keep test-day fields (date, slot, times, city, centre, address). Name is used to
// pre-fill the form; date of birth, application number, category and photo are ignored.

const PDFJS_VERSION = "3.11.174";
const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

// "12:30 PM" / "12:30 PM (IST)" -> "12:30"; "4:30 PM" -> "16:30"
export function to24h(t) {
  const m = String(t || "").match(/(\d{1,2})[:.](\d{2})\s*([AaPp])\.?\s*[Mm]?/);
  if (!m) {
    const m2 = String(t || "").match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    return m2 ? `${m2[1].padStart(2, "0")}:${m2[2]}` : "";
  }
  let h = parseInt(m[1], 10) % 12;
  if (/p/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function slotFromStart(hhmm, sessionText = "") {
  if (/morning|forenoon/i.test(sessionText)) return 1;
  if (/afternoon/i.test(sessionText)) return 2;
  if (/evening/i.test(sessionText)) return 3;
  const h = parseInt(String(hhmm).split(":")[0], 10);
  if (Number.isNaN(h)) return null;
  return h < 11 ? 1 : h < 15 ? 2 : 3;
}

function parseDate(text) {
  const m = clean(text).replace(/(\d)(st|nd|rd|th)\b/gi, "$1").match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]+)\s*,?\s*(\d{4})/);
  if (!m) return "";
  const mi = MONTHS.findIndex((x) => x.startsWith(m[2].toLowerCase().slice(0, 3)));
  if (mi < 0) return "";
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function addressFromMapLink(url) {
  try {
    const q = new URL(url).searchParams.get("q");
    if (!q) return null;
    const parts = q.split(",").map(clean).filter(Boolean);
    const pin = (q.match(/\b\d{6}\b/) || [])[0] || "";
    return { parts, pin };
  } catch {
    return null;
  }
}

/**
 * Pure parser.
 * items: [{ str, x, y }] from page 1 (PDF coordinates: y grows upwards)
 * links: [url] link annotations on page 1
 */
export function parseAdmitCardItems(items, links = []) {
  const all = (items || []).map((i) => ({ str: clean(i.str), x: i.x, y: i.y })).filter((i) => i.str);
  const LABELS = {
    name: /^name$/i,
    date: /^date and day of (the )?test$/i,
    times: /^test times? and session$/i,
    reporting: /^reporting\s*\/?\s*(entry)?\s*time/i,
    gate: /^gate closing time/i,
    city: /^test city$/i,
    centre: /^test cent(er|re)( name| address)?$/i,
    emergency: /^emergency contact/i,
    map: /^google map link/i,
  };
  const label = {};
  for (const it of all) {
    for (const [k, re] of Object.entries(LABELS)) {
      if (!label[k] && re.test(it.str) && it.x < 120) label[k] = it;
    }
  }
  const labelRight = 125; // values start to the right of the label column
  const valueCol = (it) => it.x >= labelRight && it.x < 465;
  const rowValue = (lab, tol = 10) => {
    if (!lab) return "";
    const row = all.filter((it) => valueCol(it) && Math.abs(it.y - lab.y) <= tol && !Object.values(label).includes(it));
    if (!row.length) return "";
    // keep the closest baseline group only
    const best = Math.min(...row.map((r) => Math.abs(r.y - lab.y)));
    return clean(row.filter((r) => Math.abs(Math.abs(r.y - lab.y) - best) <= 3).sort((a, b) => a.x - b.x).map((r) => r.str).join(" "));
  };

  const out = { ok: false, source: "pdf", name: "", examDate: "", examStart: "", examEnd: "", session: "", slot: null, reporting: "", gate: "", city: "", centreName: "", centreAddress: "", pincode: "", mapUrl: "" };

  out.name = rowValue(label.name);
  out.examDate = parseDate(rowValue(label.date, 12));
  const timesText = rowValue(label.times);
  const tm = timesText.match(/(\d{1,2}[:.]\d{2}\s*[AP]\.?M)\.?\s*(?:to|-)\s*(\d{1,2}[:.]\d{2}\s*[AP]\.?M)/i);
  if (tm) { out.examStart = to24h(tm[1]); out.examEnd = to24h(tm[2]); }
  out.session = (timesText.match(/(morning|forenoon|afternoon|evening)\s*session/i) || [])[0] || "";
  out.reporting = to24h(rowValue(label.reporting));
  out.gate = to24h(rowValue(label.gate));
  out.city = rowValue(label.city);

  // Test centre block: everything in the value column between "Test Center" and the next label below it
  if (label.centre) {
    const below = Object.values(label).filter((l) => l.y < label.centre.y - 4).sort((a, b) => b.y - a.y)[0];
    const floor = below ? below.y + 6 : label.centre.y - 70;
    const block = all.filter((it) => valueCol(it) && it.y <= label.centre.y + 8 && it.y > floor);
    const lines = [];
    block.sort((a, b) => b.y - a.y || a.x - b.x).forEach((it) => {
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.y - it.y) <= 3) last.str += " " + it.str;
      else lines.push({ y: it.y, str: it.str });
    });
    const texts = lines.map((l) => clean(l.str).replace(/(,\s*)+,/g, ",").replace(/,\s*$/, "")).filter(Boolean);
    if (texts.length) {
      out.centreName = texts[0];
      out.centreAddress = clean(texts.slice(1).join(", ").replace(/,\s*,/g, ","));
    }
  }

  const mapUrl = (links || []).find((u) => /google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(u || ""));
  if (mapUrl) {
    out.mapUrl = mapUrl;
    const a = addressFromMapLink(mapUrl);
    if (a) {
      if (!out.centreName && a.parts.length) out.centreName = a.parts[0];
      if (!out.centreAddress && a.parts.length > 1) out.centreAddress = a.parts.slice(1).join(", ");
      if (!out.pincode && a.pin) out.pincode = a.pin;
    }
  }
  out.pincode = out.pincode || (out.centreAddress.match(/\b\d{6}\b/) || [])[0] || "";

  // Fallbacks from the whole text if the layout changed
  const full = clean(all.map((i) => i.str).join(" "));
  if (!out.examStart) {
    const m = full.match(/(\d{1,2}[:.]\d{2}\s*[AP]\.?M)\.?\s*(?:\(IST\))?\s*(?:to|-)\s*(\d{1,2}[:.]\d{2}\s*[AP]\.?M)/i);
    if (m) { out.examStart = to24h(m[1]); out.examEnd = to24h(m[2]); }
  }
  if (!out.examDate) out.examDate = parseDate((full.match(/\d{1,2}\s*(?:st|nd|rd|th)?\s+November\s+\d{4}/i) || [])[0] || "");
  out.slot = slotFromStart(out.examStart, out.session);
  out.ok = Boolean(out.examStart && (out.centreName || out.centreAddress) && out.city);
  return out;
}

let pdfjsPromise = null;
function loadPdfJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PDFJS_URL;
      s.async = true;
      s.onload = () => {
        const lib = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
        if (!lib) return reject(new Error("PDF reader failed to load"));
        lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        resolve(lib);
      };
      s.onerror = () => { pdfjsPromise = null; reject(new Error("Could not load the PDF reader. Check your internet and try again.")); };
      document.head.appendChild(s);
    });
  }
  return pdfjsPromise;
}

// Browser: File -> parsed fields
export async function readAdmitCardPdf(file) {
  const lib = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await lib.getDocument({ data, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const [tc, ann] = await Promise.all([page.getTextContent(), page.getAnnotations().catch(() => [])]);
  const items = tc.items.map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5] }));
  const links = (ann || []).map((a) => a.url || a.unsafeUrl).filter(Boolean);
  try { doc.destroy(); } catch {}
  return parseAdmitCardItems(items, links);
}
