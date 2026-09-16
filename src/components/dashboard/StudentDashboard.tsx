import { useEffect, useState } from 'react';
import { TriangleAlert, Plus, Trophy, Trash2, TrendingUp, Brain, Sparkles, FileText, ArrowRight, Play, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import { useWarpSession } from '../../context/WarpSessionContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';
import { signOutUser } from '../../lib/auth';
import { Leaderboard } from './Leaderboard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';
import { CounterNumber } from '../ui/aliimam/CounterNumber';
import { Gauge } from '../ui/aliimam/Gauge';
import { OutcomeBadge } from '../ui/OutcomeBadge';
import { Delta, DeltaIcon, DeltaValue } from '../efferd/delta';
import { computeInternationalBenchmark, COMPETENCY_LABELS, STEM_COMPETENCIES, ENGLISH_COMPETENCIES } from '../../lib/irt/globalBenchmark';

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/** Time-of-day greeting */
function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

interface HistoryRow {
  id: string;
  completedAt: string;
  classLevel: number;
  difficulty: string;
  score: number;
  globalPct: number;
  subject?: string;
}

const EMPTY_SUMMARY = {
  latestScore: null as number | null,
  scoreDelta: null as number | null,
  bestGlobalPct: 0,
  totalAssessments: 0,
  recentAssessments: [] as HistoryRow[],
  latestAbilityTheta: null as Record<string, number> | null,
  latestClassLevel: 8,
  latestSubject: 'STEM',
  latestFullName: null as string | null,
  firstAssessmentAt: null as string | null,
};

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative h-full flex flex-col justify-between p-5 bg-card border border-border/50 rounded-none transition-colors hover:border-border">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-foreground-muted">
        {label}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 w-full">{children}</div>
    </div>
  );
}

