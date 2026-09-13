import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Select, Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, EmptyState } from '../ui/card';

const PAGE_SIZE = 20;
const DIFFICULTIES = [
  { label: 'Standard', value: 'standard' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Olympiad', value: 'olympiad' },
] as const;

const COMPETENCIES = [
  { label: 'Scientific Inquiry', value: 'scientificInquiry' },
  { label: 'Computational Thinking', value: 'computationalThinking' },
  { label: 'Engineering Design', value: 'engineeringDesign' },
  { label: 'Mathematical Reasoning', value: 'mathematicalReasoning' },
  { label: 'Systems Thinking', value: 'systemsThinking' },
] as const;

const REGIONS = ['Global', 'Singapore', 'China', 'USA', 'Europe', 'India'] as const;

const REGION_FLAGS: Record<string, string> = {
  Global: '🌐',
  Singapore: '🇸🇬',
  China: '🇨🇳',
  USA: '🇺🇸',
  Europe: '🇪🇺',
  India: '🇮🇳',
};

type ContentTab = 'scenarios' | 'norms';

const DIFFICULTY_TONE = {
  standard: 'neutral',
  advanced: 'primary',
  olympiad: 'warning',
} as const;

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentTab>('scenarios');
  const [classFilter, setClassFilter] = useState<number | undefined>();
  const [diffFilter, setDiffFilter] = useState('');
  const [compFilter, setCompFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenarioStatus, setScenarioStatus] = useState<'LoadingFirstPage' | 'CanLoadMore' | 'Exhausted'>('LoadingFirstPage');
  const [scenarioPage, setScenarioPage] = useState(0);

  const [norms, setNorms] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    async function fetchScenarios(isInitial: boolean) {
      if (activeTab !== 'scenarios') return;

      if (isInitial) setScenarioStatus('LoadingFirstPage');

      let query = supabase.from('scenarios').select('*').order('class_level', { ascending: true }).order('created_at', { ascending: false });
      
      if (classFilter !== undefined) {
        query = query.eq('class_level', classFilter);
      }
      if (diffFilter) {
        query = query.eq('difficulty', diffFilter);
      }
      if (compFilter) {
        query = query.eq('competency', compFilter);
      }
      if (searchTerm.trim()) {
        query = query.ilike('prompt', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query.range(
        isInitial ? 0 : scenarioPage * PAGE_SIZE,
        isInitial ? PAGE_SIZE - 1 : (scenarioPage + 1) * PAGE_SIZE - 1
      );

      if (error || !data) {
        console.error('Failed to fetch scenarios:', error);
        if (isInitial) setScenarios([]);
        setScenarioStatus('Exhausted');
        return;
      }

      setScenarios(prev => isInitial ? data : [...prev, ...data]);
      setScenarioStatus(data.length === PAGE_SIZE ? 'CanLoadMore' : 'Exhausted');
    }

    fetchScenarios(scenarioPage === 0);
  }, [activeTab, classFilter, diffFilter, compFilter, searchTerm, scenarioPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setScenarioPage(0);
  }, [classFilter, diffFilter, compFilter, searchTerm, activeTab]);

  const loadMore = () => setScenarioPage(p => p + 1);

  useEffect(() => {
    async function fetchNorms() {
      if (activeTab !== 'norms') return;
      let query = supabase.from('norms').select('*').order('class_level', { ascending: true }).order('region', { ascending: true });
      if (regionFilter) {
        query = query.eq('region', regionFilter.toLowerCase());
      }
      if (classFilter !== undefined) {
        query = query.eq('class_level', classFilter);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Failed to load norms:', error);
        setNorms([]);
      } else {
        setNorms(data || []);
      }
    }
    fetchNorms();
  }, [activeTab, regionFilter, classFilter]);

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
                ? 'bg-background text-foreground shadow-xs'
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
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompt..."
              className="max-w-xs"
              aria-label="Search scenarios"
            />

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
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>

            <Select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              compact
              aria-label="Filter by competency"
            >
              <option value="">All competencies</option>
              {COMPETENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
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
                hint="Try broadening your filters or clearing search terms."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Code</th>
                      <th className="px-6 py-3 font-semibold">Competency</th>
                      <th className="px-6 py-3 font-semibold">Benchmark</th>
                      <th className="px-6 py-3 font-semibold">Class</th>
                      <th className="px-6 py-3 font-semibold">Difficulty</th>
                      <th className="px-6 py-3 font-semibold">Prompt</th>
                      <th className="px-6 py-3 font-semibold">IRT (a, b)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scenarios.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-accent/40">
                        <td className="px-6 py-3 font-mono text-xs text-primary font-semibold whitespace-nowrap">
                          {s.scenario_code}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-foreground">
                            {s.competency}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-foreground-secondary">
                            {s.international_benchmark || 'General STEM'}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono tabular whitespace-nowrap">Class {s.class_level}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <Badge tone={DIFFICULTY_TONE[s.difficulty as keyof typeof DIFFICULTY_TONE] ?? 'neutral'}>
                            {s.difficulty}
                          </Badge>
                        </td>
                        <td className="max-w-md truncate px-6 py-3 text-xs text-foreground-secondary" title={s.prompt}>
                          {s.prompt}
                        </td>
                        <td className="px-6 py-3 font-mono text-[11px] text-foreground-muted whitespace-nowrap">
                          {s.irt_a != null && s.irt_b != null ? `a:${s.irt_a.toFixed(1)}, b:${s.irt_b.toFixed(1)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {scenarioStatus === 'CanLoadMore' && (
              <div className="flex justify-center border-t border-border p-4">
                <Button variant="secondary" size="sm" onClick={() => loadMore()}>
                  Load more
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'norms' && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              compact
              aria-label="Filter by region"
            >
              <option value="">All regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {REGION_FLAGS[r] || ''} {r}
                </option>
              ))}
            </Select>

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
          </div>

          <Card>
            {norms === undefined ? (
              <div className="flex justify-center py-16">
                <span className="spinner-square size-8" />
              </div>
            ) : norms.length === 0 ? (
              <EmptyState
                title="No norms found"
                hint="No normative records matched your filter criteria."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-foreground-secondary">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Region</th>
                      <th className="px-6 py-3 font-semibold">Class</th>
                      <th className="px-6 py-3 font-semibold">Competency</th>
                      <th className="px-6 py-3 font-semibold">Difficulty</th>
                      <th className="px-6 py-3 font-semibold">Mean (μ)</th>
                      <th className="px-6 py-3 font-semibold">Std Dev (σ)</th>
                      <th className="px-6 py-3 font-semibold">Sample (N)</th>
                      <th className="px-6 py-3 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {norms.map((n, idx) => {
                      const regionCapitalized = n.region ? n.region.charAt(0).toUpperCase() + n.region.slice(1) : 'Global';
                      const flag = REGION_FLAGS[regionCapitalized] || '🌐';
                      return (
                        <tr key={n.id || idx} className="transition-colors hover:bg-accent/40">
                          <td className="px-6 py-3 font-medium whitespace-nowrap">
                            <span className="mr-1.5">{flag}</span>
                            <span>{regionCapitalized}</span>
                          </td>
                          <td className="px-6 py-3 font-mono tabular whitespace-nowrap">Class {n.class_level}</td>
                          <td className="px-6 py-3 text-xs text-foreground whitespace-nowrap">{n.competency}</td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <Badge tone={DIFFICULTY_TONE[n.difficulty as keyof typeof DIFFICULTY_TONE] ?? 'neutral'}>
                              {n.difficulty}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 font-mono tabular font-semibold text-foreground">
                            {n.mean != null ? Number(n.mean).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-3 font-mono tabular text-foreground-secondary">
                            {n.std_dev != null ? Number(n.std_dev).toFixed(2) : '1.00'}
                          </td>
                          <td className="px-6 py-3 font-mono tabular text-foreground-secondary">
                            {n.sample_size ? Number(n.sample_size).toLocaleString() : '—'}
                          </td>
                          <td className="px-6 py-3 text-xs text-foreground-muted truncate max-w-xs">
                            {n.source || 'PISA 2022 / TIMSS 2023'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
