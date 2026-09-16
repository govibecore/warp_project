import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { Select } from '../ui/input';
import { Card, EmptyState } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';

const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

interface LeaderboardRow {
  id: string;
  studentName: string;
  classLevel: number;
  difficulty: string;
  overallScore: number;
  isCurrentUser: boolean;
}

export function Leaderboard() {
  const [difficulty, setDifficulty] = useState('');
  const [rows, setRows] = useState<LeaderboardRow[] | undefined>(undefined);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    async function fetchLeaderboard() {
      let query = supabase
        .from('assessments')
        .select(`
          id,
          class_level,
          difficulty,
          global_score,
          students!inner (
            id,
            full_name
          )
        `)
        .eq('status', 'completed')
        .order('global_score', { ascending: false })
        .limit(50);
      
      if (difficulty) {
        query = query.ilike('difficulty', difficulty);
      }

      const { data, error } = await query;
      
      if (error || !data) {
        console.error('Failed to load leaderboard', error);
        setRows([]);
        return;
      }

      // Group by learner so each student appears only once at their peak score
      const studentMap = new Map<string, LeaderboardRow>();
      for (const a of data) {
        if (typeof a.global_score !== 'number' || a.global_score <= 0) continue;
        const s = Array.isArray(a.students) ? a.students[0] : a.students;
        const parts = s?.full_name?.split(' ') || ['Learner'];
        const studentName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        const studentId = s?.id || studentName;
        const score = a.global_score ?? 0;
        const existing = studentMap.get(studentId);

        if (!existing || score > existing.overallScore) {
          studentMap.set(studentId, {
            id: a.id,
            studentName,
            classLevel: a.class_level,
            difficulty: a.difficulty,
            overallScore: score,
            isCurrentUser: s?.id === user?.id,
          });
        }
      }

      const deduplicated = Array.from(studentMap.values())
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 50);

      setRows(deduplicated);
    }
    
    fetchLeaderboard();
  }, [difficulty, user]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">Global leaderboard</h3>
          <p className="text-xs text-foreground-secondary mt-0.5">Top calibrated percentile rankings by unique candidate</p>
        </div>
        <Select
          compact
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-44"
          aria-label="Filter leaderboard by difficulty"
        >
          <option value="">All tiers</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      {rows === undefined ? (
        <SpinnerBlock label="Loading leaderboard" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No scores yet"
          hint="Complete an assessment to appear on the board."
        />
      ) : (
        <div className="max-h-100 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
              <tr>
                <th className="w-16 px-6 py-3 text-center font-semibold">Rank</th>
                <th className="px-6 py-3 font-semibold">Learner</th>
                <th className="px-6 py-3 font-semibold">Class</th>
                <th className="px-6 py-3 font-semibold">Tier</th>
                <th className="px-6 py-3 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={
                    'transition-colors hover:bg-surface/60 ' +
                    (entry.isCurrentUser ? 'bg-primary/5 font-medium' : '')
                  }
                >
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={
                        'inline-flex size-6 items-center justify-center text-xs font-mono font-bold tabular ' +
                        (i === 0
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : i < 3
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'text-foreground-secondary')
                      }
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-medium">
                    <span className="text-foreground">{entry.studentName}</span>
                    {entry.isCurrentUser && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-mono tabular text-foreground-secondary">
                    Class {entry.classLevel}
                  </td>
                  <td className="px-6 py-3.5 text-xs font-mono text-foreground-secondary">
                    {entry.difficulty}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-bold tabular text-foreground">
                    {entry.overallScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
