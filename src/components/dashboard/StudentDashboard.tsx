import { useEffect, useState } from 'react';
import { TriangleAlert, Plus, LogOut, Trophy, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAxiomSession } from '../../context/AxiomSessionContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { supabase } from '../../lib/supabase';
import { Leaderboard } from './Leaderboard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';

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
}

const EMPTY_SUMMARY = {
  latestScore: null as number | null,
  scoreDelta: null as number | null,
  bestGlobalPct: 0,
  totalAssessments: 0,
  recentAssessments: [] as HistoryRow[],
};

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card corner-marks relative px-6 py-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground-secondary">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-3">{children}</div>
    </div>
  );
}

export function StudentDashboard() {
  const { isGuest } = useAuthStore();
  const { user } = useSupabaseAuth();
  const { eraseLocalData } = useAxiomSession();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  useEffect(() => {
    if (isGuest || !user?.id) {
      setIsLoading(false);
      return;
    }

    async function fetchSummary() {
      // Get internal user id mapped from auth.users
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user!.id)
        .single();
      
      if (!userData) {
        setIsLoading(false);
        return;
      }

      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (assessments && assessments.length > 0) {
        const totalAssessments = assessments.length;
        const recentAssessments = assessments.map(a => ({
          id: a.id,
          completedAt: a.completed_at,
          classLevel: a.class_level,
          difficulty: a.difficulty,
          score: a.result?.overallScore || 0,
          globalPct: a.result?.regionalPercentiles?.['Global'] || 0,
        }));

        const latestScore = recentAssessments[0].score;
        const scoreDelta = recentAssessments.length > 1 ? latestScore - recentAssessments[1].score : null;
        const bestGlobalPct = Math.max(...recentAssessments.map(a => a.globalPct));

        setSummary({
          latestScore,
          scoreDelta,
          bestGlobalPct,
          totalAssessments,
          recentAssessments,
        });
      }
      setIsLoading(false);
    }
    fetchSummary();
  }, [user, isGuest]);

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
      const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
      if (userData) {
        await supabase.from('users').delete().eq('id', userData.id);
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
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {user?.email?.split('@')[0] ?? 'Learner'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => (window.location.href = '/')}>
            <Plus className="size-4" />
            New assessment
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </header>

      {isLoading ? (
        <SpinnerBlock label="Loading your dashboard" />
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Latest score">
              <span className="font-mono text-4xl font-bold tabular">
                {summary.latestScore ?? '—'}
              </span>
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
            </Stat>

            <Stat label="Best global rank">
              <span className="font-mono text-4xl font-bold tabular">
                {summary.bestGlobalPct > 0 ? ordinal(summary.bestGlobalPct) : '—'}
              </span>
              <Trophy className="size-4 text-foreground-muted" aria-hidden="true" />
            </Stat>

            <Stat label="Assessments taken">
              <span className="font-mono text-4xl font-bold tabular">
                {summary.totalAssessments}
              </span>
            </Stat>
          </div>

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
    </main>
  );
}
