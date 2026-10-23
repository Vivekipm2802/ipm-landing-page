import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import s from "../CatPlanner.module.css";
import {
  CHECKLIST, PLANNER_PATH, CENTRES_PATH, SITE, EXAM_DATE, ADMIT_CARD_DATE, planTimes, fmtTime, fmtDay, cityBySlug,
  directionsUrl, uberUrl, mapsSearchUrl, gcalUrl, centreQuery, addMin, istDate,
} from "../../lib/catPlanner";

const TRAVEL = [15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240];

export async function getServerSideProps({ params, res }) {
  res.setHeader("Cache-Control", "private, no-store");
  const uid = String(params.uid || "");
  if (!/^[A-Za-z0-9]{8,16}$/.test(uid)) return { notFound: true };
  try {
    const { catDb, ensureCentreEnriched, centreCounts, safe } = await import("../../lib/catPlannerServer");
    const db = catDb();
    const { data: p } = await db.from("cat_planner")
      .select("id, uid, name, city_slug, centre_id, slot, exam_date, exam_start, exam_end, reporting_time, gate_time, start_area, travel_mins, input_mode, wa_opt_in, carpool_opt_in, carpool_area")
      .eq("uid", uid).maybeSingle();
    if (!p) return { notFound: true };
    let centre = null, counts = { total: 0, bySlot: { 1: 0, 2: 0, 3: 0 } }, carpoolMatches = 0;
    if (p.centre_id) {
      const { data: c } = await db.from("cat_centres").select("*").eq("id", p.centre_id).maybeSingle();
      centre = c ? await ensureCentreEnriched(db, c, 3500) : null;
      counts = await safe(() => centreCounts(db, p.centre_id), counts);
      if (p.carpool_opt_in) {
        const { count } = await db.from("cat_planner").select("id", { count: "exact", head: true }).eq("centre_id", p.centre_id).eq("slot", p.slot).eq("carpool_opt_in", true).neq("id", p.id);
        carpoolMatches = count || 0;
      }
    }
    const { count: cityPlans } = p.city_slug ? await db.from("cat_planner").select("id", { count: "exact", head: true }).eq("city_slug", p.city_slug) : { count: 0 };
    const { data: g } = p.city_slug ? await db.from("cat_city_groups").select("whatsapp_link").eq("city_slug", p.city_slug).maybeSingle() : { data: null };
    const { id, name, ...rest } = p;
    return {
      props: {
        plan: { ...rest, first: String(name || "").trim().split(/\s+/)[0] || "there" },
        centre: centre ? { id: centre.id, name: centre.name, address: centre.address, pincode: centre.pincode, city: centre.city, city_slug: centre.city_slug, slug: centre.slug, lat: centre.lat, lng: centre.lng, geo_precision: centre.geo_precision, nearby: centre.nearby || null } : null,
        counts, carpoolMatches, cityPlans: cityPlans || 0, groupLink: g?.whatsapp_link || null,
      },
    };
  } catch {
    return { notFound: true };
  }
}

