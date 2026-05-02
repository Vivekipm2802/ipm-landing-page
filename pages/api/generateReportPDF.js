import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import {
  Document, Page, Text, View, StyleSheet, Image, Font, Link,
} from '@react-pdf/renderer';
import { supabase } from '../../utils/supabaseClient';

/* ─── Brand Colours ─── */
const C = {
  primary:    '#1a1a2e',
  accent:     '#6c63ff',
  accentDark: '#4a44cc',
  green:      '#22c55e',
  red:        '#ef4444',
  orange:     '#f59e0b',
  gray:       '#6b7280',
  lightGray:  '#f3f4f6',
  white:      '#ffffff',
  text:       '#1f2937',
  textLight:  '#6b7280',
  blue:       '#3b82f6',
  blueLight:  '#dbeafe',
  greenLight: '#dcfce7',
  redLight:   '#fee2e2',
  yellowLight:'#fef9c3',
};

/* ─── Fonts ─── */
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

/* ─── Styles ─── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: C.text,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 35,
    backgroundColor: C.white,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.accent,
  },
  headerLeft: { flexDirection: 'column' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: C.primary },
  headerSubtitle: { fontSize: 9, color: C.accent, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 7, color: C.textLight, marginBottom: 1 },
  headerValue: { fontSize: 9, fontWeight: 600, color: C.text },

  // Score Banner
  scoreBanner: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  scoreCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreCircleValue: { fontSize: 24, fontWeight: 700, color: C.white },
  scoreCircleMax: { fontSize: 9, color: '#a0a0cc' },
  scoreInfoArea: { flex: 1 },
  scoreBannerTitle: { fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 4 },
  scoreBannerDesc: { fontSize: 8, color: '#a0a0cc', lineHeight: 1.4 },

  // Section title
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: C.primary,
    marginBottom: 8,
    marginTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  statLabel: { fontSize: 7, color: C.textLight, textAlign: 'center' },
  statSubtext: { fontSize: 6, color: C.textLight, marginTop: 1 },

  // Score cards row
  scoreCardsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  scoreCardItem: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreCardTitle: { fontSize: 8, fontWeight: 600, marginBottom: 4 },
  scoreCardSubtitle: { fontSize: 6, color: C.textLight, marginBottom: 6 },
  scoreCardValue: { fontSize: 18, fontWeight: 700 },
  scoreCardMax: { fontSize: 9, color: C.textLight },
  scoreCardStats: { flexDirection: 'row', marginTop: 6, gap: 8 },

  // Breakdown table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: { color: C.white, fontSize: 7, fontWeight: 600, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  tableCell: { fontSize: 8, textAlign: 'center', color: C.text },
  tableCellLabel: { fontSize: 8, textAlign: 'left', color: C.text, fontWeight: 600 },

  // Question analysis
  qTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  qTableHeaderCell: { fontSize: 7, fontWeight: 600, color: C.text, textAlign: 'center' },
  qRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  qCell: { fontSize: 7, textAlign: 'center', color: C.text },
  qBadge: { fontSize: 7, fontWeight: 600, textAlign: 'center', borderRadius: 3, paddingVertical: 1, paddingHorizontal: 3 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerLeft: { fontSize: 7, color: C.textLight },
  footerRight: { fontSize: 7, color: C.accent, fontWeight: 600 },

  // CTA section
  ctaSection: {
    backgroundColor: C.accent,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 4 },
  ctaDesc: { fontSize: 8, color: '#ddd', marginBottom: 6, textAlign: 'center' },
  ctaButton: {
    backgroundColor: C.white,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  ctaBtnText: { fontSize: 9, fontWeight: 700, color: C.accent },

  subsectionTitle: { fontSize: 10, fontWeight: 600, color: C.accent, marginTop: 10, marginBottom: 6 },
});

/* ─── Helpers ─── */
function calculateScores(d, subtractScore, addScore) {
  if (!d || !Array.isArray(d)) return 0;
  return d.reduce((sum, i) => {
    if (i.status === 'Answered' || i.status === 'Marked For Review') {
      if (i.rightAnswer == i.givenAnswer) return sum + addScore;
      else if (i.rightAnswer != i.givenAnswer && subtractScore > 0)
        return sum - subtractScore;
    }
    return sum;
  }, 0);
}

