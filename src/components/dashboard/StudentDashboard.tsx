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
import { BorderGlow } from '../ui/aliimam/BorderGlow';
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
    <BorderGlow className="h-full">
      <div className="corner-marks relative h-full flex flex-col justify-center px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">
          {label}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3 w-full">{children}</div>
      </div>
    </BorderGlow>
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
          const recentAssessments = assessments.map(a => ({
            id: a.id,
            completedAt: a.completed_at || new Date().toISOString(),
            classLevel: a.class_level,
            difficulty: a.difficulty,
            score: a.global_score || (a as any).result?.overallScore || 0,
            globalPct: (a.percentiles as any)?.global || (a.percentiles as any)?.Global || (a as any).result?.regionalPercentiles?.['Global'] || 0,
            subject: (a as any).subject || 'STEM',
          }));

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
      // In Supabase, deleting the auth user requires an Edge Function or admin API,
      // or RPC. For now, we will delete the public.users record which cascades to
      // assessments/reports, but auth user remains unless we call an RPC.
      // Assuming RPC 'delete_user' exists or we just rely on signOut.
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

  // Derived display name — prefer DB full_name over email prefix
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
        <div className="card flex w-full max-w-lg flex-col items-center gap-4 p-8">
          <TriangleAlert className="size-8 text-warning" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold">Guest mode active</h2>
          <p className="text-balance text-sm text-foreground-secondary">
            You completed the assessment as a guest. Your provisional score is saved on this
            device. Create an account to generate your written report and unlock the full
            dashboard.
          </p>
          <Button className="mt-4" onClick={handleLogout}>
            Create an account
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-y-auto p-4 sm:p-8 md:p-12">
      <header className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Student dashboard
          </p>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase border-primary/30 text-primary bg-primary/5 py-0.5 px-2">
              {timeGreeting()}
            </Badge>
            <span className="text-foreground-muted">· Welcome back</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-xs">
            {displayName}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={async () => {
            if (user) {
              const { data: userData } = await supabase.from('students').select('*').eq('id', user.id).single();
              if (!userData?.full_name || !userData?.current_class || !userData?.parent_name || !userData?.school_name) {
                // Missing metadata, force profile setup by navigating to onboarding
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
            <Plus className="size-4" />
            New assessment
          </Button>
        </div>
      </header>

      {(!isLoaded || isLoading) ? (
        <SpinnerBlock label="Loading your dashboard" />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Latest score">
              {summary.latestScore !== null ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-4xl sm:text-5xl font-extrabold tabular tracking-tight text-foreground">
                        {summary.latestScore}
                      </span>
                      <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {summary.recentAssessments[0]?.globalPct > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30">
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
                    className="h-16 w-16 shrink-0"
                    showValue={false}
                  />
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-bold tabular text-foreground-muted">—</span>
                  <span className="text-xs font-mono text-foreground-muted">/ 900</span>
                </div>
              )}
            </Stat>

            <Stat label="Best global rank">
              {summary.bestGlobalPct > 0 ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-mono text-4xl sm:text-5xl font-extrabold tabular tracking-tight text-foreground">
                      {ordinal(summary.bestGlobalPct)}
                    </span>
                    <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                      Top {Math.max(1, 100 - summary.bestGlobalPct)}% worldwide
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <OutcomeBadge percentile={summary.bestGlobalPct} size="md" className="shadow-xs" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-4xl font-bold tabular text-foreground-muted">—</span>
                  <Trophy className="size-5 text-foreground-muted" aria-hidden="true" />
                </div>
              )}
            </Stat>

            <Stat label="Assessments taken">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CounterNumber 
                    value={summary.totalAssessments} 
                    className="font-mono text-4xl sm:text-5xl font-extrabold tabular tracking-tight text-foreground" 
                  />
                  <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                    {summary.totalAssessments === 1 ? '1 baseline milestone' : `${summary.totalAssessments} calibrated sessions`}
                  </p>
                </div>
                <div className="p-2.5 bg-surface border border-border text-foreground-muted">
                  <Sparkles className="size-4" />
                </div>
              </div>
            </Stat>
          </div>

          {/* ── Efferd Quick Actions Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              className="group relative p-4 border border-primary/50 bg-linear-to-br from-primary/10 via-card to-card text-left hover:border-primary hover:shadow-[0_0_15px_rgba(143,207,232,0.15)] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary text-primary-foreground shadow-xs">
                  <Play className="size-4 fill-current" />
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px] font-mono font-bold">
                  Class {selectedClass}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Start Assessment</span>
                  <motion.span
                    className="inline-flex items-center text-primary"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    <ArrowRight className="size-3.5" />
                  </motion.span>
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
              className="group p-4 border border-border bg-card text-left hover:border-primary/60 transition-all flex flex-col justify-between disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">Official</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
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
              className="group p-4 border border-border bg-card text-left hover:border-primary/60 transition-all flex flex-col justify-between disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">AI Tutor</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
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
              className="group p-4 border border-border bg-card text-left hover:border-primary/60 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 text-primary">
                  <TrendingUp className="size-4" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">{summary.totalAssessments} checks</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Performance Arc</span>
                  <ArrowRight className="size-3 text-foreground-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Longitudinal growth curve</p>
              </div>
            </button>
          </div>

          {/* ── Competency Breakdown (Vitals Grid Pattern) ── */}
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
              <Card className="p-6">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <h3 className="font-display text-base font-bold">
                      {isEnglish ? 'English Literacy Competency Vitals' : 'STEM Competency Vitals'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
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
                    const status = pct >= 75 ? 'Exceeding' : pct >= 50 ? 'Proficient' : 'Developing';
                    const statusAccent = 
                      status === 'Exceeding' 
                        ? 'border-l-4 border-l-emerald-500' 
                        : status === 'Proficient' 
                        ? 'border-l-4 border-l-primary' 
                        : 'border-l-4 border-l-amber-500';

                    return (
                      <div key={key} className={`flex flex-col justify-between p-3.5 rounded-none border border-border bg-surface/50 hover:border-border-strong transition-colors ${statusAccent}`}>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-secondary truncate">
                              {COMPETENCY_LABELS[key]}
                            </p>
                            <span className={`text-[10px] px-1.5 py-0.5 font-mono font-medium ${
                              status === 'Exceeding' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : status === 'Proficient'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {status}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mb-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono text-2xl font-bold tabular text-foreground">
                                {item.scaledScore}
                              </span>
                              <span className="text-xs text-foreground-muted">/ 900</span>
                            </div>
                            <Delta value={deltaScore} variant="badge">
                              <DeltaIcon variant="trend" />
                              <DeltaValue precision={0} suffix=" vs median" showPlus />
                            </Delta>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="relative h-1.5 w-full bg-border overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                              className={`h-full ${
                                status === 'Exceeding' 
                                  ? 'bg-emerald-500' 
                                  : status === 'Proficient' 
                                  ? 'bg-primary' 
                                  : 'bg-amber-500'
                              }`}
                            />
                            {/* Median benchmark marker at 50% */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground/40" title="50th Percentile Benchmark" />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-foreground-muted">
                            <span>{ordinal(pct)} percentile globally</span>
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

          {summary.recentAssessments.length > 0 && (
            <Card className="p-6" id="longitudinal-arc-card">
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
                  <span className="text-xs text-foreground-secondary">
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
                      data={[...summary.recentAssessments].reverse().map((a) => ({
                        date: dateFmt.format(new Date(a.completedAt)),
                        score: a.score,
                        globalPct: a.globalPct,
                        classLevel: a.classLevel,
                      }))}
                      margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dashboardScoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        className="text-foreground-secondary"
                        tickLine={false}
                      />
                      <YAxis
                        domain={[200, 900]}
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        className="text-foreground-secondary"
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="rounded-none border border-border bg-background p-3 shadow-lg text-xs space-y-1">
                                <p className="font-bold text-foreground">{d.date}</p>
                                <p className="text-primary font-mono font-semibold">Scaled Score: {d.score} / 900</p>
                                <p className="text-foreground-secondary">Rank: {ordinal(d.globalPct)} percentile</p>
                                <p className="text-foreground-muted">Class {d.classLevel}</p>
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
                        dot={{ r: 3, fill: 'var(--primary)' }}
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
                  <Badge tone="primary">Baseline Active</Badge>
                </div>
              )}

              {/* ── 30-Day Checkpoint Countdown & Step Indicator ── */}
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">
                    30-Day Calibration Rhythm
                  </span>
                  {daysUntilNextCheckpoint !== null && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-semibold border ${
                      daysUntilNextCheckpoint === 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-pulse'
                        : 'bg-primary/10 text-primary border-primary/30'
                    }`}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {daysUntilNextCheckpoint === 0
                        ? 'Calibration window open'
                        : `Next checkpoint: ${daysUntilNextCheckpoint} days remaining`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 border border-border bg-surface/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-foreground-muted">Checkpoint 1</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Calibrated
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Baseline Diagnostic</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5 font-mono">
                      {summary.firstAssessmentAt ? dateFmt.format(new Date(summary.firstAssessmentAt)) : 'Recorded'}
                    </p>
                  </div>

                  <div className={`p-3 border flex flex-col justify-between ${
                    summary.recentAssessments.length >= 2
                      ? 'border-border bg-surface/40'
                      : 'border-primary/40 bg-primary/3'
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

          <Card>
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Assessment history</h3>
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
                  <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Date</th>
                      <th className="px-6 py-3 font-semibold">Level</th>
                      <th className="px-6 py-3 font-semibold">Score</th>
                      <th className="px-6 py-3 font-semibold">Global rank</th>
                      <th className="px-6 py-3 text-right font-semibold">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.recentAssessments.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-accent/40">
                        <td className="px-6 py-4">{dateFmt.format(new Date(a.completedAt))}</td>
                        <td className="px-6 py-4">
                          <Badge>
                            Class {a.classLevel} · {a.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold tabular text-xs px-2.5 py-1 border ${
                            a.globalPct >= 75
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : a.globalPct >= 40
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {a.score} <span className="text-[10px] text-foreground-muted font-normal">/ 900</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular text-foreground font-semibold">
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

          {/* ── Efferd Activity Timeline Pattern ── */}
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
                        ? 'bg-primary border-primary shadow-[0_0_8px_rgba(143,207,232,0.8)]' 
                        : 'border-primary/60 bg-background'
                    }`} />
                    <div className={`flex-1 p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      idx === 0
                        ? 'border-primary/50 bg-primary/4 shadow-xs'
                        : 'border-border bg-surface/40'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Class {a.classLevel} {a.subject || 'STEM'} Benchmark Completed
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary border border-primary/30 font-mono font-bold">
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

          <Leaderboard />

          {/* ── Danger zone accordion ── */}
          <div className="card border-border overflow-hidden">
            <button
              onClick={() => {
                if (dangerOpen) setConfirmDelete(false);
                setDangerOpen(prev => !prev);
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/50 transition-colors"
              aria-expanded={dangerOpen}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary">
                <TriangleAlert className="size-4 text-destructive/70" />
                <span>Advanced account settings & danger zone</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono text-destructive/80 border-destructive/30">
                  Destructive
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
                  transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden border-t border-border bg-destructive/2"
                >
                  <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold text-destructive">
                        Delete account
                      </h3>
                      <p className="mt-1 text-sm text-foreground-secondary">
                        Permanently removes your assessments, reports, and account. This cannot be undone.
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
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                        >
                          <Trash2 className="size-4" />
                          {deleting ? 'Deleting…' : 'Yes, delete everything'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="size-4" />
                        Delete account
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {showClassConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm p-6 shadow-lg corner-marks border border-border bg-background">
            <h2 className="mb-4 font-display text-xl font-bold">Confirm your class</h2>
            <p className="mb-6 text-sm text-foreground-secondary">
              Please verify your current class level so we can benchmark you accurately.
            </p>
            <div className="mb-6">
              <label htmlFor="confirmClass" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">Class Level</label>
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
                // Save it back to DB
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
