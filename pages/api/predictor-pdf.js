// pages/api/predictor-pdf.js — Generates a Gen-Z styled PDF for call predictor results
// Uses HTML → PDF approach via the browser (returns HTML that auto-triggers print)
// For a serverless-compatible solution, we generate a styled HTML document

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, category, sa, qa, va, total, colleges } = req.body;
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const collegeRows = (colleges || []).map((c, i) => {
    const statusColor = c.status === 'OPEN' ? '#22c55e' : c.status === 'CLOSED' ? '#ef4444' : '#f59e0b';
    const statusBg = c.status === 'OPEN' ? 'rgba(34,197,94,0.12)' : c.status === 'CLOSED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)';
    return `
      <tr>
        <td style="padding:10px 14px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;">${i + 1}</td>
        <td style="padding:10px 14px;font-weight:700;color:#1e293b;border-bottom:1px solid #f1f5f9;">${c.name}</td>
        <td style="padding:10px 14px;color:#64748b;font-size:0.85em;border-bottom:1px solid #f1f5f9;">${c.exam}</td>
        <td style="padding:10px 14px;color:#64748b;font-size:0.85em;border-bottom:1px solid #f1f5f9;">${c.lastDate}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;">
          <span style="padding:3px 10px;border-radius:20px;font-size:0.75em;font-weight:700;color:${statusColor};background:${statusBg};">${c.status}</span>
        </td>
      </tr>`;
  }).join('');

  const saNum = parseFloat(sa) || 0;
  const qaNum = parseFloat(qa) || 0;
  const vaNum = parseFloat(va) || 0;
  const totalNum = parseFloat(total) || 0;
  const pct = ((totalNum / 360) * 100).toFixed(1);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>IPMAT Call Prediction — ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1e293b; }
    @page { size: A4; margin: 0; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 0; position: relative; overflow: hidden; }

    /* Hero gradient header */
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
      padding: 40px 44px 32px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(249,160,27,0.3) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -30px; left: 40%;
      width: 150px; height: 150px;
      background: radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; position: relative; z-index: 1; }
    .brand-text { font-size: 1.1rem; font-weight: 800; color: #f9a01b; letter-spacing: -0.5px; }
    .brand-sub { font-size: 0.65rem; color: rgba(255,255,255,0.5); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
    .hero-title { font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1.1; position: relative; z-index: 1; letter-spacing: -1px; }
    .hero-title span { color: #f9a01b; }
    .hero-sub { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 6px; position: relative; z-index: 1; }

    /* Score cards */
    .scores { display: flex; gap: 12px; padding: 20px 44px; background: #f8fafc; }
    .score-card {
      flex: 1; padding: 16px; border-radius: 16px; text-align: center;
      background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .score-card.total {
      background: linear-gradient(135deg, #6c63ff, #8b5cf6);
      color: #fff;
    }
    .score-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
    .score-card.total .score-label { color: rgba(255,255,255,0.7); }
    .score-value { font-size: 1.6rem; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
    .score-card.total .score-value { color: #fff; }
    .score-max { font-size: 0.75rem; font-weight: 500; color: #94a3b8; }
    .score-card.total .score-max { color: rgba(255,255,255,0.6); }

    /* Student info bar */
    .info-bar { display: flex; justify-content: space-between; padding: 14px 44px; background: #fff; border-bottom: 1px solid #f1f5f9; }
    .info-item { font-size: 0.78rem; color: #64748b; }
    .info-item strong { color: #1e293b; font-weight: 700; }

    /* Main content */
    .content { padding: 24px 44px 20px; }
    .section-title {
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 2px; color: #6c63ff; margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent); }

    /* College table */
    table { width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
    thead th {
      padding: 12px 14px; text-align: left;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: #64748b;
      background: #f8fafc; border-bottom: 2px solid #e2e8f0;
    }

    /* Footer */
    .footer {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 16px 44px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { font-size: 0.7rem; color: #94a3b8; }
    .footer-right { font-size: 0.7rem; color: #6c63ff; font-weight: 700; }

    /* Badge */
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 30px;
      font-size: 0.8rem; font-weight: 700;
      background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05));
      color: #16a34a; margin-bottom: 20px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page { width: 100%; min-height: auto; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div>
          <div class="brand-text">IPM CAREERS</div>
          <div class="brand-sub">Your path to IIM</div>
        </div>
      </div>
      <div class="hero-title">IPMAT Call <span>Prediction</span> Report</div>
      <div class="hero-sub">AI-powered analysis based on historical cutoff data</div>
    </div>

    <div class="info-bar">
      <div class="info-item"><strong>${name}</strong></div>
      <div class="info-item">Category: <strong>${category}</strong></div>
      <div class="info-item">Score: <strong>${totalNum}/360 (${pct}%)</strong></div>
      <div class="info-item">${date}</div>
    </div>

    <div class="scores">
      <div class="score-card">
        <div class="score-label">QA — Short Answer</div>
        <div class="score-value">${saNum}</div>
        <div class="score-max">out of 60</div>
      </div>
      <div class="score-card">
        <div class="score-label">QA — MCQ</div>
        <div class="score-value">${qaNum}</div>
        <div class="score-max">out of 120</div>
      </div>
      <div class="score-card">
        <div class="score-label">Verbal Ability</div>
        <div class="score-value">${vaNum}</div>
        <div class="score-max">out of 180</div>
      </div>
      <div class="score-card total">
        <div class="score-label">Total Score</div>
        <div class="score-value">${totalNum}</div>
        <div class="score-max">out of 360</div>
      </div>
    </div>

    <div class="content">
      <div class="badge">🎯 ${colleges.length} Predicted Call${colleges.length > 1 ? 's' : ''}</div>
      <div class="section-title">Colleges You May Get a Call From</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>College</th>
            <th>Exam</th>
            <th>Last Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${collegeRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div class="footer-left">Generated by IPM Careers • register.ipmcareer.com/call • ${date}</div>
      <div class="footer-right">ipmcareer.com</div>
    </div>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="IPMAT_Call_Prediction_${name.replace(/\s+/g, '_')}.pdf"`);
  return res.status(200).send(html);
}
