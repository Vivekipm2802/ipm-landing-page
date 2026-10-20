// ═══════════════════════════════════════════════════════════════════
// MBA 2027-29 application forms & deadlines (used by /mba-application-forms)
// Last checked: 18 Oct 2026. Dates are IST, the last day to submit.
//
// Fields
//   id, name, programme, type: "exam" | "iim" | "iit" | "bschool" | "symbiosis"
//   exams: accepted tests
//   opens: "YYYY-MM-DD" | null          → before this date the card shows "Opening soon"
//   deadline: "YYYY-MM-DD" | null       → main / final last date
//   dateText: shown when there is no exact deadline (e.g. "3rd week of Dec 2026")
//   rounds: [{ label, date }]           → early / multiple deadlines (next one is highlighted)
//   mode: "dated" (default) | "via-cat" | "opening-soon" | "rolling" | "closed" | "year-round"
//   fee, link (official apply / admissions page), note
//   source: "official" (checked on the official site) | "awaited" (official notice not out yet)
//   lastCycle: what happened last year, for "opening soon" entries (not a prediction)
// ═══════════════════════════════════════════════════════════════════

export const CHECKED_ON = "2026-10-19";

export const MBA_FORMS = [
  // ── Entrance exams ─────────────────────────────────────────────
  {
    id: "xat-2027", name: "XAT 2027", programme: "Entrance exam (XLRI & 160+ B-schools)", type: "exam",
    exams: ["XAT"], opens: "2026-07-15", deadline: "2026-12-06",
    rounds: [{ label: "Exam", date: "2027-01-03" }],
    fee: "₹2,300 + ₹200 per XLRI programme", link: "https://xatonline.in/registration",
    note: "Exam on Sunday 3 Jan 2027, 2-5 PM. XLRI programmes are chosen inside the XAT form.", source: "official",
  },
  {
    id: "snap-2026", name: "SNAP 2026", programme: "Entrance exam (Symbiosis institutes)", type: "exam",
    exams: ["SNAP"], opens: "2026-08-21", deadline: "2026-11-25",
    rounds: [{ label: "SNAP test 1", date: "2026-12-13" }, { label: "SNAP test 2", date: "2026-12-19" }, { label: "SNAP test 3", date: "2026-12-26" }],
    fee: "₹2,550 per attempt + ₹1,000 per programme", link: "https://www.snaptest.org/",
    note: "Up to 3 attempts, best score counts. Each Symbiosis institute also has its own programme registration (see Symbiosis cards).", source: "official",
  },
  {
    id: "nmat-2026", name: "NMAT by GMAC 2026", programme: "Entrance exam (NMIMS & others)", type: "exam",
    exams: ["NMAT"], opens: "2026-08-20", deadline: "2026-10-25",
    rounds: [{ label: "Retake registration closes", date: "2026-12-17" }, { label: "Testing window ends", date: "2026-12-20" }],
    fee: "₹3,000 + taxes", link: "https://www.mba.com/exams/nmat/register-schedule",
    note: "Tests run 2 Nov to 20 Dec 2026. Retake registration opens 3 Nov.", source: "official",
  },
  {
    id: "mat-dec-2026", name: "MAT December 2026", programme: "Entrance exam (AIMA)", type: "exam",
    exams: ["MAT"], opens: null, deadline: "2026-12-21",
    rounds: [{ label: "Paper-based test (PBT) registration closes", date: "2026-12-14" }, { label: "PBT exam", date: "2026-12-20" }, { label: "Computer-based test (CBT) registration closes", date: "2026-12-21" }, { label: "CBT exam", date: "2026-12-27" }],
    fee: "₹2,300 (PBT or CBT), ₹4,000 (both)", link: "https://mat.aima.in/",
    note: "No internet-based test this session.", source: "official",
  },
  {
    id: "ibsat-2026", name: "IBSAT 2026", programme: "Entrance exam (IBS, 9 campuses)", type: "exam",
    exams: ["IBSAT"], opens: "2026-07-01", deadline: "2026-12-22",
    rounds: [{ label: "Apply for tests 1-2 (5-6 Dec)", date: "2026-12-01" }, { label: "Apply for tests 3-4 (12-13 Dec)", date: "2026-12-08" }, { label: "Apply for tests 5-6 (19-20 Dec)", date: "2026-12-15" }, { label: "Apply for tests 7-8 (26-27 Dec)", date: "2026-12-22" }],
    fee: "₹1,800 (one form, all IBS campuses)", link: "https://www.ibsindia.org/admissions/",
    note: "Remote-proctored online test on December weekends. IBS also accepts CAT, XAT, NMAT and GMAT scores.", source: "official",
  },
  {
    id: "cmat-2027", name: "CMAT 2027", programme: "Entrance exam (NTA)", type: "exam",
    exams: ["CMAT"], mode: "opening-soon", fee: "To be announced", link: "https://cmat.nta.nic.in/",
    note: "NTA has not released the CMAT 2027 notice yet.", lastCycle: "CMAT 2026 applications opened on 17 Oct 2025.", source: "awaited",
  },
  {
    id: "mah-cet-2027", name: "MAH MBA/MMS CET 2027", programme: "State exam (JBIMS, SIMSREE, PUMBA & Maharashtra colleges)", type: "exam",
    exams: ["MAH CET"], mode: "opening-soon", fee: "To be announced", link: "https://cetcell.mahacet.org/",
    note: "Not notified yet. JBIMS and other Maharashtra MMS/MBA seats are filled through this exam and the state CAP process.",
    lastCycle: "Registration usually runs January-February.", source: "awaited",
  },
  {
    id: "cat-2026", name: "CAT 2026", programme: "Entrance exam (IIMs & 1,000+ B-schools)", type: "exam",
    exams: ["CAT"], mode: "closed", opens: "2026-08-03", deadline: "2026-09-22",
    rounds: [{ label: "Exam", date: "2026-11-29" }],
    fee: "₹2,700 (₹1,350 SC/ST/PwBD)", link: "https://iimcat.ac.in/",
    note: "Registration closed on 22 Sep 2026 (extended from 15 Sep). Exam on Sunday 29 Nov 2026.", source: "official",
  },
  {
    id: "gmat", name: "GMAT Focus Edition", programme: "Entrance exam (ISB, IIM one-year & GMAT routes)", type: "exam",
    exams: ["GMAT"], mode: "year-round", fee: "See mba.com", link: "https://www.mba.com/exams/gmat-exam/register",
    note: "Book a slot any time. Plan it around each school's GMAT deadline.", source: "official",
  },

  // ── IIMs ───────────────────────────────────────────────────────
  {
    id: "iim-cat", name: "IIM Ahmedabad, Bangalore, Calcutta & most IIMs", programme: "MBA / PGP 2027-29", type: "iim",
    exams: ["CAT"], mode: "via-cat", fee: "Included in the CAT fee", link: "https://iimcat.ac.in/",
    note: "No separate form: IIMs are selected in the CAT 2026 application (closed 22 Sep). Shortlists come after the CAT result. IIM Calcutta asks shortlisted candidates to fill an interview form later.", source: "official",
  },
  {
    id: "iim-mumbai", name: "IIM Mumbai", programme: "MBA, MBA (OSCM), MBA (Sustainability) 2027-29", type: "iim",
    exams: ["CAT"], mode: "opening-soon", fee: "Last cycle: ₹2,000 (₹1,000 reserved)", link: "https://iimmumbai.ac.in/admissions",
    note: "Needs a separate IIM Mumbai application in addition to CAT. 2027-29 notice not out yet.",
    lastCycle: "Last year the form opened after the CAT result.", source: "awaited",
  },
  {
    id: "iim-rohtak", name: "IIM Rohtak", programme: "PGP (MBA) 2027-29", type: "iim",
    exams: ["CAT"], mode: "via-cat", fee: "Last cycle: ₹3,095 registration", link: "https://admission.iimrohtak.ac.in/",
    note: "Chosen in the CAT form, then a paid registration on IIM Rohtak's portal after the CAT result (link is emailed).",
    lastCycle: "Last year's registration ran 26 Dec 2025 to 9 Jan 2026.", source: "awaited",
  },
  {
    id: "iim-udaipur", name: "IIM Udaipur", programme: "MBA 2027-29", type: "iim",
    exams: ["CAT"], mode: "via-cat", fee: "No separate fee", link: "https://mba.iimu.ac.in/admissions/",
    note: "No form before CAT, but eligible candidates get an email after the CAT result to complete a mandatory registration.", source: "awaited",
  },

  // ── IITs (forms open after the CAT result) ─────────────────────
  {
    id: "iit-bombay", name: "SJMSOM, IIT Bombay", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "See official site", link: "https://www.som.iitb.ac.in/master-of-business-administration-programme/",
    note: "Opens after the CAT 2026 result.", lastCycle: "Last year: 1 Jan to 2 Feb 2026.", source: "awaited",
  },
  {
    id: "iit-delhi", name: "DMS, IIT Delhi", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,600 (₹800 reserved)", link: "https://dms.iitd.ac.in/mba/",
    note: "2027 notice not out yet.", lastCycle: "Last year: 30 Nov 2025 to 1 Feb 2026 (extended).", source: "awaited",
  },
  {
    id: "iit-madras", name: "DoMS, IIT Madras", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,600 (₹800 reserved)", link: "https://doms.iitm.ac.in/index.php/admissions/mba-admissions/",
    note: "Form opens the day after the CAT result.", lastCycle: "Last year: 25 Dec 2025 to 31 Jan 2026.", source: "awaited",
  },
  {
    id: "iit-kanpur", name: "DoMS, IIT Kanpur", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹2,000 (₹1,000 reserved)", link: "https://iitk.ac.in/doms/mba-admission-notice",
    note: "2027-29 notice not out yet.", lastCycle: "Last year: 25 Dec 2025 to 10 Feb 2026 (extended).", source: "awaited",
  },
  {
    id: "iit-kharagpur", name: "VGSoM, IIT Kharagpur", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,600 (₹800 reserved)", link: "https://som.iitkgp.ac.in/MBA/index.php",
    note: "Opens one day after the CAT result.", lastCycle: "Last year it closed on 5 Feb 2026.", source: "awaited",
  },
  {
    id: "iit-roorkee", name: "DoMS, IIT Roorkee", programme: "MBA 2027-29", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "See official site", link: "https://iitr.ac.in/Academics/Admission%20To%20MBA%20Programmes.html",
    note: "2027 notice not out yet.", source: "awaited",
  },

  // ── Top B-schools ──────────────────────────────────────────────
  {
    id: "spjimr", name: "SPJIMR Mumbai", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "GMAT"],
    opens: "2026-09-15", deadline: "2026-11-27", fee: "₹2,500", link: "https://pgdmadmissions.spjimr.org/",
    note: "For freshers and up to 5 years of work experience.", source: "official",
  },
  {
    id: "mdi", name: "MDI Gurgaon", programme: "PGDM, HRM, IB, Business Analytics, BFS 2027-29", type: "bschool", exams: ["CAT", "GMAT (IB)"],
    opens: "2026-09-24", deadline: "2026-11-28", fee: "₹3,000 incl. GST (₹3,590 with MDI Murshidabad)", link: "https://admissions.mdi.ac.in/mdi-application-form",
    note: "Closes at 5 PM on 28 Nov, the day before CAT.", source: "official",
  },
  {
    id: "iift", name: "IIFT Delhi / Kolkata / Kakinada / GIFT City", programme: "MBA (IB) and MBA (BA) 2027-29", type: "bschool", exams: ["CAT"],
    opens: "2026-10-12", deadline: "2026-11-25", fee: "₹3,000 (₹1,500 reserved); MBA (BA) ₹2,000", link: "https://applyadmission.net/iift2027/",
    note: "Separate IIFT form needed; shortlisting uses CAT 2026.", source: "official",
  },
  {
    id: "xlri", name: "XLRI Jamshedpur / Delhi", programme: "PGDM (BM, HRM, GM) 2027-29", type: "bschool", exams: ["XAT", "GMAT/GRE (GM)"],
    opens: "2026-07-15", deadline: "2026-12-06", fee: "₹2,300 XAT + ₹200 per XLRI programme", link: "https://applications.xatonline.in/",
    note: "Applied for inside the XAT 2027 form. GMAT/GRE route for PGDM (GM) reportedly runs to 31 Dec 2026; confirm on xlri.ac.in.", source: "official",
  },
  {
    id: "xim", name: "XIM University, Bhubaneswar", programme: "MBA (BM, HRM, RM, SM and more) 2027", type: "bschool", exams: ["XAT", "CAT", "GMAT", "XGMT", "NMAT"],
    opens: null, deadline: "2026-12-15", fee: "₹1,900 first programme, ₹850 second", link: "https://apply.xim.edu.in/",
    note: "Separate XIM form (not through XAT). XGMT 2027 on 17 Jan 2027.", source: "official",
  },
  {
    id: "imt", name: "IMT Ghaziabad (+ Nagpur, Hyderabad)", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT", "CMAT (Nagpur)"],
    opens: null, deadline: "2026-11-27", fee: "₹3,500", link: "https://www.imt.edu/admissions/pgdm/",
    note: "GMAT scores by 15 Jan 2027. CT-PI from 8 Jan 2027.", source: "official",
  },
  {
    id: "mica", name: "MICA Ahmedabad (MICAT)", programme: "PGDM-C / PGDM 2027-29", type: "bschool", exams: ["MICAT", "CAT / XAT / GMAT"],
    opens: null, deadline: "2027-01-30",
    rounds: [{ label: "MICAT-I registration closes", date: "2026-11-21" }, { label: "MICAT-I exam", date: "2026-12-05" }, { label: "MICAT-II registration closes", date: "2027-01-30" }, { label: "MICAT-II exam", date: "2027-02-12" }],
    fee: "₹2,500 + ₹500 per extra programme", link: "https://www.mica.ac.in/admissions/",
    note: "MICAT is compulsory, plus a CAT, XAT or GMAT score. Better of MICAT-I and II counts.", source: "official",
  },
  {
    id: "nmims", name: "NMIMS (SBM) Mumbai & campuses", programme: "MBA 2027-29", type: "bschool", exams: ["NMAT"],
    opens: "2026-08-20", deadline: "2026-10-25", fee: "₹3,000 (NMIMS form) + NMAT fee", link: "https://nmat.nmims.edu/",
    note: "Extended from 10 Oct to 25 Oct 2026. Also fill it before your NMAT test date.", source: "official",
  },
  {
    id: "bitsom", name: "BITSoM Mumbai", programme: "MBA 2027-29", type: "bschool", exams: ["CAT", "GMAT", "GRE"],
    opens: "2026-08-19", deadline: "2027-01-24",
    rounds: [{ label: "Round 1 closes", date: "2026-11-15" }, { label: "Round 2 closes", date: "2027-01-24" }],
    fee: "₹3,000", link: "https://admissions.bitsom.edu.in/", note: "Round 1 CAT score submission by 12 Jan 2027.", source: "official",
  },
  {
    id: "imi", name: "IMI New Delhi", programme: "PGDM, HRM, B&FS 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: null, deadline: "2026-12-19", fee: "See official site", link: "https://admission.imi.edu/delhi/",
    note: "Interviews in Jan 2027.", source: "official",
  },
  {
    id: "fore", name: "FORE School of Management, Delhi", programme: "PGDM (5 programmes) 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: null, deadline: "2026-12-15", fee: "₹1,770 one programme (+₹590 each extra)", link: "https://admissions.fsm.ac.in/",
    note: "Shortlists in the 2nd week of Jan 2027.", source: "official",
  },
  {
    id: "lbsim", name: "LBSIM Delhi", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: null, deadline: null, dateText: "December 2026 (exact date not announced)",
    rounds: [{ label: "Lower fee (₹1,500) ends", date: "2026-11-15" }],
    fee: "₹1,500 till 15 Nov, then ₹2,200", link: "https://forms.lbsim.ac.in/pgdm-application-form-2027",
    note: "Apply by 15 Nov to pay the lower fee.", source: "official",
  },
  {
    id: "irma", name: "IRMA Anand (Tribhuvan Sahkari University)", programme: "MBA (Rural Management) 2027-29", type: "bschool", exams: ["CAT", "XAT"],
    opens: null, deadline: "2026-12-24", fee: "₹2,200 (₹1,100 SC/ST/PwD; nil for BPL)", link: "https://tsu.ac.in/admission/mba/admissions-notice",
    note: "Admissions now run through Tribhuvan Sahkari University. Written test and PI 22-28 Feb 2027.", source: "official",
  },
  {
    id: "tapmi", name: "TAPMI Manipal / Bengaluru", programme: "MBA 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT", "NMAT"],
    opens: "2026-10-15", deadline: "2026-12-31", fee: "₹2,500 for up to 2 programmes", link: "https://apply.manipal.edu/tapmi",
    note: "NMAT is not accepted for the flagship MBA.", source: "official",
  },
  {
    id: "gim", name: "GIM Goa", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: null, deadline: "2027-01-04",
    rounds: [{ label: "First Mover (lowest fee)", date: "2026-10-22" }, { label: "Early Bird", date: "2026-11-19" }, { label: "Achiever's Round", date: "2026-12-03" }, { label: "CAT applicants", date: "2026-12-23" }, { label: "Last date", date: "2027-01-04" }],
    fee: "₹2,000 to ₹2,750 + GST (cheaper if you apply early)", link: "https://admissions.gim.ac.in/admission-application-form-2027-2029",
    note: "The fee goes up after each round.", source: "official",
  },
  {
    id: "kjsim", name: "K J Somaiya Institute of Management, Mumbai", programme: "MBA 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT", "NMAT", "CMAT"],
    opens: null, deadline: "2027-01-20", fee: "See official site", link: "https://kjsim.somaiya.edu/en/admission/mba",
    note: "Closes 11:59 PM, 20 Jan 2027.", source: "official",
  },
  {
    id: "nirma", name: "Institute of Management, Nirma University", programme: "MBA 2027-29", type: "bschool", exams: ["CAT"],
    opens: "2026-09-14", deadline: null, dateText: "3rd week of December 2026", fee: "₹1,600", link: "https://admissions.nirmauni.ac.in/mba.html",
    note: "Exact last date not announced yet.", source: "official",
  },
  {
    id: "greatlakes", name: "Great Lakes Chennai & Gurgaon", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    mode: "rolling", fee: "₹2,200", link: "https://application.greatlakes.edu.in/pgdm",
    note: "Form is open; the 4 cycle deadlines are shown as 'TBD' on the official site.", lastCycle: "Last year's first deadline was 4 Dec 2025.", source: "official",
  },
  {
    id: "isb", name: "ISB Hyderabad / Mohali", programme: "PGP (one-year), Class of 2028", type: "bschool", exams: ["GMAT", "GRE"],
    opens: null, deadline: "2027-01-17",
    rounds: [{ label: "Round 2", date: "2026-12-06" }, { label: "Round 3 (final)", date: "2027-01-17" }],
    fee: "See official site", link: "https://www.isb.edu/programmes/post-graduate-programmes/pgp-in-management/application-deadlines",
    note: "Needs work experience; Round 1 (20 Sep) has passed.", source: "official",
  },
  {
    id: "bimtech", name: "BIMTECH Greater Noida", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT", "CMAT"],
    mode: "rolling", fee: "₹2,250", link: "https://online.admissions.bimtech.ac.in/", note: "Open; no fixed last date published.", source: "official",
  },
  {
    id: "jaipuria", name: "Jaipuria Institute of Management", programme: "PGDM 2027-29 (all campuses)", type: "bschool", exams: ["CAT", "XAT", "CMAT", "MAT", "GMAT"],
    mode: "rolling", fee: "₹1,000", link: "https://www.jaipuria.ac.in/admissions/", note: "Open; no fixed last date published.", source: "official",
  },
  {
    id: "xiss", name: "XISS Ranchi", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "CMAT"],
    mode: "rolling", opens: "2026-10-15", fee: "₹2,000 + GST", link: "https://xiss.ac.in/admission/",
    note: "Closes once enough applications are received.", source: "official",
  },
  {
    id: "fms", name: "FMS Delhi", programme: "MBA 2027-29", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,000 (₹350 reserved)", link: "https://www.fms.edu/programmes/mba-full-time",
    note: "Needs a separate FMS form; the 2027-29 notice is not out yet.", lastCycle: "Usually opens around Nov-Dec, before or just after CAT.", source: "awaited",
  },
  {
    id: "dfbe", name: "DFBE (formerly DFS), University of Delhi", programme: "MBA (Finance) & MBA (Business Economics)", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,200 one programme / ₹2,000 both", link: "https://mfc.edu/",
    note: "2027 notice not out yet.", lastCycle: "Last year: 5 Nov 2025 to 11 Jan 2026.", source: "awaited",
  },
  {
    id: "dse", name: "Dept. of Commerce, Delhi School of Economics", programme: "MBA (IB), MBA (HRD), MBA (BA)", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "To be announced", link: "https://commerce.du.ac.in/admission",
    note: "Usually opens after the CAT result.", source: "awaited",
  },
  {
    id: "tiss", name: "TISS Mumbai", programme: "MA HRM & LR, ODCL, MHA, M.Sc Analytics", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "To be announced", link: "https://admissions.tiss.ac.in/",
    note: "TISS has confirmed it will use CAT 2026; application dates not out yet.", source: "awaited",
  },
  {
    id: "welingkar", name: "Welingkar (WeSchool) Mumbai", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT", "CMAT", "ATMA"], mode: "opening-soon",
    fee: "To be announced", link: "https://www.welingkar.org/pgdm", note: "2027-29 dates not out yet.", lastCycle: "Last year it opened on 18 Oct 2025.", source: "awaited",
  },
  {
    id: "ubs", name: "UBS Chandigarh (Panjab University)", programme: "MBA 2027-29", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "To be announced", link: "https://ubs.puchd.ac.in/show-noticeboard.php?nbid=4", note: "2027 notice not out yet.", source: "awaited",
  },

  // ── More IITs and B-schools (added 19 Oct 2026, checked on official sites) ──
  {
    id: "iit-ism", name: "IIT (ISM) Dhanbad", programme: "MBA / MBA (Business Analytics) 2027", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,600 (₹800 reserved)", link: "https://www.iitism.ac.in/home-mba",
    note: "2027 notice not out yet.", lastCycle: "Last year: 24 Dec 2025 to 31 Jan 2026.", source: "awaited",
  },
  {
    id: "iit-jodhpur", name: "IIT Jodhpur (SME)", programme: "MBA / MBA-Technology 2027", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,200 (₹600 reserved)", link: "https://iitj.ac.in/schools/en/how-to-apply",
    note: "2027 notice not out yet.", lastCycle: "Last year: 13 Jan to 12 Feb 2026.", source: "awaited",
  },
  {
    id: "iit-guwahati", name: "IIT Guwahati (School of Business)", programme: "MBA 2027", type: "iit", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹1,600 (₹800 reserved / female)", link: "https://iitg.ac.in/acad/admission/pg_admission/mba.php",
    note: "2027 notice not out yet.", lastCycle: "Last year: 6 Jan to 16 Feb 2026.", source: "awaited",
  },
  {
    id: "iit-mandi", name: "IIT Mandi (School of Management)", programme: "MBA (Data Science & AI) 2027", type: "iit", exams: ["CAT", "GMAT (foreign)"], mode: "opening-soon",
    fee: "Last cycle: ₹2,400 (₹1,200 reserved / female)", link: "https://som.iitmandi.ac.in/admissions/mba",
    note: "2027 notice not out yet.", lastCycle: "Last year: 24 Dec 2025 to 30 Jan 2026.", source: "awaited",
  },
  {
    id: "srcc-gbo", name: "SRCC GBO, University of Delhi", programme: "PG Diploma in Global Business Operations 2027", type: "bschool", exams: ["SRCC GBO test"], mode: "opening-soon",
    fee: "Last cycle: ₹2,500 (₹1,500 reserved)", link: "https://www.srccgbo.edu.in/How-to-apply.php",
    note: "Own entrance test plus GD/PI. 2027 notice not out yet.", lastCycle: "Last year: 15 Dec 2025 to 23 Jan 2026; test on 28 Feb 2026.", source: "awaited",
  },
  {
    id: "fms-bhu", name: "FMS / IMS, BHU Varanasi", programme: "MBA / MBA-IB 2027", type: "bschool", exams: ["CAT"], mode: "opening-soon",
    fee: "Last cycle: ₹2,000 (₹1,000 SC/ST)", link: "https://bhumbaadm.samarth.edu.in/",
    note: "2027 bulletin not out yet.", lastCycle: "Last year the form opened on 30 Nov 2025.", source: "awaited",
  },
  {
    id: "mdi-murshidabad", name: "MDI Murshidabad", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: null, deadline: "2027-06-25",
    rounds: [{ label: "Common MDI form (Gurgaon + Murshidabad) closes", date: "2026-11-28" }, { label: "Murshidabad-only form closes", date: "2027-06-25" }],
    fee: "₹1,180 incl. GST", link: "https://admissions.mdim.ac.in/",
    note: "Apply through the common MDI form by 28 Nov, or later through the Murshidabad-only form.", source: "official",
  },
  {
    id: "imi-kolkata", name: "IMI Kolkata", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT", "CMAT", "GMAT"],
    opens: null, deadline: "2026-12-19", fee: "See official site (no extra fee if you applied to IMI Delhi)", link: "https://admission.imi.edu/kolkata/",
    note: "Interviews in Jan 2027.", source: "official",
  },
  {
    id: "xime", name: "XIME Bengaluru / Chennai / Kochi", programme: "PGDM / PGDM-BA 2027-29", type: "bschool", exams: ["XAT", "CAT", "CMAT", "MAT", "GMAT"],
    mode: "rolling", fee: "₹2,000 (+₹500 for a second campus)", link: "https://admissions.xime.org/",
    note: "Open; GD/PI in phases. No last date published.", source: "official",
  },
  {
    id: "bim-trichy", name: "BIM Trichy", programme: "MBA 2027-29", type: "bschool", exams: ["CAT", "XAT", "GMAT"],
    opens: "2026-09-07", deadline: "2027-01-31", fee: "See official site", link: "https://admission.bim.edu/",
    note: "GD/PI in February 2027.", source: "official",
  },
  {
    id: "liba", name: "LIBA Chennai", programme: "PGDM 2027-29", type: "bschool", exams: ["CAT", "XAT"],
    mode: "rolling", fee: "Last cycle: ₹2,000", link: "https://admissions.liba.edu/",
    note: "Registration open; no last date published. Needs 60% in 10th, 12th and graduation.", source: "official",
  },
  {
    id: "ifmr-krea", name: "IFMR GSB, Krea University", programme: "MBA 2027-29", type: "bschool", exams: ["CAT", "XAT", "CMAT", "NMAT", "GMAT", "GRE"],
    opens: "2026-08-28", deadline: "2027-04-30",
    rounds: [{ label: "Early round", date: "2026-11-30" }, { label: "Round 1", date: "2027-01-30" }, { label: "Round 2", date: "2027-02-28" }, { label: "Round 3", date: "2027-04-30" }],
    fee: "₹1,500", link: "https://ifmrgsbadmissions.krea.edu.in/ifmr-mba-programme-applynow",
    note: "Dates marked tentative by the institute.", source: "official",
  },
  {
    id: "nia-pune", name: "National Insurance Academy (NIA) Pune", programme: "PGDM (Insurance & Risk / Technology) 2027-29", type: "bschool", exams: ["CAT", "XAT", "CMAT"],
    opens: null, deadline: "2027-03-15", fee: "See official site", link: "https://pgdm.niapune.org.in/admissions",
    note: "Upper age limit 28 (30 for SC/ST/PwD) on 1 July 2027.", source: "official",
  },

  // ── Symbiosis (SNAP + institute registration) ──────────────────
  ...[
    ["sibm-pune", "SIBM Pune", "MBA 2027-29", "2026-12-12", "https://sibm.edu/mba_importantdates"],
    ["scmhrd", "SCMHRD Pune", "MBA, MBA (IDM), MBA (BA) 2027-29", "2026-12-12", "https://scmhrd.edu/programmes/mba/?tab=admission_process"],
    ["sibm-blr", "SIBM Bengaluru", "MBA, MBA (BA) 2027-29", "2026-12-12", "https://www.sibmbengaluru.edu.in/mba/"],
    ["siib", "SIIB Pune", "MBA (IB), MBA (Agri Business) 2027-29", "2026-12-18", "https://siib.ac.in/admissions/admission-calendar/"],
    ["scit", "SCIT Pune", "MBA (ITBM, DS&DA, AI in Business) 2027-29", "2026-12-25", "https://www.scit.edu/mba-in-it-business-management"],
    ["siom", "SIOM Nashik", "MBA (Operations & Supply Chain) 2027-29", "2027-01-17", "https://www.siom.in/mba-operations-management"],
    ["sibm-nagpur", "SIBM Nagpur", "MBA 2027-29", "2027-01-20", "https://www.sibmnagpur.edu.in/mba-3-2/"],
  ].map(([id, name, programme, deadline, link]) => ({
    id, name, programme, type: "symbiosis", exams: ["SNAP"], opens: "2026-08-21", deadline,
    rounds: [{ label: "SNAP 2026 registration closes", date: "2026-11-25" }, { label: `${name} programme registration closes`, date: deadline }],
    fee: "₹1,000 per programme (+ SNAP fee)", link,
    note: "Register for SNAP by 25 Nov, then choose this institute on the SNAP portal by its own last date.", source: "official",
  })),
];