export function StudentDashboard() {
  const { isGuest } = useAuthStore();
  const { user, isLoaded } = useSupabaseAuth();
  const { setProfile, enterApp } = useWarpSession();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [showClassConfirm, setShowClassConfirm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('8');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    if (isGuest || !user?.id) {
      if (!isGuest) {
        // Not a guest and no user ID => force login overlay/redirect unless currently logging out
        if (typeof window !== 'undefined' && !window.sessionStorage.getItem('logged_out')) {
          window.location.search = '?login';
        }
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    async function fetchSummary() {
      try {
        const { data: userData } = await supabase
          .from('students')
          .select('id, full_name')
          .eq('id', user!.id)
          .maybeSingle();

        const studentId = userData?.id || user!.id;
        const latestFullName = (userData as any)?.full_name || null;

        const { data: assessments } = await supabase
          .from('assessments')
          .select('*')
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (assessments && assessments.length > 0) {
          const totalAssessments = assessments.length;
          const recentAssessments = assessments.map(a => {
            const score = a.global_score || (a as any).result?.overallScore || 500;
            // Ensure global percentile is accurately derived from 3PL IRT scale if absent
            const rawPct = (a.percentiles as any)?.global || (a.percentiles as any)?.Global || (a as any).result?.regionalPercentiles?.['Global'] || 0;
            const globalPct = rawPct > 0 ? rawPct : Math.min(99, Math.max(1, Math.round(100 / (1 + Math.exp(-((score - 500) / 100))))));

            return {
              id: a.id,
              completedAt: a.completed_at || new Date().toISOString(),
              classLevel: a.class_level || 8,
              difficulty: a.difficulty || 'Standard',
              score,
              globalPct,
              subject: (a as any).subject || 'STEM',
            };
          });

          const latestScore = recentAssessments[0].score;
          const scoreDelta = recentAssessments.length > 1 ? latestScore - recentAssessments[1].score : null;
          const bestGlobalPct = Math.max(...recentAssessments.map(a => a.globalPct));
          const latestAbilityTheta = 
            (assessments[0].ability_theta as Record<string, number> | null) ||
            (assessments[0] as any).result?.abilityTheta ||
            (assessments[0] as any).result?.theta ||
            null;
          const latestClassLevel = assessments[0].class_level || 8;
          const latestSubject = (assessments[0] as any).subject || 'STEM';
          const firstAssessmentAt = assessments[assessments.length - 1].completed_at || null;

          setSummary({
            latestScore,
            scoreDelta,
            bestGlobalPct,
            totalAssessments,
            recentAssessments,
            latestAbilityTheta,
            latestClassLevel,
            latestSubject,
            latestFullName,
            firstAssessmentAt,
          });
        } else {
          setSummary(s => ({ ...s, latestFullName }));
        }
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [user, isGuest, isLoaded]);

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: userData } = await supabase.from('students').select('id').eq('id', user.id).single();
      if (userData) {
        await supabase.from('students').delete().eq('id', userData.id);
      }
      await signOutUser();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Derived display name - prefer DB full_name over email prefix
  const displayName =
    summary.latestFullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';

  // Days until next 30-day checkpoint (calculated from the latest calibrated session)
  const daysUntilNextCheckpoint = (() => {
    const latestDateStr = summary.recentAssessments[0]?.completedAt || summary.firstAssessmentAt;
    if (!latestDateStr) return null;
    const latestTime = new Date(latestDateStr).getTime();
    const thirtyDaysLater = latestTime + 30 * 24 * 60 * 60 * 1000;
    const remaining = Math.ceil((thirtyDaysLater - Date.now()) / (24 * 60 * 60 * 1000));
    return remaining > 0 ? remaining : 0;
  })();

  if (isGuest) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-12">
        <div className="card flex w-full max-w-lg flex-col items-center gap-4 p-8 border border-border bg-card">
          <TriangleAlert className="size-8 text-amber-500" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Guest session active</h2>
          <p className="text-balance text-sm text-foreground-secondary leading-relaxed">
            You completed the assessment as a guest. Your provisional score is saved in your local session.
            Create an account to preserve your longitudinal curve and unlock the continuous calibration dossier.
          </p>
          <Button className="mt-4" onClick={handleLogout}>
            Create an account
          </Button>
        </div>
      </main>
    );
  }

  // Deduplicate and format dates for Longitudinal Performance Arc to prevent axis collision
  const chartPoints = [...summary.recentAssessments].reverse().map((a, index, arr) => {
    const rawDate = dateFmt.format(new Date(a.completedAt));
    const sameDateMatches = arr.filter(item => dateFmt.format(new Date(item.completedAt)) === rawDate);
    let displayDate = rawDate;
    if (sameDateMatches.length > 1) {
      const occurrenceIndex = arr.slice(0, index + 1).filter(item => dateFmt.format(new Date(item.completedAt)) === rawDate).length;
      displayDate = `${rawDate} · #${occurrenceIndex}`;
    }
    return {
      date: displayDate,
      score: a.score,
      globalPct: a.globalPct,
      classLevel: a.classLevel,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-y-auto p-4 sm:p-8 md:p-10">
      {/* ── Dossier Header (Nordic Lagom: Restrained, Precise) ── */}
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground-muted">
              STUDENT DOSSIER / CLASS {summary.latestClassLevel} · {summary.latestSubject}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              {displayName}
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-none">
              {timeGreeting()}
            </span>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Continuous adaptive psychometric calibration under 3PL IRT protocol
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-none border-primary/50 text-xs font-mono font-semibold" onClick={async () => {
            if (user) {
              const { data: userData } = await supabase.from('students').select('*').eq('id', user.id).single();
              if (!userData?.full_name || !userData?.current_class || !userData?.parent_name || !userData?.school_name) {
                enterApp();
                setTimeout(() => {
                  window.location.search = '';
                }, 50);
              } else {
                setSelectedClass(userData.current_class.toString());
                setShowClassConfirm(true);
              }
            } else {
              window.location.search = '';
            }
          }}>
            <Plus className="size-3 mr-1" />
            New assessment
          </Button>
        </div>
      </header>

      {(!isLoaded || isLoading) ? (
        <SpinnerBlock label="Loading calibrated dossier" />
      ) : (
        <div className="flex flex-col gap-8">
          {/* ── Metric Stat Tiles (1px Hairline, Corner Marks, Tabular Numerals) ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Latest Scaled Score">
              {summary.latestScore !== null ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl sm:text-4xl font-bold tabular tracking-tight text-foreground">
                        {summary.latestScore}
                      </span>
                      <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {summary.recentAssessments[0]?.globalPct > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/25 rounded-none">
                          {ordinal(summary.recentAssessments[0].globalPct)} Pct
                        </span>
                      )}
                      {summary.scoreDelta !== null && summary.scoreDelta !== 0 && (
                        <Delta value={summary.scoreDelta} variant="badge">
                          <DeltaIcon variant="trend" />
                          <DeltaValue precision={0} suffix=" pts vs prev" showPlus />
                        </Delta>
                      )}
                    </div>
                  </div>
                  <Gauge 
                    value={summary.latestScore} 
                    min={100} 
                    max={900} 
                    gaugePrimaryColor="var(--primary)" 
                    gaugeSecondaryColor="var(--border)" 
                    className="h-14 w-14 shrink-0"
                    showValue={false}
                  />
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-bold tabular text-foreground-muted">-</span>
                  <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                </div>
              )}
            </Stat>

            <Stat label="Reference Global Norm">
              {summary.bestGlobalPct > 0 ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-mono text-3xl sm:text-4xl font-bold tabular tracking-tight text-foreground">
                      {ordinal(summary.bestGlobalPct)}
                    </span>
                    <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                      Top {Math.max(1, 100 - summary.bestGlobalPct)}% worldwide
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <OutcomeBadge percentile={summary.bestGlobalPct} size="md" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-mono text-2xl font-bold tabular text-foreground-muted">Calibrating</span>
                    <p className="text-[10px] font-mono text-foreground-muted mt-0.5">Awaiting benchmark</p>
                  </div>
                  <Trophy className="size-5 text-foreground-muted" aria-hidden="true" />
                </div>
              )}
            </Stat>

            <Stat label="Calibrated Sessions">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CounterNumber 
                    value={summary.totalAssessments} 
                    className="font-mono text-3xl sm:text-4xl font-bold tabular tracking-tight text-foreground" 
                  />
                  <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                    {summary.totalAssessments === 1 ? '1 baseline milestone' : `${summary.totalAssessments} checkpoints calibrated`}
                  </p>
                </div>
                <div className="p-2 bg-surface border border-border text-foreground-muted rounded-none">
                  <Sparkles className="size-4" />
                </div>
              </div>
            </Stat>
          </div>

          {/* ── Quick Actions (Sharp 0px geometry) ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <button
              onClick={async () => {
                if (user) {
                  const { data: userData } = await supabase.from('students').select('*').eq('id', user.id).single();
                  if (!userData?.full_name || !userData?.current_class || !userData?.parent_name || !userData?.school_name) {
                    enterApp();
                    setTimeout(() => { window.location.search = ''; }, 50);
                  } else {
                    setSelectedClass(userData.current_class.toString());
                    setShowClassConfirm(true);
                  }
                } else {
                  window.location.search = '';
                }
              }}
              className="relative overflow-hidden border border-primary/30 bg-primary/5 p-4 flex flex-col justify-between gap-3 rounded-none transition-colors hover:border-primary/50 text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-8 bg-primary/20 flex items-center justify-center text-primary rounded-none">
                  <Play className="size-4 ml-0.5" fill="currentColor" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-none">
                  Class {selectedClass}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Start Assessment</span>
                  <ArrowRight className="size-3 text-primary transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Adaptive CAT calibration</p>
              </div>
            </button>

            <button
              onClick={() => {
                if (summary.recentAssessments[0]?.id) {
                  window.location.href = `/?assessment=${summary.recentAssessments[0].id}`;
                }
              }}
              disabled={summary.recentAssessments.length === 0}
              className="relative overflow-hidden border border-border/50 bg-card p-4 flex flex-col justify-between gap-3 rounded-none transition-colors hover:border-border text-left group disabled:opacity-40"
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-8 bg-surface border border-border flex items-center justify-center text-foreground-secondary rounded-none">
                  <FileText className="size-4" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider bg-surface border border-border text-foreground-muted rounded-none">
                  Official
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Latest Report</span>
                  <ArrowRight className="size-3 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Executive hub & PTM guide</p>
              </div>
            </button>

            <button
              onClick={() => {
                if (summary.recentAssessments[0]?.id) {
                  window.location.href = `/?assessment=${summary.recentAssessments[0].id}&tutor=true`;
                }
              }}
              disabled={summary.recentAssessments.length === 0}
              className="relative overflow-hidden border border-border/50 bg-card p-4 flex flex-col justify-between gap-3 rounded-none transition-colors hover:border-border text-left group disabled:opacity-40"
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-8 bg-surface border border-border flex items-center justify-center text-foreground-secondary rounded-none">
                  <Sparkles className="size-4" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider bg-surface border border-border text-foreground-muted rounded-none">
                  AI Tutor
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Socratic Guidance</span>
                  <ArrowRight className="size-3 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Deconstruct distractor traps</p>
              </div>
            </button>

            <button
              onClick={() => {
                const arcEl = document.getElementById('longitudinal-arc-card');
                if (arcEl) arcEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative overflow-hidden border border-border/50 bg-card p-4 flex flex-col justify-between gap-3 rounded-none transition-colors hover:border-border text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="size-8 bg-surface border border-border flex items-center justify-center text-foreground-secondary rounded-none">
                  <TrendingUp className="size-4" />
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider bg-surface border border-border text-foreground-muted rounded-none">
                  {summary.totalAssessments} checks
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Performance Arc</span>
                  <ArrowRight className="size-3 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Longitudinal growth curve</p>
              </div>
            </button>
          </div>

          {/* ── Competency Breakdown (Nordic Lagom: Hairline Cards) ── */}
          {summary.recentAssessments.length > 0 && (() => {
            const effectiveTheta = summary.latestAbilityTheta || {
              c1: ((summary.latestScore || 500) - 500) / 120,
              c2: ((summary.latestScore || 500) - 500) / 120,
              c3: ((summary.latestScore || 500) - 500) / 120,
              c4: ((summary.latestScore || 500) - 500) / 120,
              c5: ((summary.latestScore || 500) - 500) / 120,
            };
            const breakdown = computeInternationalBenchmark(effectiveTheta, summary.latestClassLevel, summary.latestSubject);
            const isEnglish = (summary.latestSubject || '').toLowerCase().includes('english');
            const competencyKeys = isEnglish ? ENGLISH_COMPETENCIES : STEM_COMPETENCIES;
            return (
              <Card className="p-6 rounded-none border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <h3 className="font-display text-base font-bold">
                      {isEnglish ? 'English Literacy Competency Vitals' : 'STEM Competency Vitals'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono rounded-none">
                      {summary.latestSubject || 'STEM'}
                    </Badge>
                    <span className="text-[11px] text-foreground-muted hidden sm:inline">
                      Benchmarked against SASMO / AMC 8
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {competencyKeys.map((key, idx) => {
                    const item = breakdown.competencyBreakdown[key];
                    if (!item) return null;
                    const pct = item.globalPercentile;
                    const barWidth = Math.max(4, pct);
                    const deltaScore = item.scaledScore - 500;
                    const status = pct >= 75 ? 'Exceeding' : pct >= 45 ? 'Proficient' : 'Developing';

                    return (
                      <div 
                        key={key} 
                        className="flex flex-col justify-between p-4 rounded-none border border-border bg-card hover:border-border-strong transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-secondary truncate">
                              {COMPETENCY_LABELS[key]}
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 font-mono font-medium border rounded-none ${
                              status === 'Exceeding' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                : status === 'Proficient'
                                ? 'bg-primary/10 text-primary border-primary/25'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                            }`}>
                              {status}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono text-2xl font-bold tabular text-foreground">
                                {item.scaledScore}
                              </span>
                              <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                            </div>
                            <Delta value={deltaScore} variant="badge">
                              <DeltaIcon variant="trend" />
                              <DeltaValue precision={0} suffix=" vs median" showPlus />
                            </Delta>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-border/40">
                          <div className="relative h-1.5 w-full bg-surface border border-border/50 overflow-hidden rounded-none">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
                              className={`h-full ${
                                status === 'Exceeding' 
                                  ? 'bg-emerald-500' 
                                  : status === 'Proficient' 
                                  ? 'bg-primary' 
                                  : 'bg-amber-500'
                              }`}
                            />
                            {/* Median benchmark marker at 50% */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground/30 z-10" title="50th Percentile Benchmark" />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-foreground-muted font-mono">
                            <span>{ordinal(pct)} percentile</span>
                            <span>Cohort median: 500</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}

          {/* ── Longitudinal Performance Arc (Deduplicated X-Axis Dates, Clean Fjord Area) ── */}
          {summary.recentAssessments.length > 0 && (
            <Card className="p-6 rounded-none border border-border bg-card" id="longitudinal-arc-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h3 className="font-display text-base font-bold">Longitudinal Performance Arc</h3>
                </div>
                <div className="flex items-center gap-3">
                  {summary.recentAssessments.length >= 2 && summary.scoreDelta !== null && (
                    <Delta value={summary.scoreDelta} variant="badge">
                      <DeltaIcon variant="trend" />
                      <DeltaValue precision={0} suffix=" pts since last checkpoint" showPlus />
                    </Delta>
                  )}
                  <span className="text-xs text-foreground-secondary font-mono">
                    {summary.recentAssessments.length === 1
                      ? 'Baseline benchmark recorded'
                      : `${summary.recentAssessments.length} checkpoints calibrated`}
                  </span>
                </div>
              </div>

              {summary.recentAssessments.length >= 2 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartPoints}
                      margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dashboardScoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        className="text-foreground-secondary font-mono"
                        tickLine={false}
                      />
                      <YAxis
                        domain={[200, 900]}
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        className="text-foreground-secondary font-mono"
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-none border border-border bg-card p-3 shadow-md text-xs space-y-1">
                                <p className="font-bold text-foreground">{d.date}</p>
                                <p className="text-primary font-mono font-semibold">Scaled Score: {d.score} / 900</p>
                                <p className="text-foreground-secondary">Rank: {ordinal(d.globalPct)} percentile</p>
                                <p className="text-foreground-muted font-mono">Class {d.classLevel}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#dashboardScoreGrad)"
                        dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 1, stroke: 'var(--card)' }}
                        activeDot={{ r: 5, fill: 'var(--primary)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-none bg-surface/50 border border-border text-xs">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-bold text-foreground">
                      Baseline score: {summary.latestScore} / 900 ({ordinal(summary.bestGlobalPct)} percentile)
                    </p>
                    <p className="text-foreground-secondary">
                      Complete another assessment in 30 days to generate your comparative trajectory curve.
                    </p>
                  </div>
                  <Badge tone="primary" className="rounded-none">Baseline Active</Badge>
                </div>
              )}

              {/* ── 30-Day Checkpoint Countdown & Step Indicator ── */}
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-secondary font-mono">
                    30-Day Calibration Rhythm
                  </span>
                  {daysUntilNextCheckpoint !== null && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold border rounded-none ${
                      daysUntilNextCheckpoint === 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                        : 'bg-primary/10 text-primary border-primary/25'
                    }`}>
                      <span className="size-1.5 bg-current" />
                      {daysUntilNextCheckpoint === 0
                        ? 'Calibration window open'
                        : `Next checkpoint: ${daysUntilNextCheckpoint} days remaining`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 border border-border bg-surface/40 flex flex-col justify-between rounded-none">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-foreground-muted">Checkpoint 1</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-none">
                        Calibrated
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Baseline Diagnostic</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5 font-mono">
                      {summary.firstAssessmentAt ? dateFmt.format(new Date(summary.firstAssessmentAt)) : 'Recorded'}
                    </p>
                  </div>

                  <div className={`p-3 border flex flex-col justify-between rounded-none ${
                    summary.recentAssessments.length >= 2
                      ? 'border-border bg-surface/40'
                      : 'border-primary/40 bg-primary/5'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-foreground-muted">Checkpoint 2</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                        summary.recentAssessments.length >= 2
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : daysUntilNextCheckpoint === 0
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {summary.recentAssessments.length >= 2
                          ? 'Calibrated'
                          : daysUntilNextCheckpoint === 0
                          ? 'Ready'
                          : `T-${daysUntilNextCheckpoint}d`}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Mid-Cycle Trajectory</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5 font-mono">
                      {summary.recentAssessments.length >= 2
                        ? dateFmt.format(new Date(summary.recentAssessments[summary.recentAssessments.length - 2]?.completedAt || ''))
                        : '30-Day Re-calibration'}
                    </p>
                  </div>

                  <div className={`p-3 border flex flex-col justify-between ${
                    summary.recentAssessments.length >= 3
                      ? 'border-border bg-surface/40'
                      : 'border-border/60 bg-surface/20 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-foreground-muted">Checkpoint 3</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                        summary.recentAssessments.length >= 3
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-surface text-foreground-muted border-border'
                      }`}>
                        {summary.recentAssessments.length >= 3 ? 'Calibrated' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Longitudinal Growth</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5 font-mono">Quarterly Calibration</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── Assessment History (Tabular Numbers, Calm Diagnostic Pills) ── */}
          <Card>
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold">Assessment History</h3>
              <span className="text-xs text-foreground-muted font-mono">
                {summary.recentAssessments.length} completed
              </span>
            </div>

            {summary.recentAssessments.length === 0 ? (
              <EmptyState
                title="No assessments completed yet"
                hint="Your finished assessments will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary font-mono">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Level</th>
                      <th className="px-6 py-3 font-semibold">Scaled Score</th>
                      <th className="px-6 py-3 font-semibold">Global Rank</th>
                      <th className="px-6 py-3 text-right font-semibold">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.recentAssessments.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-surface/50">
                        <td className="px-6 py-4 font-mono text-xs text-foreground-secondary">
                          {dateFmt.format(new Date(a.completedAt))}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            Class {a.classLevel} · {a.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold tabular text-xs px-2.5 py-1 border ${
                            a.globalPct >= 75
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                              : a.globalPct >= 40
                              ? 'bg-primary/10 text-primary border-primary/25'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          }`}>
                            {a.score} <span className="text-[10px] text-foreground-muted font-normal">/ 900</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular text-foreground font-semibold text-xs">
                              {ordinal(a.globalPct)}
                            </span>
                            <OutcomeBadge percentile={a.globalPct} size="sm" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => (window.location.href = `/?assessment=${a.id}`)}
                            aria-label="View report"
                            data-testid="view-report-button"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Chronological Activity Timeline (Crisp nodes, no glow) ── */}
          {summary.recentAssessments.length > 0 && (
            <Card className="p-6">
              <div className="border-b border-border pb-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <h3 className="font-display text-base font-bold">Recent Milestones & Activity</h3>
                </div>
                <span className="text-xs text-foreground-muted font-mono">Chronological Audit Log</span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-border">
                {summary.recentAssessments.slice(0, 3).map((a, idx) => (
                  <div key={a.id} className="flex items-start gap-4 relative pl-8">
                    {/* Diamond node */}
                    <div className={`absolute left-3 top-3.5 size-2.5 rotate-45 border-2 -translate-x-1/2 -translate-y-1/2 transition-all ${
                      idx === 0 
                        ? 'bg-primary border-primary ring-2 ring-primary/20' 
                        : 'border-border bg-card'
                    }`} />
                    <div className={`flex-1 p-3.5 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      idx === 0
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-card'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Class {a.classLevel} {a.subject || 'STEM'} Benchmark Completed
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/30 font-mono font-semibold">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-foreground-secondary">
                          Calibrated score of <span className="font-mono font-bold text-foreground">{a.score}/900</span> placing at the <span className="font-semibold text-foreground">{ordinal(a.globalPct)} percentile</span> globally.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-foreground-muted font-mono">
                          {dateFmt.format(new Date(a.completedAt))}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2.5"
                          onClick={() => (window.location.href = `/?assessment=${a.id}`)}
                        >
                          Audit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Global Leaderboard Component ── */}
          <Leaderboard />

          {/* ── Discreet Danger Zone Accordion ── */}
          <div className="border border-border bg-card overflow-hidden">
            <button
              onClick={() => {
                if (dangerOpen) setConfirmDelete(false);
                setDangerOpen(prev => !prev);
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/40 transition-colors"
              aria-expanded={dangerOpen}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-foreground-secondary">
                <span className="size-1.5 bg-foreground-muted" />
                <span>System telemetry & account preferences</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono text-foreground-muted border-border">
                  Configuration
                </Badge>
                <ChevronDown className={`size-4 text-foreground-muted transition-transform duration-200 ${dangerOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {dangerOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden border-t border-border bg-surface/30"
                >
                  <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold text-foreground">
                        Purge Student Profile
                      </h3>
                      <p className="mt-1 text-xs text-foreground-secondary">
                        Permanently purges student assessments, adaptive theta calibrations, and dossier history.
                      </p>
                    </div>
                    {confirmDelete ? (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          <Trash2 className="size-4" />
                          {deleting ? 'Purging…' : 'Confirm irreversible purge'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 text-xs"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Purge Profile
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Nordic Lagom Psychometric Telemetry Footer ── */}
          <footer className="mt-4 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-foreground-muted">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 bg-emerald-500/80" />
              <span>3PL IRT CALIBRATION PROTOCOL ACTIVE · NORDIC LAGOM</span>
            </div>
            <div className="flex items-center gap-4">
              <span>LATENCY: ZERO-TRUST CACHE</span>
              <span>CALIBRATED SESSION</span>
            </div>
          </footer>
        </div>
      )}

      {showClassConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 shadow-lg corner-marks border border-border bg-card">
            <h2 className="mb-2 font-display text-xl font-bold">Confirm your class</h2>
            <p className="mb-5 text-xs text-foreground-secondary">
              Verify your target class level to calibrate item difficulty under adaptive 3PL IRT parameters.
            </p>
            <div className="mb-6">
              <label htmlFor="confirmClass" className="mb-2 block text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-foreground-muted">Class Level</label>
              <div className="relative">
                <select 
                  id="confirmClass" 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex h-10 w-full appearance-none rounded-none border border-border bg-surface pl-3.5 pr-10 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary cursor-pointer transition-colors"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 3).map(l => (
                    <option 
                      key={l} 
                      value={l} 
                      className="bg-card text-foreground"
                    >
                      Class {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" aria-hidden="true" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowClassConfirm(false)} disabled={isStarting}>Cancel</Button>
              <Button disabled={isStarting} onClick={async () => {
                setIsStarting(true);
                await supabase.from('students').update({ current_class: Number(selectedClass) }).eq('id', user!.id);
                const { data: userData } = await supabase.from('students').select('*').eq('id', user!.id).single();
                setProfile({
                  name: userData?.full_name || 'Learner',
                  classLevel: userData?.current_class || 8,
                  difficulty: (userData?.difficulty_pref as any) || 'Standard'
                });
                setTimeout(() => {
                  window.location.search = '';
                }, 50);
              }}>
                {isStarting ? 'Starting...' : 'Start Assessment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
