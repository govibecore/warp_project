import { useState } from 'react';
import { usePaginatedQuery } from 'convex/react';
// @ts-ignore — generated at `convex dev`
import { api } from '../../../convex/_generated/api';
import { useDebounced } from '../../hooks/useDebounced';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';

const PAGE_SIZE = 20;

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function AdminStudents() {
  const [search, setSearch] = useState('');
  const term = useDebounced(search.trim(), 300);

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.getStudents,
    { search: term || undefined },
    { initialNumItems: PAGE_SIZE },
  );

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          User management
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight">Students</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          {status === 'LoadingFirstPage'
            ? 'Loading…'
            : `${results.length} shown · scroll for more`}
        </p>
      </header>

      <div className="mb-4">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="max-w-sm"
          aria-label="Search students"
        />
      </div>

      <Card>
        {status === 'LoadingFirstPage' ? (
          <div className="flex justify-center py-16">
            <span className="spinner-square size-8" />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title="No students found"
            hint={term ? `Nothing matches “${term}”.` : 'No one has registered yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Class</th>
                  <th className="px-6 py-3 font-semibold">Assessments</th>
                  <th className="px-6 py-3 font-semibold">Last score</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{s.fullName}</p>
                      <p className="text-xs text-foreground-secondary">{s.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {s.currentClass ? (
                        <Badge>Class {s.currentClass}</Badge>
                      ) : (
                        <span className="text-xs text-foreground-muted">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono tabular">{s.assessmentsCount}</td>
                    <td className="px-6 py-4 font-mono tabular">
                      {s.lastScore !== null ? `${s.lastScore}/900` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground-secondary">
                      {dateFmt.format(new Date(s.joinedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {status === 'CanLoadMore' && (
          <div className="flex justify-center border-t border-border p-4">
            <Button variant="secondary" size="sm" onClick={() => loadMore(PAGE_SIZE)}>
              Load more
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