export default function PlanPage({ plan: initialPlan, centre, counts, carpoolMatches: initialMatches, cityPlans, groupLink }) {
  const [plan, setPlan] = useState(initialPlan);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState({});
  const [travelEdit, setTravelEdit] = useState({ startArea: initialPlan.start_area || "", travelMins: initialPlan.travel_mins || "" });
  const [saving, setSaving] = useState("");
  const [matches, setMatches] = useState(initialMatches);
  const [carpoolArea, setCarpoolArea] = useState(initialPlan.carpool_area || initialPlan.start_area || "");
  const [wx, setWx] = useState(null);
  const [toast, setToast] = useState("");

  const city = cityBySlug(plan.city_slug);
  const t = useMemo(() => planTimes(plan, city), [plan, city]);
  const early = !centre;
  const planLink = `${SITE}${PLANNER_PATH}/${plan.uid}`;
  const shareLink = `${SITE}${PLANNER_PATH}?ref=${plan.uid}`;
  const key = `cat26-check-${plan.uid}`;

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), 1000);
    try { setDone(JSON.parse(localStorage.getItem(key) || "{}")); } catch {}
    return () => clearInterval(iv);
  }, [key]);

  useEffect(() => {
    const lat = centre?.lat || city?.lat, lng = centre?.lng || city?.lng;
    if (!lat) return;
    const day = t.date || EXAM_DATE;
    const daysAway = (new Date(`${day}T00:00:00+05:30`) - Date.now()) / 86400000;
    if (daysAway > 15 || daysAway < -1) { setWx({ unavailable: true, daysAway }); return; }
    const hour = (t.reportingAt ? new Date(t.reportingAt.getTime() + 5.5 * 3600000).getUTCHours() : 8);
    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,visibility,precipitation_probability,weather_code&timezone=Asia%2FKolkata&start_date=${day}&end_date=${day}`).then((r) => r.json()),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=us_aqi,pm2_5&timezone=Asia%2FKolkata&start_date=${day}&end_date=${day}`).then((r) => r.json()).catch(() => null),
    ]).then(([w, a]) => {
      const i = Math.max(0, Math.min(23, hour - 1));
      setWx({
        temp: w?.hourly?.temperature_2m?.[i], vis: w?.hourly?.visibility?.[i], rain: w?.hourly?.precipitation_probability?.[i], code: w?.hourly?.weather_code?.[i],
        aqi: a?.hourly?.us_aqi?.[i], pm: a?.hourly?.pm2_5?.[i], hour: i,
      });
    }).catch(() => setWx({ error: true }));
  }, [centre?.lat, centre?.lng, city?.lat, city?.lng, t.date, t.reportingAt]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const update = async (patch, label) => {
    setSaving(label);
    try {
      const r = await fetch("/api/cat-planner-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: plan.uid, ...patch }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (typeof d.carpoolMatches === "number") setMatches(d.carpoolMatches);
      flash("Saved");
      return true;
    } catch (e) {
      flash(e.message || "Could not save");
      return false;
    } finally { setSaving(""); }
  };
  const saveTravel = async () => {
    const travelMins = Number(travelEdit.travelMins) || null;
    if (await update({ startArea: travelEdit.startArea, travelMins }, "travel")) setPlan((p) => ({ ...p, start_area: travelEdit.startArea, travel_mins: travelMins }));
  };
  const toggleCarpool = async (on) => {
    if (await update({ carpoolOptIn: on, carpoolArea }, "carpool")) setPlan((p) => ({ ...p, carpool_opt_in: on, carpool_area: carpoolArea }));
  };
  const toggleWa = async (on) => { if (await update({ waOptIn: on }, "wa")) setPlan((p) => ({ ...p, wa_opt_in: on })); };
  const tick = (id) => setDone((d) => { const n = { ...d, [id]: !d[id] }; try { localStorage.setItem(key, JSON.stringify(n)); } catch {} return n; });
  const copy = async (text, msg = "Copied") => { try { await navigator.clipboard.writeText(text); flash(msg); } catch { flash("Long-press to copy"); } };
  const copyThenOpen = async (url) => { await copy(centreQuery(centre), "Centre address copied. Paste it as the drop location."); window.open(url, "_blank", "noopener"); };

  const target = t.startAt || new Date(`${EXAM_DATE}T08:30:00+05:30`);
  const left = Math.max(0, target.getTime() - now);
  const cd = { d: Math.floor(left / 86400000), h: Math.floor((left % 86400000) / 3600000), m: Math.floor((left % 3600000) / 60000), s: Math.floor((left % 60000) / 1000) };
  const checked = CHECKLIST.filter((c) => done[c.id]).length;

  const timeline = early ? [] : [
    { at: t.nightBeforeAt, title: "Pack your bag", text: "Tick the checklist below and keep everything by the door. Set two alarms. Sleep early." },
    { at: t.wakeAt, title: "Wake up", text: "Light breakfast, nothing new. Keep your phone for the trip; it stays outside the lab." },
    { at: t.leaveAt, title: "Leave home", text: t.leaveAt ? `${t.travel} min travel + ${t.buffer} min buffer${t.fogBuffer ? " (includes 20 min for morning fog)" : ""}.` : "Add your travel time below to get your exact leave-by time.", key: true, missing: !t.leaveAt },
    { at: t.reportingAt, title: "Reach the centre", text: "Reporting time on your card. Entry, ID check and frisking take a while." },
    { at: t.gateAt, title: "Gate closes", text: "No entry after this, whatever the reason.", key: true },
    { at: t.startAt, title: "CAT starts", text: t.endAt ? `Ends at ${fmtTime(t.endAt)}. All the best!` : "All the best!" },
  ];

  const nb = centre?.nearby;
  const fog = city?.fog && Number(plan.slot) === 1;

  return (
    <AppShell activePage={PLANNER_PATH} pageTitle="Your CAT Exam Day Plan">
      <Head>
        <title>Your CAT 2026 exam day plan | IPM Careers</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <div className={s.page}>
        <div className={s.narrow}>
          <div className={s.planHead}>
            <span className={s.eyebrow}><span className={s.pulse} /> CAT 2026 · {fmtDay(t.date)}</span>
            <h1 className={s.title} style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)" }}>Hi {plan.first}, <span className={s.accent}>{early ? "your plan is saved." : "here’s your exam day."}</span></h1>
            <div className={s.countdown} aria-label="Countdown to your CAT slot">
              {[["d", "days"], ["h", "hours"], ["m", "min"], ["s", "sec"]].map(([k, l]) => (
                <div key={k} className={s.cd}><div className={s.cdNum}>{mounted ? String(cd[k]).padStart(2, "0") : "--"}</div><div className={s.cdLbl}>{l}</div></div>
              ))}
            </div>
            <div className={s.pills}>
              {plan.slot && <span className={s.pill}>Slot {plan.slot}{t.startAt ? `: ${fmtTime(t.startAt)} to ${fmtTime(t.endAt)}` : ""}</span>}
              {city && <span className={s.pill}>📍 {city.name}</span>}
              {!early && <span className={`${s.pill} ${s.pillMute}`}>{t.fromCard ? "Times from your admit card" : "Usual slot timings: confirm on your card"}</span>}
            </div>
          </div>

          {early && (
            <div className={`${s.card} ${s.cardGold}`}>
              <h2 className={s.cardTitle}>Admit cards come out on {fmtDay(ADMIT_CARD_DATE)}</h2>
              <p className={s.cardSub}>Bookmark this page. When the card is out, upload it here with the same mobile number and this page becomes your full exam day plan: leave-by time, route, cab, alarms and checklist.</p>
              <Link href={`${PLANNER_PATH}#start`} className={s.btn}>Upload my admit card →</Link>
              {cityPlans > 1 && <p className={s.note} style={{ marginTop: 10 }}>{cityPlans.toLocaleString("en-IN")} students in {city?.name || "your city"} are using this planner.</p>}
            </div>
          )}

          {!early && (
            <>
              <div className={s.card}>
                <h2 className={s.cardTitle}>Your test centre</h2>
                <p className={s.cardSub} style={{ marginBottom: 6 }}><b style={{ color: "#f4f1ea" }}>{centre.name}</b><br />{centre.address}</p>
                <div className={s.actions}>
                  <a className={s.action} href={directionsUrl(centre, plan.start_area)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🗺️</span><span className={s.actionTitle}>Google Maps</span><span className={s.actionSub}>Route{plan.start_area ? " from your area" : ""}</span></a>
                  <a className={s.action} href={uberUrl(centre)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🚖</span><span className={s.actionTitle}>Uber</span><span className={s.actionSub}>Drop set to centre</span></a>
                  <button type="button" className={s.action} onClick={() => copyThenOpen("https://book.olacabs.com/")}><span className={s.actionIcon}>🚕</span><span className={s.actionTitle}>Ola</span><span className={s.actionSub}>Copies address, opens Ola</span></button>
                  <button type="button" className={s.action} onClick={() => copyThenOpen("https://www.rapido.bike/")}><span className={s.actionIcon}>🛵</span><span className={s.actionTitle}>Rapido</span><span className={s.actionSub}>Copies address, opens Rapido</span></button>
                  <button type="button" className={s.action} onClick={() => copy(centreQuery(centre), "Centre address copied")}><span className={s.actionIcon}>📋</span><span className={s.actionTitle}>Copy address</span><span className={s.actionSub}>For any app</span></button>
                  <Link className={s.action} href={`${CENTRES_PATH}/${centre.city_slug}/${centre.slug}`}><span className={s.actionIcon}>⭐</span><span className={s.actionTitle}>Centre page</span><span className={s.actionSub}>Reviews, parking, stations</span></Link>
                </div>
                <p className={s.note} style={{ marginTop: 10 }}>Visit the centre a day before if you can, at the same time of day as your slot.</p>
              </div>

              <div className={s.card}>
                <h2 className={s.cardTitle}>Your exam day timeline</h2>
                <ol className={s.tl}>
                  {timeline.map((x) => (
                    <li key={x.title} className={`${s.tlItem} ${x.key ? s.tlKey : ""}`}>
                      <span className={s.tlTime}>{x.at ? fmtTime(x.at) : "--"}</span>
                      <div><div className={s.tlTitle}>{x.title}{x.title === "Pack your bag" ? " (night before)" : ""}</div><div className={s.tlText}>{x.text}</div></div>
                    </li>
                  ))}
                </ol>
                <div className={s.form} style={{ marginTop: 12 }}>
                  <div className={s.row2}>
                    <label className={s.field}><span className={s.label}>Leaving from</span><input className={s.input} value={travelEdit.startArea} onChange={(e) => setTravelEdit((x) => ({ ...x, startArea: e.target.value }))} placeholder="Area or landmark" /></label>
                    <div className={s.field}>
                      <span className={s.label}>Travel time to the centre</span>
                      <select className={s.select} value={travelEdit.travelMins} onChange={(e) => setTravelEdit((x) => ({ ...x, travelMins: e.target.value }))}>
                        <option value="">Not sure yet</option>
                        {TRAVEL.map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={s.cta}>
                    <a className={s.link} href={directionsUrl(centre, travelEdit.startArea)} target="_blank" rel="noopener noreferrer">Check the travel time on Google Maps</a>
                    <button type="button" className={s.btnGhost} onClick={saveTravel} disabled={saving === "travel"}>{saving === "travel" ? "Saving…" : "Update my leave-by time"}</button>
                  </div>
                </div>
              </div>

              <div className={s.card}>
                <h2 className={s.cardTitle}>Alarms on your phone</h2>
                <p className={s.cardSub}>One file adds four reminders: pack the night before, leave now, gate closes in 30 minutes, and the exam itself.</p>
                <div className={s.actions}>
                  <a className={s.action} href={`/api/cat-planner-ics?uid=${plan.uid}`}><span className={s.actionIcon}>📅</span><span className={s.actionTitle}>Add all alarms</span><span className={s.actionSub}>iPhone, Outlook, Android</span></a>
                  {t.leaveAt && <a className={s.action} href={gcalUrl({ title: "Leave now for CAT", start: t.leaveAt, end: addMin(t.leaveAt, 15), details: `Reporting ${fmtTime(t.reportingAt)}. Plan: ${planLink}`, location: centreQuery(centre) })} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>⏰</span><span className={s.actionTitle}>Google Calendar</span><span className={s.actionSub}>“Leave now” at {fmtTime(t.leaveAt)}</span></a>}
                  <a className={s.action} href={gcalUrl({ title: "CAT tomorrow: pack your bag", start: t.nightBeforeAt, end: addMin(t.nightBeforeAt, 30), details: `Admit card with photo, original ID, 2 pens, transparent bottle. Plan: ${planLink}` })} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🎒</span><span className={s.actionTitle}>Google Calendar</span><span className={s.actionSub}>Night-before checklist</span></a>
                </div>
              </div>
            </>
          )}

          <div className={s.card}>
            <h2 className={s.cardTitle}>What to carry ({checked}/{CHECKLIST.length})</h2>
            <div className={s.progress}><div className={s.progressBar} style={{ width: `${(checked / CHECKLIST.length) * 100}%` }} /></div>
            <ul className={s.chkList}>
              {CHECKLIST.map((c) => (
                <li key={c.id} className={`${s.chk} ${done[c.id] ? s.chkOn : ""}`} onClick={() => tick(c.id)} role="checkbox" aria-checked={!!done[c.id]} tabIndex={0} onKeyDown={(e) => (e.key === " " || e.key === "Enter") && tick(c.id)}>
                  <span className={s.chkBox}>{done[c.id] ? "✓" : ""}</span><span>{c.text}</span>
                </li>
              ))}
            </ul>
            <p className={s.note} style={{ marginTop: 8 }}>From the rules printed on CAT admit cards. Your own card’s instructions are final.</p>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>Weather and air on exam morning</h2>
            {!wx && <p className={s.cardSub}>Loading…</p>}
            {wx?.unavailable && <p className={s.cardSub}>The forecast for {city?.name || "your city"} appears here about two weeks before the exam (from mid-November).</p>}
            {wx?.error && <p className={s.cardSub}>Could not load the forecast right now.</p>}
            {wx && !wx.unavailable && !wx.error && (
              <>
                <p className={s.cardSub}>Forecast for {city?.name || "your centre"} around {fmtTime(t.reportingAt || istDate(t.date, "08:00"))} on {fmtDay(t.date)}.</p>
                <div className={s.wx}>
                  <div className={s.wxBox}><div className={s.wxNum}>{wx.temp != null ? `${Math.round(wx.temp)}°C` : "–"}</div><div className={s.wxLbl}>Temperature</div></div>
                  <div className={s.wxBox}><div className={s.wxNum}>{wx.vis != null ? (wx.vis >= 1000 ? `${Math.round(wx.vis / 1000)} km` : `${Math.round(wx.vis)} m`) : "–"}</div><div className={s.wxLbl}>Visibility</div></div>
                  <div className={s.wxBox}><div className={s.wxNum}>{wx.rain != null ? `${wx.rain}%` : "–"}</div><div className={s.wxLbl}>Chance of rain</div></div>
                  <div className={s.wxBox}><div className={s.wxNum}>{wx.aqi != null ? Math.round(wx.aqi) : "–"}</div><div className={s.wxLbl}>Air quality (US AQI)</div></div>
                </div>
                {(wx.vis != null && wx.vis < 1000) || wx.code === 45 || wx.code === 48 ? <div className={s.warn}>🌫️ Fog is forecast. Leave 20 to 30 minutes earlier than usual.</div> : null}
                {wx.aqi != null && wx.aqi > 200 && <div className={s.warn}>😷 Air quality is forecast to be poor. A mask for the journey helps; check your card’s rules for wearing one inside.</div>}
              </>
            )}
            {fog && <div className={s.warn}>🌫️ You are in the morning slot in {city.name}, where late-November mornings are often foggy or smoggy. Your leave-by time already includes 20 extra minutes.</div>}
          </div>

          {!early && (
            <div className={s.card}>
              <h2 className={s.cardTitle}>Students at your centre</h2>
              <p className={s.cardSub}>Counts only. Nobody can see who you are.</p>
              <div className={s.mates}>
                <div className={s.mate}><div className={s.mateNum}>{counts.total}</div><div className={s.mateLbl}>at your centre</div></div>
                <div className={s.mate}><div className={s.mateNum}>{counts.bySlot[plan.slot] || 0}</div><div className={s.mateLbl}>in your slot</div></div>
                <div className={s.mate}><div className={s.mateNum}>{cityPlans}</div><div className={s.mateLbl}>in {city?.name || "your city"}</div></div>
              </div>
              {groupLink ? (
                <a className={s.btnGhost} href={groupLink} target="_blank" rel="noopener noreferrer">💬 Join the {city?.name} CAT 2026 WhatsApp group</a>
              ) : (
                <p className={s.note}>A moderated WhatsApp group for {city?.name || "your city"} opens once enough students join. {plan.wa_opt_in ? "We will send you the link." : ""}</p>
              )}
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(236,232,225,0.08)", paddingTop: 12 }}>
                <div className={s.tlTitle}>🚗 Share a cab</div>
                {plan.carpool_opt_in ? (
                  <>
                    <p className={s.cardSub} style={{ marginTop: 4 }}>You’re in. {matches > 0 ? `${matches} other student${matches > 1 ? "s" : ""} in your slot at this centre ${matches > 1 ? "have" : "has"} opted in too.` : "Nobody else in your slot has opted in yet."} We introduce matches on WhatsApp, first names only.</p>
                    <button type="button" className={s.link} onClick={() => toggleCarpool(false)} disabled={saving === "carpool"}>Opt out</button>
                  </>
                ) : (
                  <div className={s.form} style={{ marginTop: 6 }}>
                    <label className={s.field}><span className={s.label}>Your area (so we match people nearby)</span><input className={s.input} value={carpoolArea} onChange={(e) => setCarpoolArea(e.target.value)} placeholder="e.g. Kakadeo" /></label>
                    <button type="button" className={s.btnGhost} onClick={() => toggleCarpool(true)} disabled={saving === "carpool"}>{saving === "carpool" ? "Saving…" : "I’m open to sharing a cab"}</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!early && nb && (nb.rail?.length || nb.metro?.length || nb.bus?.length || nb.parking?.length) ? (
            <div className={s.card}>
              <h2 className={s.cardTitle}>Getting there</h2>
              <p className={s.cardSub}>From OpenStreetMap{centre.geo_precision !== "address" ? ", measured from the centre’s area" : ""}. Distances are straight-line.</p>
              <div className={s.near}>
                {[["rail", "🚆 Railway station"], ["metro", "🚇 Metro"], ["bus", "🚌 Bus stand"], ["parking", "🅿️ Parking"]].filter(([k]) => nb[k]?.length).map(([k, l]) => (
                  <div key={k} className={s.nearBox}><div className={s.nearK}>{l}</div><div className={s.nearV}>{nb[k].map((x) => <div key={x.name}>{x.name} · {x.km} km</div>)}</div></div>
                ))}
              </div>
            </div>
          ) : null}

          {!early && (
            <div className={s.card}>
              <h2 className={s.cardTitle}>Coming from another city?</h2>
              <p className={s.cardSub}>Stay close to the centre the night before, especially for the morning slot.</p>
              <div className={s.actions}>
                <a className={s.action} href={mapsSearchUrl(`hotels near ${centreQuery(centre)}`)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🏨</span><span className={s.actionTitle}>Hotels nearby</span><span className={s.actionSub}>Google Maps</span></a>
                <a className={s.action} href={mapsSearchUrl(`hostel near ${centreQuery(centre)}`)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🛏️</span><span className={s.actionTitle}>Hostels & PGs</span><span className={s.actionSub}>Google Maps</span></a>
                <a className={s.action} href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${centre.city || city?.name || ""}`)}${centre.lat ? `&latitude=${centre.lat}&longitude=${centre.lng}` : ""}&checkin=2026-11-28&checkout=2026-11-29&group_adults=1&no_rooms=1`} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🛎️</span><span className={s.actionTitle}>Booking.com</span><span className={s.actionSub}>28 to 29 Nov</span></a>
              </div>
            </div>
          )}

          <div className={s.card}>
            <h2 className={s.cardTitle}>Reminders and sharing</h2>
            <label className={s.check}><input type="checkbox" checked={!!plan.wa_opt_in} onChange={(e) => toggleWa(e.target.checked)} disabled={saving === "wa"} /><span>CAT updates on WhatsApp from IPM Careers</span></label>
            <div className={s.actions} style={{ marginTop: 12 }}>
              <a className={s.action} href={`https://wa.me/?text=${encodeURIComponent(`Taking CAT on 29 Nov? Upload your admit card here and get your leave-by time, route to the centre, alarms and checklist (free): ${shareLink}`)}`} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>💬</span><span className={s.actionTitle}>Share with friends</span><span className={s.actionSub}>Help your CAT group</span></a>
              <button type="button" className={s.action} onClick={() => copy(planLink, "Your plan link is copied. Bookmark it.")}><span className={s.actionIcon}>🔖</span><span className={s.actionTitle}>Copy my plan link</span><span className={s.actionSub}>Open it on exam day</span></button>
            </div>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>After the exam</h2>
            <div className={s.actions}>
              <Link className={s.action} href="/cat-score-calculator"><span className={s.actionIcon}>🎓</span><span className={s.actionTitle}>CAT score calculator</span><span className={s.actionSub}>When response sheets are out</span></Link>
              <Link className={s.action} href="/mba-application-forms"><span className={s.actionIcon}>🗓️</span><span className={s.actionTitle}>MBA forms & deadlines</span><span className={s.actionSub}>Don’t miss a last date</span></Link>
              {centre && <Link className={s.action} href={`${CENTRES_PATH}/${centre.city_slug}/${centre.slug}#review`}><span className={s.actionIcon}>⭐</span><span className={s.actionTitle}>Review your centre</span><span className={s.actionSub}>Help next year’s students</span></Link>}
            </div>
          </div>

          <div className={s.disclaimer}>⚠️ Go by your own admit card and iimcat.ac.in for reporting time, gate time, centre address and rules. Travel times are estimates; leave earlier if in doubt.</div>
        </div>
        {toast && <div role="status" style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", background: "#f4f1ea", color: "#0b0b0c", padding: "10px 16px", borderRadius: 999, fontWeight: 700, fontSize: ".86rem", zIndex: 50, maxWidth: "90vw", textAlign: "center" }}>{toast}</div>}
      </div>
    </AppShell>
  );
}
