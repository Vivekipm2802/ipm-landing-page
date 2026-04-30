export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { category, sa, va, qa } = req.body;

  if (!category || sa === undefined || va === undefined || qa === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const saNum = parseFloat(sa);
  const vaNum = parseFloat(va);
  const qaNum = parseFloat(qa);
  const total = saNum + vaNum + qaNum;

  const cutoffs = {
    "IIM Indore": {
      gen: { qa: 24, va: 35, total: 130 },
      ews: { qa: 16, va: 23, total: 90 },
      obc: { qa: 12, va: 22, total: 70 },
      sc: { qa: 4, va: 12, total: 60 },
      st: { qa: 4, va: 7, total: 30 },
      pwd: { qa: 8, va: 17, total: 65 },
    },
    "IIM Rohtak": {
      gen: { total: 115 },
      ews: { total: 85 },
      obc: { total: 70 },
      sc: { total: 55 },
      st: { total: 40 },
      pwd: { total: 55 },
    },
    "IIM Ranchi": {
      gen: { total: 110 },
      ews: { total: 80 },
      obc: { total: 65 },
      sc: { total: 50 },
      st: { total: 35 },
      pwd: { total: 50 },
    },
    "IIM Jammu": {
      gen: { total: 100 },
      ews: { total: 75 },
      obc: { total: 60 },
      sc: { total: 45 },
      st: { total: 30 },
      pwd: { total: 45 },
    },
    "IIM Bodh Gaya": {
      gen: { total: 95 },
      ews: { total: 70 },
      obc: { total: 55 },
      sc: { total: 40 },
      st: { total: 28 },
      pwd: { total: 42 },
    },
    "IIM Sirmaur": {
      gen: { total: 90 },
      ews: { total: 65 },
      obc: { total: 50 },
      sc: { total: 38 },
      st: { total: 25 },
      pwd: { total: 40 },
    },
    "IIM Sambalpur": {
      gen: { total: 88 },
      ews: { total: 63 },
      obc: { total: 48 },
      sc: { total: 36 },
      st: { total: 23 },
      pwd: { total: 38 },
    },
    NALSAR: {
      gen: { total: 110 },
      ews: { total: 80 },
      obc: { total: 60 },
      sc: { total: 50 },
      st: { total: 25 },
      pwd: { total: 55 },
    },
    IIFT: {
      gen: { total: 100 },
      ews: { total: 75 },
      obc: { total: 55 },
      sc: { total: 45 },
      st: { total: 22 },
      pwd: { total: 50 },
    },
    NIRMA: {
      gen: { total: 90 },
      ews: { total: 70 },
      obc: { total: 50 },
      sc: { total: 40 },
      st: { total: 20 },
      pwd: { total: 45 },
    },
    TAPMI: {
      gen: { total: 85 },
      ews: { total: 65 },
      obc: { total: 45 },
      sc: { total: 35 },
      st: { total: 18 },
      pwd: { total: 40 },
    },
    "Christ University": {
      gen: { total: 80 },
      ews: { total: 60 },
      obc: { total: 42 },
      sc: { total: 32 },
      st: { total: 16 },
      pwd: { total: 35 },
    },
  };

  const cat = category.toLowerCase();
  const colleges = [];

  for (const [collegeName, cutoff] of Object.entries(cutoffs)) {
    const c = cutoff[cat] || cutoff["gen"];
    let qualifies = true;

    if (c.qa !== undefined && qaNum < c.qa) qualifies = false;
    if (c.va !== undefined && vaNum < c.va) qualifies = false;
    if (c.total !== undefined && total < c.total) qualifies = false;

    if (qualifies) {
      colleges.push(collegeName);
    }
  }

  return res.status(200).json({ colleges });
}