export const TYPES = [
  { key: "all", label: "All" },
  { key: "exam", label: "Entrance exams" },
  { key: "iim", label: "IIMs" },
  { key: "iit", label: "IITs" },
  { key: "bschool", label: "Top B-schools" },
  { key: "symbiosis", label: "Symbiosis (SNAP)" },
];

const DAY = 86400000;
// Deadline counts as open until 23:59:59 IST on that date
const endOfDayIST = (iso) => new Date(`${iso}T23:59:59+05:30`).getTime();
const startOfDayIST = (iso) => new Date(`${iso}T00:00:00+05:30`).getTime();

export function computeStatus(f, now) {
  const mode = f.mode || "dated";
  const next = (f.rounds || []).filter((r) => r.date && endOfDayIST(r.date) >= now && !/exam|test \d|window ends/i.test(r.label))
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  if (mode === "via-cat") return { key: "viacat", label: "Via CAT form", next: null };
  if (mode === "year-round") return { key: "open", label: "Open all year", next: null };
  if (mode === "opening-soon") return { key: "soon", label: "Opening soon", next: null };
  if (mode === "rolling") return { key: "open", label: "Open", rolling: true, next: null };
  if (mode === "closed") return { key: "closed", label: "Closed", next: null };
  if (f.opens && startOfDayIST(f.opens) > now) return { key: "soon", label: "Opening soon", next };
  if (!f.deadline) return { key: "open", label: "Open", next };
  const end = endOfDayIST(f.deadline);
  if (now > end) return { key: "closed", label: "Closed", next: null };
  const days = Math.max(0, Math.ceil((end - now) / DAY) - 1);
  const closing = days <= 14;
  return { key: closing ? "closing" : "open", label: closing ? "Closing soon" : "Open", days, next };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Same output on server and browser (no locale differences)
export function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
