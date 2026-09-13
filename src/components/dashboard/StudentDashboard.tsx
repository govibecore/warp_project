import { useEffect, useState } from 'react';
import { TriangleAlert, Plus, LogOut, Trophy, ArrowUpRight, ArrowDownRight, Trash2, TrendingUp, Brain } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import { useWarpSession } from '../../context/WarpSessionContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';
import { Leaderboard } from './Leaderboard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';
import { CounterNumber } from '../ui/aliimam/CounterNumber';
import { BorderGlow } from '../ui/aliimam/BorderGlow';
import { Gauge } from '../ui/aliimam/Gauge';
import { OutcomeBadge } from '../ui/OutcomeBadge';
import { computeInternationalBenchmark, COMPETENCY_LABELS, STEM_COMPETENCIES, ENGLISH_COMPETENCIES } from '../../lib/irt/globalBenchmark';

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
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
};

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <BorderGlow className="h-full">
      <div className="corner-marks relative h-full flex flex-col justify-center px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">
          {label}
        </p>
        <div className="mt-2 flex items-center gap-3">{children}</div>
      </div>
    </BorderGlow>
  );
}

export function StudentDashboard() {
  const { isGuest } = useAuthStore();
  const { user, isLoaded } = useSupabaseAuth();
  const { eraseLocalData, setProfile, enterApp } = useWarpSession();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        // Get internal user id mapped from auth.users
        const { data: userData } = await supabase
          .from('students')
          .select('id')
          .eq('id', user!.id)
          .maybeSingle();
        
        const studentId = userData?.id || user!.id;

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
          const latestAbilityTheta = (assessments[0].ability_theta as Record<string, number> | null) || null;
          const latestClassLevel = assessments[0].class_level || 8;
          const latestSubject = (assessments[0] as any).subject || 'STEM';

          setSummary({
            latestScore,
            scoreDelta,
            bestGlobalPct,
            totalAssessments,
            recentAssessments,
            latestAbilityTheta,
            latestClassLevel,
            latestSubject,
          });
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
    eraseLocalData();
    await supabase.auth.signOut();
    window.location.href = '/';
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
      eraseLocalData();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

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
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Student dashboard
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl text-primary drop-shadow-md">
            Welcome back, {user?.email?.split('@')[0] ?? 'Learner'}
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
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="size-4" />
            Log out
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
                <>
                  <Gauge 
                    value={summary.latestScore} 
                    min={100}
                    max={900} 
                    gaugePrimaryColor="var(--primary)" 
                    gaugeSecondaryColor="var(--border)" 
                    className="h-20 w-20"
                  />
                  {summary.scoreDelta !== null && summary.scoreDelta !== 0 && (
                    <span
                      className={
                        'flex items-center gap-0.5 text-xs font-bold ' +
                        (summary.scoreDelta > 0 ? 'text-success' : 'text-destructive')
                      }
                    >
                      {summary.scoreDelta > 0 ? (
                        <ArrowUpRight className="size-3.5" />
                      ) : (
                        <ArrowDownRight className="size-3.5" />
                      )}
                      {Math.abs(summary.scoreDelta)} pts
                    </span>
                  )}
                </>
              ) : (
                <span className="font-mono text-4xl font-bold tabular">—</span>
              )}
            </Stat>

            <Stat label="Best global rank">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-4xl font-bold tabular">
                  {summary.bestGlobalPct > 0 ? ordinal(summary.bestGlobalPct) : '—'}
                </span>
                {summary.bestGlobalPct > 0 && (
                  <OutcomeBadge percentile={summary.bestGlobalPct} size="sm" />
                )}
              </div>
              <Trophy className="size-4 text-foreground-muted" aria-hidden="true" />
            </Stat>

            <Stat label="Assessments taken">
              <CounterNumber 
                value={summary.totalAssessments} 
                className="font-mono text-4xl font-bold tabular" 
              />
            </Stat>
          </div>

          {/* ── Competency Breakdown ── */}
          {summary.latestAbilityTheta && (() => {
            const breakdown = computeInternationalBenchmark(summary.latestAbilityTheta, summary.latestClassLevel, summary.latestSubject);
            const isEnglish = (summary.latestSubject || '').toLowerCase().includes('english');
            const competencyKeys = isEnglish ? ENGLISH_COMPETENCIES : STEM_COMPETENCIES;
            return (
              <Card className="p-6">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <h3 className="font-display text-base font-bold">
                      {isEnglish ? 'English Literacy Competency Breakdown' : 'STEM Competency Breakdown'}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {summary.latestSubject || 'STEM'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {competencyKeys.map(key => {
                    const item = breakdown.competencyBreakdown[key];
                    if (!item) return null;
                    const pct = item.globalPercentile;
                    const barWidth = Math.max(4, pct);
                    return (
                      <div key={key} className="flex flex-col gap-1.5 p-3 rounded-none border border-border bg-surface/50">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-secondary">
                          {COMPETENCY_LABELS[key]}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xl font-bold tabular text-foreground">
                            {item.scaledScore}
                          </span>
                          <span className="text-xs text-foreground-muted">/ 900</span>
                        </div>
                        <div className="h-1.5 w-full rounded-none bg-border overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-none transition-all duration-700"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-foreground-muted">
                          {pct}th percentile globally
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}

          {summary.recentAssessments.length > 0 && (
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  <h3 className="font-display text-base font-bold">Longitudinal Performance Arc</h3>
                </div>
                <span className="text-xs text-foreground-secondary">
                  {summary.recentAssessments.length === 1
                    ? 'Baseline benchmark recorded'
                    : `${summary.recentAssessments.length} checkpoints calibrated`}
                </span>
              </div>

              {summary.recentAssessments.length >= 2 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...summary.recentAssessments].reverse().map((a) => ({
                        date: dateFmt.format(new Date(a.completedAt)),
                        score: a.score,
                        globalPct: a.globalPct,
                        classLevel: a.classLevel,
                      }))}
                      margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
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
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: 'var(--primary)' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
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
            </Card>
          )}

          <Card>
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-display text-lg font-bold">Assessment history</h3>
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
                        <td className="px-6 py-4 font-mono font-bold tabular">{a.score}/900</td>
                        <td className="px-6 py-4 font-mono tabular text-foreground-secondary">
                          {ordinal(a.globalPct)}
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

          <Leaderboard />

          {/* ── Account management ── */}
          <div className="card border-destructive/20 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  Delete account
                </Button>
              )}
            </div>
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
              <select 
                id="confirmClass" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="flex h-10 w-full bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Array.from({ length: 10 }, (_, i) => i + 3).map(l => (
                  <option key={l} value={l}>Class {l}</option>
                ))}
              </select>
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
