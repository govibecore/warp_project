import { useState } from 'react';
import { useQuery } from 'convex/react';
// @ts-ignore — generated at `convex dev`
import { api } from '../../../convex/_generated/api';
import { Select } from '../ui/input';
import { Card, EmptyState } from '../ui/card';
import { SpinnerBlock } from '../ui/spinner';

const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

/**
 * Names are masked server-side (first name + last initial). The signed-in
 * learner's own row is marked instead of named — no child's full name is ever
 * published to a public endpoint.
 */
export function Leaderboard() {
  const [difficulty, setDifficulty] = useState('');

  const rows = useQuery(api.leaderboard.getTopScores, {
    difficulty: (difficulty || undefined) as (typeof DIFFICULTIES)[number] | undefined,
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h3 className="font-display text-lg font-bold">Global leaderboard</h3>
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
                    'transition-colors hover:bg-accent/40 ' +
                    (entry.isCurrentUser ? 'bg-primary-subtle' : '')
                  }
                >
                  <td className="px-6 py-4 text-center">
                    <span
                      className={
                        'inline-flex size-6 items-center justify-center text-xs font-bold tabular ' +
                        (i < 3
                          ? 'bg-primary-subtle text-primary'
                          : 'text-foreground-secondary')
                      }
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {entry.studentName}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono tabular text-foreground-secondary">
                    {entry.classLevel}
                  </td>
                  <td className="px-6 py-4 text-xs text-foreground-secondary">
                    {entry.difficulty}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold tabular">
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