function countQuestions(d, type) {
  if (!d || !Array.isArray(d)) return { correct: 0, incorrect: 0, unattempted: 0, attempted: 0, total: 0 };
  let correct = 0, incorrect = 0, unattempted = 0, attempted = 0;
  d.forEach(i => {
    if (i.status === 'Not Answered') { unattempted++; }
    else {
      attempted++;
      if (i.rightAnswer == i.givenAnswer) correct++;
      else incorrect++;
    }
  });
  return { correct, incorrect, unattempted, attempted, total: d.length };
}

/* ─── Badge colours ─── */
function getBadgeStyle(question) {
  const isCorrect = question.rightAnswer == question.givenAnswer;
  const isUnanswered = question.status === 'Not Answered';
  if (isUnanswered) return { backgroundColor: C.yellowLight, color: C.orange };
  if (isCorrect)    return { backgroundColor: C.greenLight,  color: '#16a34a' };
  return                    { backgroundColor: C.redLight,    color: C.red };
}

function getStatusText(question) {
  const isCorrect = question.rightAnswer == question.givenAnswer;
  if (question.status === 'Not Answered') return 'Unattempted';
  if (question.status === 'Marked For Review') return 'Review';
  return isCorrect ? 'Correct' : 'Incorrect';
}

function getEvalSymbol(question) {
  if (question.status === 'Not Answered') return '–';
  return question.rightAnswer == question.givenAnswer ? '✓' : '✗';
}

function getEvalColor(question) {
  if (question.status === 'Not Answered') return C.gray;
  return question.rightAnswer == question.givenAnswer ? C.green : C.red;
}

/* ─── Question Table Component ─── */
const QuestionTable = ({ data, title, startIdx }) => {
  // Chunk into pages of 35 questions
  const ROWS_PER_PAGE = 35;
  const chunks = [];
  for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
    chunks.push(data.slice(i, i + ROWS_PER_PAGE));
  }

  return chunks.map((chunk, ci) => (
    <View key={`${title}-${ci}`} wrap={false} style={{ marginBottom: 8 }}>
      {ci === 0 && <Text style={s.subsectionTitle}>{title}</Text>}
      {ci > 0 && <Text style={{ fontSize: 7, color: C.textLight, marginBottom: 4 }}>{title} (contd.)</Text>}

      {/* Header */}
      <View style={s.qTableHeader}>
        <Text style={[s.qTableHeaderCell, { width: '10%' }]}>Q No</Text>
        <Text style={[s.qTableHeaderCell, { width: '20%' }]}>Your Answer</Text>
        <Text style={[s.qTableHeaderCell, { width: '20%' }]}>Correct Answer</Text>
        <Text style={[s.qTableHeaderCell, { width: '25%' }]}>Status</Text>
        <Text style={[s.qTableHeaderCell, { width: '25%' }]}>Evaluation</Text>
      </View>

      {/* Rows */}
      {chunk.map((q, idx) => {
        const globalIdx = startIdx + ci * ROWS_PER_PAGE + idx;
        const badge = getBadgeStyle(q);
        return (
          <View key={idx} style={[s.qRow, idx % 2 === 1 && { backgroundColor: '#fafafa' }]}>
            <Text style={[s.qCell, { width: '10%', fontWeight: 600 }]}>{globalIdx}</Text>
            <Text style={[s.qCell, { width: '20%' }]}>{q.givenAnswer || '–'}</Text>
            <Text style={[s.qCell, { width: '20%' }]}>{q.rightAnswer}</Text>
            <Text style={[s.qBadge, { width: '25%' }, badge]}>{getStatusText(q)}</Text>
            <Text style={[s.qCell, { width: '25%', fontWeight: 700, color: getEvalColor(q) }]}>{getEvalSymbol(q)}</Text>
          </View>
        );
      })}
    </View>
  ));
};

