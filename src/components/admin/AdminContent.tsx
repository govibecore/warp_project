import { useState } from 'react';
import { usePaginatedQuery, useQuery } from 'convex/react';
// @ts-ignore — generated at `convex dev`
import { api } from '../../../convex/_generated/api';
import { Select } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';

const PAGE_SIZE = 20;
const DIFFICULTIES = ['Standard', 'Advanced', 'Olympiad'] as const;

type ContentTab = 'scenarios' | 'norms';

const DIFFICULTY_TONE = {
  Standard: 'neutral',
  Advanced: 'primary',
  Olympiad: 'warning',
} as const;

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentTab>('scenarios');
  const [classFilter, setClassFilter] = useState<number | undefined>();
  const [diffFilter, setDiffFilter] = useState('');

  const {
    results: scenarios,
    status: scenarioStatus,
    loadMore,
  } = usePaginatedQuery(
    api.admin.getScenarios,
    activeTab === 'scenarios'
      ? {
          classLevel: classFilter,
          difficulty: diffFilter || undefined,
        }
      : 'skip',
    { initialNumItems: PAGE_SIZE },
  );

  const norms = useQuery(api.admin.getNorms, activeTab === 'norms' ? {} : 'skip');

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Content management
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Question bank &amp; norms
        </h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Manage assessment scenarios and statistical norm data
        </p>
      </header>

      <div className="mb-6 inline-flex gap-1 border border-border bg-surface p-1">
        {(['scenarios', 'norms'] as ContentTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              'px-4 py-1.5 text-sm font-medium capitalize transition-colors ' +
              (activeTab === tab
                ? 'bg-background text-foreground'
                : 'text-foreground-secondary hover:text-foreground')
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'scenarios' && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select
              value={classFilter ?? ''}
              onChange={(e) => setClassFilter(e.target.value ? Number(e.target.value) : undefined)}
              compact
              aria-label="Filter by class"
            >
              <option value="">All classes</option>
              {Array.from({ length: 10 }, (_, i) => i + 3).map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </Select>

            <Select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              compact
              aria-label="Filter by difficulty"
            >
              <option value="">All difficulties</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>

          <Card>
            {scenarioStatus === 'LoadingFirstPage' ? (
              <div className="flex justify-center py-16">
                <span className="spinner-square size-8" />
              </div>
            ) : scenarios.length === 0 ? (
              <EmptyState
                title="No scenarios found"
                hint="Seed the question bank with `pnpm seed`."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Scenario</th>
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold">Class</th>
                      <th className="px-6 py-3 font-semibold">Difficulty</th>
                      <th className="px-6 py-3 font-semibold">Question</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scenarios.map((s) => (
                      <tr key={s._id} className="transition-colors hover:bg-accent/40">
                        <td className="px-6 py-3 font-mono text-xs text-foreground-secondary">
                          {s.scenarioId}
                        </td>
                        <td className="px-6 py-3">
                          <Badge tone={s.type === 'calibration' ? 'primary' : 'neutral'}>
                            {s.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 font-mono tabular">{s.classLevel}</td>
                        <td className="px-6 py-3">
                          <Badge tone={DIFFICULTY_TONE[s.difficulty as keyof typeof DIFFICULTY_TONE] ?? 'neutral'}>
                            {s.difficulty}
                          </Badge>
                        </td>
                        <td className="max-w-xs truncate px-6 py-3 text-xs text-foreground-secondary">
                          {s.question}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {scenarioStatus === 'CanLoadMore' && (
              <div className="flex justify-center border-t border-border p-4">
                <Button variant="secondary" size="sm" onClick={() => loadMore(PAGE_SIZE)}>
                  Load more
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'norms' && (
        <Card>
          {norms === undefined ? (
            <div className="flex justify-center py-16">
              <span className="spinner-square size-8" />
            </div>
          ) : norms.norms.length === 0 ? (
            <EmptyState
              title="No norms seeded yet"
              hint="Run `pnpm seed` to populate class and difficulty norms."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Class</th>
                    <th className="px-6 py-3 font-semibold">Difficulty</th>
                    <th className="px-6 py-3 font-semibold">Mean</th>
                    <th className="px-6 py-3 font-semibold">Std dev</th>
                    <th className="px-6 py-3 font-semibold">Developing &lt;</th>
                    <th className="px-6 py-3 font-semibold">Proficient ≥</th>
                    <th className="px-6 py-3 font-semibold">Advanced ≥</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {norms.norms.map((n) => (
                    <tr key={n._id} className="transition-colors hover:bg-accent/40">
                      <td className="px-6 py-3 font-medium">Class {n.classLevel}</td>
                      <td className="px-6 py-3">
                        <Badge tone={DIFFICULTY_TONE[n.difficulty as keyof typeof DIFFICULTY_TONE] ?? 'neutral'}>
                          {n.difficulty}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-mono tabular">{n.mean}</td>
                      <td className="px-6 py-3 font-mono tabular text-foreground-secondary">
                        {n.stdDev}
                      </td>
                      <td className="px-6 py-3 font-mono tabular text-foreground-secondary">
                        {n.competencyThresholds.developing}
                      </td>
                      <td className="px-6 py-3 font-mono tabular">
                        {n.competencyThresholds.proficient}
                      </td>
                      <td className="px-6 py-3 font-mono tabular">
                        {n.competencyThresholds.advanced}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
