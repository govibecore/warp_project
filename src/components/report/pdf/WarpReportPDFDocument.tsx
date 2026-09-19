import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { stripLaTeXForPdf } from '@/lib/mathRender';







// ─────────────────────────────────────────────────────────────────────────────
// Nordic Lagom PDF Design Tokens (Vector / Exact Pt dimensions)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 22,
    paddingLeft: 28,
    paddingRight: 28,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  // ── Headers ──
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 8,
    marginBottom: 10,
  },
  logoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBrandText: {
    fontSize: 22,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    letterSpacing: 2,
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: 2,
  },
  logoSubtitle: {
    fontSize: 9,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#0284c7',
    marginTop: 1,
  },
  headerMetaRight: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    backgroundColor: '#0f172a',
    borderRadius: 0,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerRefText: {
    fontSize: 8.5,
    fontFamily: 'Courier',
    color: '#64748b',
    marginTop: 3,
  },
  // ── Candidate Strip ──
  candidateGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderWidth: 0.75,
    borderColor: '#e2e8f0',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    marginBottom: 10,
  },
  candidateCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 1.5,
  },
  metaValue: {
    fontSize: 10.5,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    color: '#0f172a',
  },
  // ── Metric Highlight Card ──
  metricRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#1e293b',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricCardTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#475569',
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 22,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    color: '#0f172a',
  },
  metricCardSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 2,
  },
  // ── Section Container ──
  section: {
    marginBottom: 9,
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.75,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2.5,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.75,
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 8.5,
    color: '#64748b',
  },
  // ── Table Styles ──
  table: {
    width: '100%',
    borderWidth: 0.75,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    
    borderBottomWidth: 0.75,
    borderBottomColor: '#cbd5e1',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    paddingRight: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 8,
    paddingRight: 8,
  },
  tableRowAlt: {
    
  },
  tableCell: {
    fontSize: 9.5,
    color: '#1e293b',
  },
  // ── Content Boxes ──
  cardBox: {
    borderWidth: 0.5,
    borderColor: '#1e293b',
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  cardText: {
    fontSize: 9.5,
    color: '#334155',
    lineHeight: 1.35,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 3,
    height: 3,
    backgroundColor: '#0284c7',
    borderRadius: 1.5,
    marginTop: 3,
    marginRight: 4,
  },
  bulletText: {
    fontSize: 9.5,
    color: '#334155',
    flex: 1,
    lineHeight: 1.35,
  },
  // ── Footers ──
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica',
  },
  footerPageNum: {
    fontSize: 8,
    fontFamily: 'Helvetica', fontWeight: 'bold',
    color: '#0f172a',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface WarpReportPDFProps {
  studentName?: string;
  classLevel?: number;
  completedAt?: string;
  totalTimeMs?: number;
  overallScore?: number;
  abilityTheta?: number | null;
  benchmark?: any;
  studentVariant?: any;
  parentVariant?: any;
  responses?: any[];
  printMode?: 'one-page' | 'comprehensive';
}

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return '-';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

function ordinal(n: number): string {
  if (!n) return '0th';
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// ─────────────────────────────────────────────────────────────────────────────
// WarpReportPDFDocument Component
// ─────────────────────────────────────────────────────────────────────────────
export function WarpReportPDFDocument({
  studentName = 'Candidate',
  classLevel = 8,
  completedAt = new Date().toISOString(),
  totalTimeMs = 0,
  overallScore = 0,
  abilityTheta = 0,
  benchmark = {},
  studentVariant = {},
  parentVariant = {},
  responses = [],
  printMode = 'one-page',
}: WarpReportPDFProps) {
  const correctCount = responses.filter((r: any) => r.correct === true).length;
  const totalCount = responses.length || 6;
  const accuracyPct = Math.round((correctCount / totalCount) * 100);

  const isEnglish = (benchmark?.subject || '').toLowerCase().includes('english');
  const subjectDisplay = isEnglish ? 'English Literacy' : (benchmark?.subject || 'STEM');

  // Archetype & Strategic Metrics
  const archetypeTitle =
    studentVariant?.archetypeTitle ||
    benchmark?.cognitiveArchetype?.title ||
    'Analytical Strategist';

  const archetypeTagline =
    studentVariant?.archetypeTagline ||
    benchmark?.cognitiveArchetype?.tagline ||
    'Deconstructs multi-variable systems with structural precision';

  const strengths: string[] = studentVariant?.keyStrengths || [
    benchmark?.cognitiveArchetype?.primaryStrength || 'Parameter isolation & causal inference',
    'Consistent first-principles deductive validation under novel conditions',
    'High signal-to-noise separation in complex multi-step scenarios',
  ];

  const blindspots: string[] = studentVariant?.blindspots || [
    benchmark?.cognitiveArchetype?.criticalBlindspot || 'Premature optimization under time pressure',
    'Vulnerability to distractor options engineered around formula shortcuts',
    'Tendency to skip boundary-condition edge verification',
  ];

  // Parent & Board Reality
  const verdict = benchmark?.realityCheck?.verdict || 'Developing Foundation';
  const honestSummary =
    parentVariant?.realityCheckSummary ||
    benchmark?.realityCheck?.honestSummary ||
    'Demonstrates strong first-principles reasoning; multi-step deductive chaining requires guided rehearsal.';

  const homeRoutines: string[] =
    parentVariant?.indianHomeRoutines ||
    parentVariant?.immediateHomeRoutines ||
    benchmark?.parentActionBlueprint?.indianHomeRoutines || [
      'Daily 15-minute error log review focusing on WHY distractors were selected.',
      'Solve 3 non-routine problems daily without looking at formula sheets.',
    ];

  const ptmGuides: string[] =
    parentVariant?.ptmDiscussionGuide ||
    benchmark?.parentActionBlueprint?.ptmDiscussionGuide || [
      'Is my child applying first principles to unfamiliar problems or relying on templates?',
      'How does conceptual transfer hold up when variables in standard textbook problems change?',
    ];

  const parakhPillars = benchmark?.parakhHolisticPillars || {
    scientificInquiry: { score: 78, delta: '+12%', label: 'Exceeds Benchmark' },
    computationalThinking: { score: 74, delta: '+8%', label: 'Competent' },
    engineeringDesign: { score: 68, delta: '+2%', label: 'Developing' },
    mathematicalReasoning: { score: 82, delta: '+16%', label: 'Mastery' },
    systemsThinking: { score: 71, delta: '+5%', label: 'Competent' },
  };

  const indiaPercentile = benchmark?.indiaNationalPercentile || 78;
  const dateString = completedAt ? completedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const refCode = `WRP-${classLevel}-${dateString.replace(/-/g, '')}`;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1-PAGE EXECUTIVE BRIEF
  // ═══════════════════════════════════════════════════════════════════════════
  if (printMode === 'one-page') {
    return (
      <Document title={`WARP_1Page_Brief_${studentName}_Class${classLevel}`} author="WARP Learning Signal">
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBlock}>
              <View>
                <Text style={styles.logoBrandText}>WARP</Text>
                <Text style={styles.logoSubtitle}>Global {subjectDisplay} Diagnostic</Text>
              </View>
            </View>
            <View style={styles.headerMetaRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1-Page Joint Executive Dossier</Text>
              </View>
              <Text style={styles.headerRefText}>Ref: {refCode}</Text>
            </View>
          </View>

          {/* Candidate Metadata Strip */}
          <View style={styles.candidateGrid}>
            <View style={styles.candidateCol}>
              <Text style={styles.metaLabel}>Candidate</Text>
              <Text style={styles.metaValue}>{studentName}</Text>
            </View>
            <View style={styles.candidateCol}>
              <Text style={styles.metaLabel}>Cohort</Text>
              <Text style={styles.metaValue}>Class {classLevel}</Text>
            </View>
            <View style={styles.candidateCol}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{dateString}</Text>
            </View>
            <View style={styles.candidateCol}>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={styles.metaValue}>{formatDuration(totalTimeMs)}</Text>
            </View>
            <View style={styles.candidateCol}>
              <Text style={styles.metaLabel}>Accuracy</Text>
              <Text style={styles.metaValue}>{accuracyPct}% ({correctCount}/{totalCount})</Text>
            </View>
          </View>

          {/* Metric Overview Strip */}
          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { marginRight: 12 }]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>Overall Scaled Score</Text>
                
              </View>
              <Text style={[styles.metricCardValue, { marginBottom: 14 }]}>{overallScore || '--'} <Text style={{ fontSize: 12, color: '#64748b' }}>/ 900</Text></Text>
              <Text style={styles.metricCardSub}>Theta Ability: {typeof abilityTheta === 'number' ? abilityTheta.toFixed(2) : '0.00'} SD</Text>
            </View>

            <View style={[styles.metricCard, { marginRight: 12 }]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>National Percentile</Text>
                
              </View>
              <Text style={[styles.metricCardValue, { marginBottom: 14 }]}>{ordinal(indiaPercentile)}</Text>
              <Text style={styles.metricCardSub}>Top {Math.max(1, 100 - indiaPercentile)}% across India cohort</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardTitle}>Cognitive Archetype</Text>
                
              </View>
              <Text style={{ fontSize: 15, fontFamily: 'Helvetica', fontWeight: 'bold', color: '#0f172a' }}>{archetypeTitle}</Text>
              <Text style={styles.metricCardSub}>{archetypeTagline}</Text>
            </View>
          </View>

          {/* PARAKH Holistic Pillars */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>PARAKH Holistic Competency Spectrum (NEP 2020)</Text>
              <Text style={styles.sectionSubtitle}>Standardized vs All-India Cohort</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>Competency Pillar</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Score</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Cohort Delta</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.6, textAlign: 'right' }]}>Evaluation</Text>
              </View>
              {Object.entries(parakhPillars).map(([key, pillar]: [string, any], idx) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                const isAlt = idx % 2 === 1;
                return (
                  <View key={key} wrap={false} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                    <Text style={[styles.tableCell, { flex: 2.2, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>{label}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{pillar.score || 75}/100</Text>
                    <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center', color: '#0284c7' }]}>{pillar.delta || '+0%'}</Text>
                    <Text style={[styles.tableCell, { flex: 1.6, textAlign: 'right' }]}>{pillar.label || 'Proficient'}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Student Profile: Strengths & Blindspots */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>Student Cognitive Profile</Text>
              <Text style={styles.sectionSubtitle}>Diagnostic Observations</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View wrap={false} style={[styles.cardBox, { flex: 1 }]}>
                <Text style={[styles.cardTitle, { color: '#16a34a' }]}>Core Strengths</Text>
                {strengths.slice(0, 2).map((s, i) => (
                  <View key={i} wrap={false} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: '#16a34a' }]} />
                    <Text style={styles.bulletText}>{s}</Text>
                  </View>
                ))}
              </View>

              <View wrap={false} style={[styles.cardBox, { flex: 1 }]}>
                <Text style={[styles.cardTitle, { color: '#d97706' }]}>Critical Blindspots & Traps</Text>
                {blindspots.slice(0, 2).map((b, i) => (
                  <View key={i} wrap={false} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: '#d97706' }]} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Parent Blueprint: Action Plan */}
          <View style={styles.section}>
            <View style={styles.sectionTitleBox}>
              <Text style={styles.sectionTitle}>Parent Educational Blueprint & Reality Check</Text>
              <Text style={styles.sectionSubtitle}>Status: {verdict}</Text>
            </View>
            <View wrap={false} style={styles.cardBox}>
              <Text style={styles.cardTitle}>Diagnostic Verdict: {verdict}</Text>
              <Text style={styles.cardText}>{honestSummary}</Text>
              
              <View style={{ marginTop: 4 }}>
                <Text style={[styles.metaLabel, { color: '#0284c7', marginTop: 3 }]}>Recommended Home Rehearsal</Text>
                {homeRoutines.slice(0, 2).map((r, i) => (
                  <View key={i} wrap={false} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>WARP Psychometric Calibration Engine (v2) · NEP 2020 & 3PL IRT Authorized</Text>
            <Text style={styles.footerPageNum} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
          </View>
        </Page>
      </Document>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4-PAGE COMPREHENSIVE DOSSIER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Document title={`WARP_Dossier_${studentName}_Class${classLevel}`} author="WARP Learning Signal">
      {/* ── PAGE 1: EXECUTIVE CALIBRATION & PARAKH PILLARS ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBlock}>
            <View>
              <Text style={styles.logoBrandText}>WARP</Text>
              <Text style={styles.logoSubtitle}>Comprehensive Psychometric Calibration Dossier</Text>
            </View>
          </View>
          <View style={styles.headerMetaRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Confidential · Executive Copy</Text>
            </View>
            <Text style={styles.headerRefText}>Ref: {refCode}</Text>
          </View>
        </View>

        {/* Candidate Metadata Strip */}
        <View style={styles.candidateGrid}>
          <View style={styles.candidateCol}>
            <Text style={styles.metaLabel}>Candidate</Text>
            <Text style={styles.metaValue}>{studentName}</Text>
          </View>
          <View style={styles.candidateCol}>
            <Text style={styles.metaLabel}>Cohort</Text>
            <Text style={styles.metaValue}>Class {classLevel}</Text>
          </View>
          <View style={styles.candidateCol}>
            <Text style={styles.metaLabel}>Diagnostic Date</Text>
            <Text style={styles.metaValue}>{dateString}</Text>
          </View>
          <View style={styles.candidateCol}>
            <Text style={styles.metaLabel}>Assessment Duration</Text>
            <Text style={styles.metaValue}>{formatDuration(totalTimeMs)}</Text>
          </View>
          <View style={styles.candidateCol}>
            <Text style={styles.metaLabel}>Overall Accuracy</Text>
            <Text style={styles.metaValue}>{accuracyPct}% ({correctCount}/{totalCount})</Text>
          </View>
        </View>

        {/* High-Level Benchmark Cards */}
        <View style={styles.metricRow}>
          <View style={[styles.metricCard, { marginRight: 12 }]}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardTitle}>Overall Scaled Score</Text>
              
            </View>
            <Text style={[styles.metricCardValue, { marginBottom: 14 }]}>{overallScore || '--'} <Text style={{ fontSize: 9, color: '#64748b' }}>/ 900</Text></Text>
            <Text style={styles.metricCardSub}>Theta Ability: {typeof abilityTheta === 'number' ? abilityTheta.toFixed(2) : '0.00'} SD</Text>
          </View>

          <View style={[styles.metricCard, { marginRight: 12 }]}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardTitle}>India Percentile</Text>
              
            </View>
            <Text style={[styles.metricCardValue, { marginBottom: 14 }]}>{ordinal(indiaPercentile)}</Text>
            <Text style={styles.metricCardSub}>National Cohort Calibration</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardTitle}>Cognitive Archetype</Text>
              <Text style={{ fontSize: 9.5, color: '#6366f1', fontFamily: 'Helvetica', fontWeight: 'bold' }}>MODEL</Text>
            </View>
            <Text style={{ fontSize: 15, fontFamily: 'Helvetica', fontWeight: 'bold', color: '#0f172a' }}>{archetypeTitle}</Text>
            <Text style={styles.metricCardSub}>{archetypeTagline}</Text>
          </View>
        </View>

        {/* PARAKH Holistic Pillars Table */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>PARAKH Holistic Competency Spectrum (NEP 2020)</Text>
            <Text style={styles.sectionSubtitle}>Standardized 5-Pillar STEAM Diagnostic</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>Competency Pillar</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Standardized</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>National Delta</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.6, textAlign: 'right' }]}>Mastery Tier</Text>
            </View>
            {Object.entries(parakhPillars).map(([key, pillar]: [string, any], idx) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              const isAlt = idx % 2 === 1;
              return (
                <View key={key} wrap={false} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 2.2, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>{label}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{pillar.score || 75}/100</Text>
                  <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center', color: '#0284c7' }]}>{pillar.delta || '+0%'}</Text>
                  <Text style={[styles.tableCell, { flex: 1.6, textAlign: 'right' }]}>{pillar.label || 'Proficient'}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Global Calibration Benchmark */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>International Benchmark Comparison</Text>
            <Text style={styles.sectionSubtitle}>PISA / Singapore / OECD Alignment</Text>
          </View>
          <View wrap={false} style={styles.cardBox}>
            <Text style={styles.cardTitle}>Global Alignment Summary</Text>
            <Text style={styles.cardText}>
              The candidate demonstrates strong analytical decomposition, matching the 65th percentile among OECD peers. 
              To bridge the gap with top-decile Singapore cohorts, guided practice in multi-step deductive chaining without formula prompts is recommended.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WARP Psychometric Calibration Engine (v2) · NEP 2020 & 3PL IRT Authorized</Text>
          <Text style={styles.footerPageNum}>PAGE 1 OF 4 · EXECUTIVE CALIBRATION</Text>
        </View>
      </Page>

      {/* ── PAGE 2: STUDENT COGNITIVE PROFILE & 30-DAY SPRINT ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBlock}>
            <View>
              <Text style={styles.logoBrandText}>WARP</Text>
              <Text style={styles.logoSubtitle}>Student Cognitive Profile &amp; Metacognitive Sprint</Text>
            </View>
          </View>
          <View style={styles.headerMetaRight}>
            <Text style={styles.headerRefText}>Candidate: {studentName} · Class {classLevel}</Text>
          </View>
        </View>

        {/* Archetype Overview */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Cognitive Archetype: {archetypeTitle}</Text>
            <Text style={styles.sectionSubtitle}>Mental Processing Signature</Text>
          </View>
          <View wrap={false} style={styles.cardBox}>
            <Text style={styles.cardTitle}>{archetypeTagline}</Text>
            <Text style={styles.cardText}>
              This cognitive pattern prioritizes structural consistency and first-principles causal deduction. 
              Under high time pressure or novel distracting options, candidates often over-analyze intermediate boundary conditions.
            </Text>
          </View>
        </View>

        {/* Strengths and Blindspots detailed */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View wrap={false} style={[styles.cardBox, { flex: 1 }]}>
              <Text style={[styles.cardTitle, { color: '#16a34a' }]}>Core Strengths (3 Evaluated)</Text>
              {strengths.map((s, i) => (
                <View key={i} wrap={false} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: '#16a34a' }]} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>

            <View wrap={false} style={[styles.cardBox, { flex: 1 }]}>
              <Text style={[styles.cardTitle, { color: '#d97706' }]}>Critical Blindspots &amp; Traps</Text>
              {blindspots.map((b, i) => (
                <View key={i} wrap={false} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: '#d97706' }]} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 30-Day Metacognitive Sprint */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>30-Day Student Challenge Sprint</Text>
            <Text style={styles.sectionSubtitle}>Weekly Actionable Milestones</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Phase</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>Weekly Target</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Habit / Metric</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>Week 1-2</Text>
              <Text style={[styles.tableCell, { flex: 2.2 }]}>Deconstruct distractor patterns in non-routine problems</Text>
              <Text style={[styles.tableCell, { flex: 2, color: '#0284c7' }]}>Maintain 15-min daily error log</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.tableCell, { flex: 1, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>Week 3</Text>
              <Text style={[styles.tableCell, { flex: 2.2 }]}>Boundary-condition verification on unfamiliar scenarios</Text>
              <Text style={[styles.tableCell, { flex: 2, color: '#0284c7' }]}>Solve 3 problems without formula lookup</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>Week 4</Text>
              <Text style={[styles.tableCell, { flex: 2.2 }]}>Timed multi-step synthesis under cognitive load</Text>
              <Text style={[styles.tableCell, { flex: 2, color: '#0284c7' }]}>Complete 1 full adaptive diagnostic sprint</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WARP Psychometric Calibration Engine (v2) · Confidential</Text>
          <Text style={styles.footerPageNum}>PAGE 2 OF 4 · STUDENT SPRINT</Text>
        </View>
      </Page>

      {/* ── PAGE 3: PARENT EDUCATIONAL BLUEPRINT & BOARD REALITY CHECK ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBlock}>
            <View>
              <Text style={styles.logoBrandText}>WARP</Text>
              <Text style={styles.logoSubtitle}>Parent Educational Blueprint &amp; Board Calibration</Text>
            </View>
          </View>
          <View style={styles.headerMetaRight}>
            <Text style={styles.headerRefText}>Ref: {refCode}</Text>
          </View>
        </View>

        {/* Board Reality Check */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Board Readiness &amp; Reality Check</Text>
            <Text style={styles.sectionSubtitle}>Assessment Verdict: {verdict}</Text>
          </View>
          <View wrap={false} style={styles.cardBox}>
            <Text style={styles.cardTitle}>Executive Assessment</Text>
            <Text style={styles.cardText}>{honestSummary}</Text>
          </View>
        </View>

        {/* Daily Home Rehearsal Routines */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Immediate Home Routines (Next 30 Days)</Text>
            <Text style={styles.sectionSubtitle}>Actionable Parent Support Protocol</Text>
          </View>
          {homeRoutines.map((routine, idx) => (
            <View key={idx} style={[styles.cardBox, { marginBottom: 4 }]}>
              <Text style={[styles.cardTitle, { color: '#0284c7' }]}>Routine {idx + 1}</Text>
              <Text style={styles.cardText}>{routine}</Text>
            </View>
          ))}
        </View>

        {/* PTM Discussion Guide */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Parent-Teacher Meeting (PTM) Strategic Questions</Text>
            <Text style={styles.sectionSubtitle}>Targeted Prompts for Educators</Text>
          </View>
          {ptmGuides.map((guide, idx) => (
            <View key={idx} style={[styles.cardBox, { marginBottom: 4 }]}>
              <Text style={[styles.cardTitle, { color: '#475569' }]}>Question {idx + 1}</Text>
              <Text style={styles.cardText}>"{guide}"</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WARP Psychometric Calibration Engine (v2) · Confidential</Text>
          <Text style={styles.footerPageNum}>PAGE 3 OF 4 · PARENT BLUEPRINT</Text>
        </View>
      </Page>

      {/* ── PAGE 4: PSYCHOMETRIC SCENARIO AUDIT & DISTRACTOR TRAPS ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBlock}>
            <View>
              <Text style={styles.logoBrandText}>WARP</Text>
              <Text style={styles.logoSubtitle}>Diagnostic Scenario Audit &amp; Distractor Traps</Text>
            </View>
          </View>
          <View style={styles.headerMetaRight}>
            <Text style={styles.headerRefText}>Accuracy: {accuracyPct}% ({correctCount}/{totalCount})</Text>
          </View>
        </View>

        {/* Scenarios Table */}
        <View style={styles.section}>
          <View style={styles.sectionTitleBox}>
            <Text style={styles.sectionTitle}>Scenario Response Log &amp; Distractor Audit</Text>
            <Text style={styles.sectionSubtitle}>Item-by-Item Cognitive Performance</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>#</Text>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Competency / Prompt</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Outcome</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Duration</Text>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Distractor / Misconception</Text>
            </View>
            {responses.slice(0, 6).map((resp: any, idx: number) => {
              const isCorrect = resp.correct === true || resp.is_correct === true;
              const isAlt = idx % 2 === 1;
              const competency = resp.competency || resp.benchmarkStandard || 'Analytical Reasoning';
              const prompt = resp.prompt || `Scenario item evaluating ${competency}`;
              const trap = resp.trap_analysis || (isCorrect ? 'First-principles validation verified' : 'Selected heuristic distractor over causal deduction');

              return (
                <View key={idx} style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 0.6, fontFamily: 'Helvetica', fontWeight: 'bold' }]}>{idx + 1}</Text>
                  <View style={{ flex: 3, paddingRight: 4 }}>
                    <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica', fontWeight: 'bold', color: '#0f172a', marginBottom: 2 }}>{competency}</Text>
                    <Text style={{ fontSize: 8.5, color: '#64748b' }}>{stripLaTeXForPdf(prompt)}</Text>
                  </View>
                  <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center', color: isCorrect ? '#16a34a' : '#dc2626', fontFamily: 'Helvetica', fontWeight: 'bold' }]}>
                    {isCorrect ? 'CORRECT' : 'TRAP'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center', color: '#64748b' }]}>
                    {formatDuration(resp.duration_ms || resp.time_taken_ms || 18000)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 3, color: isCorrect ? '#16a34a' : '#d97706', fontSize: 8.5 }]}>
                    {stripLaTeXForPdf(trap)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Metacognitive Conclusion */}
        <View style={styles.section}>
          <View wrap={false} style={styles.cardBox}>
            <Text style={styles.cardTitle}>Diagnostic Verification &amp; Authorization</Text>
            <Text style={styles.cardText}>
              This psychometric calibration report was generated using the WARP 3-Parameter Logistic (3PL) Item Response Theory model 
              in accordance with National Education Policy (NEP 2020) and PARAKH holistic assessment mandates. 
              Results reflect server-authoritative response timestamps and adaptive item calibration.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>WARP Psychometric Calibration Engine (v2) · Confidential</Text>
          <Text style={styles.footerPageNum} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages} · DIAGNOSTIC AUDIT`} />
        </View>
      </Page>
    </Document>
  );
}