/* ─── Main PDF Document ─── */
const ReportPDF = ({ record, parsed, scores, stats }) => {
  const studentName = record.name || 'Student';
  const testDate = new Date(record.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const category = record.category || 'N/A';

  return (
    <Document title={`IPMAT Report - ${studentName}`} author="IPM Careers" subject="IPMAT Performance Report">

      {/* ── Page 1: Overview ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>IPM CAREERS</Text>
            <Text style={s.headerSubtitle}>IPMAT Detailed Performance Report</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Student</Text>
            <Text style={s.headerValue}>{studentName}</Text>
            <Text style={[s.headerLabel, { marginTop: 4 }]}>Date</Text>
            <Text style={s.headerValue}>{testDate}</Text>
            <Text style={[s.headerLabel, { marginTop: 4 }]}>Category</Text>
            <Text style={s.headerValue}>{category}</Text>
          </View>
        </View>

        {/* Score Banner */}
        <View style={s.scoreBanner}>
          <View style={s.scoreCircleOuter}>
            <Text style={s.scoreCircleValue}>{scores.total.score}</Text>
            <Text style={s.scoreCircleMax}>/ {scores.total.max}</Text>
          </View>
          <View style={s.scoreInfoArea}>
            <Text style={s.scoreBannerTitle}>Your Overall Score</Text>
            <Text style={s.scoreBannerDesc}>
              Calculated from your uploaded IPMAT response sheet using official answer key analysis.
              {'\n'}Scoring: SA (+4, 0) | MCQ (+4, -1) | VA (+4, -1)
            </Text>
          </View>
        </View>

        {/* Performance Overview */}
        <Text style={s.sectionTitle}>Performance Overview</Text>
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: C.blueLight }]}>
            <Text style={[s.statValue, { color: C.blue }]}>{stats.attempted}</Text>
            <Text style={s.statLabel}>Questions Attempted</Text>
            <Text style={s.statSubtext}>out of {stats.total}</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.greenLight }]}>
            <Text style={[s.statValue, { color: C.green }]}>{stats.accuracy}%</Text>
            <Text style={s.statLabel}>Accuracy Rate</Text>
            <Text style={s.statSubtext}>{stats.totalCorrect} correct</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[s.statValue, { color: C.green }]}>+{stats.positiveScore}</Text>
            <Text style={s.statLabel}>Positive Score</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.redLight }]}>
            <Text style={[s.statValue, { color: C.red }]}>-{stats.marksLost}</Text>
            <Text style={s.statLabel}>Marks Lost</Text>
          </View>
        </View>

        {/* Subject-wise Score Cards */}
        <Text style={s.sectionTitle}>Subject-Wise Performance</Text>
        <View style={s.scoreCardsRow}>
          {[
            { key: 'sa',  title: 'Short Answer (SA)', sub: 'Quantitative', accent: C.accent },
            { key: 'mcq', title: 'MCQ', sub: 'Quantitative', accent: C.blue },
            { key: 'va',  title: 'Verbal Ability', sub: 'Reading Comp.', accent: C.green },
          ].map(sec => (
            <View key={sec.key} style={[s.scoreCardItem, { borderLeftWidth: 3, borderLeftColor: sec.accent }]}>
              <Text style={[s.scoreCardTitle, { color: sec.accent }]}>{sec.title}</Text>
              <Text style={s.scoreCardSubtitle}>{sec.sub}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[s.scoreCardValue, { color: sec.accent }]}>{scores[sec.key].score}</Text>
                <Text style={s.scoreCardMax}> / {scores[sec.key].max}</Text>
              </View>
              <View style={s.scoreCardStats}>
                <Text style={{ fontSize: 7, color: C.green }}>{stats[sec.key].correct} correct</Text>
                <Text style={{ fontSize: 7, color: C.red }}>{stats[sec.key].incorrect} wrong</Text>
                <Text style={{ fontSize: 7, color: C.orange }}>{stats[sec.key].unattempted} skip</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Test Breakdown Table */}
        <Text style={s.sectionTitle}>Test Breakdown</Text>
        <View style={s.tableHeader}>
          {['Subject', 'Correct', 'Incorrect', 'Unattempted', 'Score', 'Max'].map((h, i) => (
            <Text key={i} style={[s.tableHeaderCell, { width: i === 0 ? '25%' : '15%' }]}>{h}</Text>
          ))}
        </View>
        {[
          { label: 'Short Answer (SA)', stats: stats.sa, score: scores.sa },
          { label: 'MCQ (Quant)',       stats: stats.mcq, score: scores.mcq },
          { label: 'Verbal Ability',    stats: stats.va,  score: scores.va },
          { label: 'TOTAL',             stats: { correct: stats.totalCorrect, incorrect: stats.totalIncorrect, unattempted: stats.totalUnattempted }, score: scores.total },
        ].map((row, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 && s.tableRowAlt, i === 3 && { backgroundColor: '#eef2ff', borderTopWidth: 1, borderTopColor: C.accent }]}>
            <Text style={[i === 3 ? { ...s.tableCellLabel, fontWeight: 700 } : s.tableCellLabel, { width: '25%' }]}>{row.label}</Text>
            <Text style={[s.tableCell, { width: '15%', color: C.green }]}>{row.stats.correct}</Text>
            <Text style={[s.tableCell, { width: '15%', color: C.red }]}>{row.stats.incorrect}</Text>
            <Text style={[s.tableCell, { width: '15%', color: C.orange }]}>{row.stats.unattempted}</Text>
            <Text style={[s.tableCell, { width: '15%', fontWeight: 700 }]}>{row.score.score}</Text>
            <Text style={[s.tableCell, { width: '15%' }]}>{row.score.max}</Text>
          </View>
        ))}

        {/* CTA */}
        <View style={s.ctaSection}>
          <Text style={s.ctaTitle}>Want Detailed Analysis & Guidance?</Text>
          <Text style={s.ctaDesc}>Join IPM Careers PI Batch for Interview Prep & Doubt Clearing Sessions</Text>
          <View style={s.ctaButton}>
            <Text style={s.ctaBtnText}>Call: 8299470392</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>Generated by IPM Careers Response Sheet Analyzer | ipmcareer.com</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ── Page 2+: Detailed Question-Wise Analysis ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Detailed Question-Wise Analysis</Text>

        {/* SA Questions */}
        {parsed.sa && parsed.sa.length > 0 && (
          <QuestionTable data={parsed.sa} title="Short Answer (Quantitative Ability)" startIdx={1} />
        )}

        {/* MCQ Questions */}
        {parsed.mcq && parsed.mcq.length > 0 && (
          <QuestionTable data={parsed.mcq} title="Multiple Choice (Quantitative Ability)" startIdx={parsed.sa.length + 1} />
        )}

        {/* VA Questions */}
        {parsed.va && parsed.va.length > 0 && (
          <QuestionTable data={parsed.va} title="Verbal Ability (Reading Comprehension)" startIdx={parsed.sa.length + parsed.mcq.length + 1} />
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>Generated by IPM Careers Response Sheet Analyzer | ipmcareer.com</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

/* ─── API Handler ─── */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: 'Missing uid parameter' });
  }

  try {
    // 1. Fetch data from Supabase
    const { data, error } = await supabase.rpc('get_response_data', { uuid_arg: uid });

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const record = data[0];
    const parsed = JSON.parse(record.data);
    const saData  = parsed.sa  || [];
    const mcqData = parsed.mcq || [];
    const vaData  = parsed.va  || [];

    // 2. Calculate scores
    const saScore  = calculateScores(saData, 0, 4);
    const mcqScore = calculateScores(mcqData, 1, 4);
    const vaScore  = calculateScores(vaData, 1, 4);
    const totalScore = saScore + mcqScore + vaScore;

    const scores = {
      sa:    { score: saScore,    max: saData.length * 4 },
      mcq:   { score: mcqScore,   max: mcqData.length * 4 },
      va:    { score: vaScore,    max: vaData.length * 4 },
      total: { score: totalScore, max: (saData.length + mcqData.length + vaData.length) * 4 },
    };

    // 3. Calculate stats
    const saStats  = countQuestions(saData, 'sa');
    const mcqStats = countQuestions(mcqData, 'mcq');
    const vaStats  = countQuestions(vaData, 'va');

    const totalAttempted  = saStats.attempted + mcqStats.attempted + vaStats.attempted;
    const totalQuestions  = saStats.total + mcqStats.total + vaStats.total;
    const totalCorrect    = saStats.correct + mcqStats.correct + vaStats.correct;
    const totalIncorrect  = saStats.incorrect + mcqStats.incorrect + vaStats.incorrect;
    const totalUnattempted = saStats.unattempted + mcqStats.unattempted + vaStats.unattempted;
    const accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : '0';
    const positiveScore = totalCorrect * 4;
    const marksLost = totalIncorrect; // -1 per wrong MCQ/VA

    const stats = {
      attempted: totalAttempted,
      total: totalQuestions,
      accuracy,
      positiveScore,
      marksLost,
      sa: saStats,
      mcq: mcqStats,
      va: vaStats,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
    };

    // 4. Render PDF to buffer
    const pdfStream = await ReactPDF.renderToStream(
      <ReportPDF record={record} parsed={{ sa: saData, mcq: mcqData, va: vaData }} scores={scores} stats={stats} />
    );

    // 5. Stream response
    const studentName = (record.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `IPMAT_Report_${studentName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    pdfStream.pipe(res);

  } catch (err) {
    console.error('[generateReportPDF] Error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate PDF report. Please try again.' });
  }
}
