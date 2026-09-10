# AXIOM MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only, offline-first React assessment that persistently projects Classes 3-12 learners onto transparent provisional STEAM competency benchmarks.

**Architecture:** Keep assessment, scoring, and scenario-continuity logic in pure TypeScript modules. Wrap one versioned local session in a React Context backed by a safe localStorage repository, then let the UI render only context actions and immutable result snapshots. Bundle all content and norms locally; no runtime network dependency exists.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, Playwright, Recharts, browser localStorage.

## Global Constraints

- The application has no backend, authentication, database, telemetry, network API, or runtime fetch.
- Persist one versioned local learner session after every profile edit, answer, transition, and completed result snapshot.
- Use exact class-and-competency provisional norms; do not compare classes directly.
- Standardized scores use `clamp(round(480 + 100 * zScore), 100, 900)`.
- Never label a projection as a verified global rank; show `Projected benchmark` and `Provisional reference distribution` on results.
- Scenario state may change only through an item-declared mutation.
- The desktop assessment shell keeps header, mission rail, and bottom action bar fixed relative to its application viewport.
- Use fictional, universally legible environments; never use recognizable regional monuments or real-world buildings.
- Answer timing cannot affect scoring, percentile, or rank.
- Support keyboard navigation, reduced motion, readable dark-mode contrast, and widths down to 320px.

---

### Task 1: Establish the React, test, and offline shell

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

**Interfaces:**
- Produces: a Vite React application mounted at `#root`, with `npm run dev`, `npm run test`, `npm run build`, and `npm run e2e` scripts.
- Produces: `App(): JSX.Element`, initially rendering an AXIOM boot state.

- [ ] **Step 1: Write the failing application shell test**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders the AXIOM boot state', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /AXIOM/i })).toBeInTheDocument();
  expect(screen.getByText(/learning signal/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because the Vite project and `App` module do not exist.

- [ ] **Step 3: Create the minimal Vite, TypeScript, Vitest, and React setup**

Create a React root that renders this reachable initial surface:

```tsx
export default function App() {
  return <main><p>Learning signal</p><h1>AXIOM</h1></main>;
}
```

Configure Vitest with `environment: 'jsdom'`, `src/test/setup.ts`, and Testing Library matchers. Add Vite build configuration and a global slate/cyan reset with `color-scheme: dark`.

- [ ] **Step 4: Run focused and production validation**

Run: `npm test -- --run src/App.test.tsx && npm run build`

Expected: one passing test and a successful Vite production build.

- [ ] **Step 5: Commit the executable shell**

```bash
git add package.json vite.config.ts tsconfig.json index.html src
git commit -m "chore: scaffold AXIOM React application"
```

### Task 2: Implement canonical domain types, norms, and score projections

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/data/norms.ts`
- Create: `src/domain/scoring.ts`
- Create: `src/domain/scoring.test.ts`

**Interfaces:**
- Produces: `type Competency = 'scientificReasoning' | 'quantitativeReasoning' | 'computationalThinking' | 'engineeringDecisions' | 'systemsThinking'`.
- Produces: `getNorm(classLevel: number, competency: Competency): Norm`, `projectScore(rawPercent: number, norm: Norm): Projection`, and `calculateResult(responses, classLevel, norms): ResultSnapshot`.
- Consumes later: `ResultSnapshot` with all five competency projections, `overallScore`, `percentile`, and `normVersion`.

- [ ] **Step 1: Write failing mathematical tests**

```ts
it('maps a class-specific mean to 480 and clamps extreme projections', () => {
  const norm = { mean: 60, standardDeviation: 10 };
  expect(projectScore(60, norm).score).toBe(480);
  expect(projectScore(200, norm).score).toBe(900);
  expect(projectScore(-100, norm).score).toBe(100);
});

it('rejects a missing exact class norm', () => {
  expect(() => getNorm(2, 'systemsThinking')).toThrow(/norm/i);
});
```

- [ ] **Step 2: Run the scoring test to verify it fails**

Run: `npm test -- --run src/domain/scoring.test.ts`

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 3: Define immutable types, 15 class norm sets, and pure calculation functions**

Implement `getNorm` as an exact `classLevel` lookup over every class 3 through 12 and all five competencies. Implement normal-CDF percentile calculation, clamp it to `1..99`, and create `ResultSnapshot` only when every competency has available evidence and a valid norm.

```ts
export function projectScore(rawPercent: number, norm: Norm): Projection {
  const zScore = (rawPercent - norm.mean) / norm.standardDeviation;
  return { zScore, score: clamp(Math.round(480 + 100 * zScore), 100, 900) };
}
```

- [ ] **Step 4: Run scoring tests**

Run: `npm test -- --run src/domain/scoring.test.ts`

Expected: PASS, including raw-weight aggregation, exact norm lookup, rounding, score bounds, percentile bounds, and missing-evidence rejection.

- [ ] **Step 5: Commit the benchmark engine**

```bash
git add src/domain src/data/norms.ts
git commit -m "feat: add provisional competency benchmark engine"
```

### Task 3: Build immutable scenario content and deterministic assessment selection

**Files:**
- Create: `src/data/scenarios.ts`
- Create: `src/domain/continuity.ts`
- Create: `src/domain/assessment.ts`
- Create: `src/domain/assessment.test.ts`

**Interfaces:**
- Produces: `createAssessment(classLevel: number, calibrationAnswers: Answer[]): AssessmentPlan` and `getNextItem(plan: AssessmentPlan, session: AxiomSession): AssessmentItem | null`.
- Produces: `applyScenarioMutation(state: ScenarioState, mutation?: ScenarioMutation): ScenarioState`.
- Consumes: `Competency`, `EvidenceContribution`, `AxiomSession`, and `AssessmentPlan` types from `src/domain/types.ts`.

- [ ] **Step 1: Write failing deterministic-path and continuity tests**

```ts
it('chooses the same three missions for identical class and calibration evidence', () => {
  expect(createAssessment(8, answers)).toEqual(createAssessment(8, answers));
});

it('preserves unmentioned state attributes and rejects unknown mutation keys', () => {
  expect(applyScenarioMutation({ capacity: 5, routes: 6 }, { capacity: 4 })).toEqual({ capacity: 4, routes: 6 });
  expect(() => applyScenarioMutation({ capacity: 5 }, { landmark: 'x' } as never)).toThrow(/mutation/i);
});
```

- [ ] **Step 2: Run the assessment test to verify it fails**

Run: `npm test -- --run src/domain/assessment.test.ts`

Expected: FAIL because catalog and assessment modules do not exist.

- [ ] **Step 3: Create catalog data and deterministic planner**

Create content for calibration plus one band-appropriate version of each mission framework: city mobility, water resilience, food and habitat, digital safety, and orbital research. Each item must include a stable ID, developmental band, prompt, options, rubric evidence, scenario-state contract, and optional declared mutation. Use a seeded deterministic selector to choose three non-repeating missions from class and calibration responses.

- [ ] **Step 4: Run assessment tests**

Run: `npm test -- --run src/domain/assessment.test.ts`

Expected: PASS, including different deterministic path for materially different calibration evidence, no repeated mission, class-band validity, and illegal mutation rejection.

- [ ] **Step 5: Commit the assessment engine**

```bash
git add src/data/scenarios.ts src/domain/continuity.ts src/domain/assessment.ts src/domain/assessment.test.ts
git commit -m "feat: add deterministic systems-thinking missions"
```

### Task 4: Add versioned storage and session-state reducer

**Files:**
- Create: `src/persistence/storage.ts`
- Create: `src/persistence/storage.test.ts`
- Create: `src/domain/session.ts`
- Create: `src/domain/session.test.ts`

**Interfaces:**
- Produces: `const SESSION_KEY = 'axiom.session.v1'`, `loadSession(storage): LoadResult`, `saveSession(session, storage): PersistenceStatus`, and `resetSession(storage): void`.
- Produces: `createSession()`, `sessionReducer(session, action)`, and `CURRENT_SESSION_VERSION`.
- Consumes later: reducer actions `setProfile`, `answerItem`, `advance`, `complete`, and `reset`.

- [ ] **Step 1: Write failing persistence and recovery tests**

```ts
it('hydrates a valid session and migrates version 0 records', () => {
  storage.setItem(SESSION_KEY, JSON.stringify(v0Session));
  expect(loadSession(storage).session?.version).toBe(1);
});

it('removes corrupt session JSON and returns a recoverable empty state', () => {
  storage.setItem(SESSION_KEY, '{invalid');
  expect(loadSession(storage).recovered).toBe(true);
  expect(storage.getItem(SESSION_KEY)).toBeNull();
});
```

- [ ] **Step 2: Run the storage tests to verify they fail**

Run: `npm test -- --run src/persistence/storage.test.ts src/domain/session.test.ts`

Expected: FAIL because storage and session modules do not exist.

- [ ] **Step 3: Implement guarded serialization, migration, and pure session transitions**

Validate parsed data with type guards before return. Catch unavailable localStorage writes and return `{ state: 'unavailable' }` without discarding in-memory progress. For corrupt data, remove only `SESSION_KEY` and create a fresh assessment state while retaining a separately persisted readable profile record.

- [ ] **Step 4: Run storage and reducer tests**

Run: `npm test -- --run src/persistence/storage.test.ts src/domain/session.test.ts`

Expected: PASS, including invalid JSON, wrong shape, migration, unavailable storage, answer replacement, immutable state, and reset.

- [ ] **Step 5: Commit persistent domain state**

```bash
git add src/persistence src/domain/session.ts src/domain/session.test.ts
git commit -m "feat: add resilient local assessment persistence"
```

### Task 5: Expose the session through a React Context and local-storage hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/context/AxiomSessionContext.tsx`
- Create: `src/context/AxiomSessionContext.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `useAxiomSession(): AxiomSessionContextValue` with `session`, `persistenceStatus`, `setProfile`, `answer`, `advance`, `complete`, `startNew`, and `eraseLocalData`.
- Consumes: storage functions and reducer actions from Task 4; result calculation from Task 2; assessment planner from Task 3.

- [ ] **Step 1: Write the failing provider hydration and write-through test**

```tsx
it('hydrates a saved answer and persists a replacement answer', async () => {
  render(<AxiomSessionProvider><Harness /></AxiomSessionProvider>);
  expect(screen.getByText(/saved answer: route-flex/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /choose reserve/i }));
  expect(JSON.parse(localStorage.getItem(SESSION_KEY)!)).toMatchObject({ responses: expect.any(Object) });
});
```

- [ ] **Step 2: Run the provider test to verify it fails**

Run: `npm test -- --run src/context/AxiomSessionContext.test.tsx`

Expected: FAIL because the hook and context do not exist.

- [ ] **Step 3: Implement context as the only mutable UI boundary**

Use one reducer-owned session. Persist through `useLocalStorage` after reducer state changes, expose an explicit persistence status, and provide strict context-hook misuse errors. Wrap `<App />` with `<AxiomSessionProvider>` in `main.tsx`.

- [ ] **Step 4: Run provider tests**

Run: `npm test -- --run src/context/AxiomSessionContext.test.tsx`

Expected: PASS for startup hydration, response write-through, visible unavailable-storage state, and clean reset.

- [ ] **Step 5: Commit the UI state boundary**

```bash
git add src/hooks src/context src/main.tsx
git commit -m "feat: provide persistent AXIOM session context"
```

### Task 6: Build onboarding and the locked assessment experience

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/components/Onboarding.tsx`
- Create: `src/components/Assessment.tsx`
- Create: `src/components/SaveStatus.tsx`
- Create: `src/components/Assessment.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `useAxiomSession()` and pure catalog items.
- Produces: accessible onboarding, assessment route states, `data-testid="assessment-shell"`, and stable `header`, `aside`, and action `footer` regions.

- [ ] **Step 1: Write failing learner-flow tests**

```tsx
it('collects a class and locks a selected response into the assessment shell', async () => {
  render(<App />);
  await userEvent.selectOptions(screen.getByLabelText(/class/i), '8');
  await userEvent.click(screen.getByRole('button', { name: /begin calibration/i }));
  await userEvent.click(screen.getByRole('button', { name: /redirect flexible routes/i }));
  expect(screen.getByRole('button', { name: /lock response/i })).toBeEnabled();
  expect(screen.getByTestId('assessment-shell')).toHaveClass('assessment-shell');
});
```

- [ ] **Step 2: Run the UI flow test to verify it fails**

Run: `npm test -- --run src/components/Assessment.test.tsx`

Expected: FAIL because onboarding and assessment components do not exist.

- [ ] **Step 3: Implement the cinematic locked shell**

Build native-label onboarding for learner name and class 3-12. Render a stable AXIOM header, desktop mission rail, central prompt/choices, and bottom action bar. Use CSS grid and `position: sticky` only inside the app shell so primary controls remain visible without introducing document scroll jumps. Save status must state `Saved locally`, `Saving locally`, or `Local save unavailable` in text. Do not display real landmarks or speed-based feedback.

- [ ] **Step 4: Run learner-flow tests**

Run: `npm test -- --run src/components/Assessment.test.tsx`

Expected: PASS for onboarding, keyboard-focusable choices, answer replacement, action enablement, mission orientation, and save status.

- [ ] **Step 5: Commit the learner experience**

```bash
git add src/components src/App.tsx src/styles/global.css
git commit -m "feat: build locked offline assessment experience"
```

### Task 7: Build the evidence-led result dashboard and reset controls

**Files:**
- Create: `src/components/Dashboard.tsx`
- Create: `src/components/CompetencyChart.tsx`
- Create: `src/components/ResetDialog.tsx`
- Create: `src/components/Dashboard.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: completed `ResultSnapshot`, evidence records, and `eraseLocalData()` from Task 5.
- Produces: exact competency chart, provisional benchmark disclosure, evidence ledger, lowest-signal recommendation, and confirmed local reset.

- [ ] **Step 1: Write failing dashboard and reset tests**

```tsx
it('renders the projected-benchmark disclosure and exact evidence ledger', () => {
  render(<Dashboard snapshot={completedSnapshot} />);
  expect(screen.getByText(/projected benchmark/i)).toBeInTheDocument();
  expect(screen.getByText(/provisional reference distribution/i)).toBeInTheDocument();
  expect(screen.getByText(/redirect flexible routes/i)).toBeInTheDocument();
});

it('requires confirmation before erasing local progress', async () => {
  render(<ResetDialog onConfirm={onConfirm} />);
  await userEvent.click(screen.getByRole('button', { name: /erase local data/i }));
  expect(onConfirm).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: /confirm erase/i }));
  expect(onConfirm).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run the dashboard test to verify it fails**

Run: `npm test -- --run src/components/Dashboard.test.tsx`

Expected: FAIL because dashboard components do not exist.

- [ ] **Step 3: Implement an evidence console using Recharts**

Render the overall score, class-level norm, percentile, and required projection disclosure above an accessible five-value Recharts radar or bar chart. Provide text equivalents for all values. Render an evidence table with mission, decision, and competency contribution. Make the growth recommendation deterministic from the lowest projected competency. Use a native `<dialog>` or accessible modal confirmation for reset; it must not reset on its first activation.

- [ ] **Step 4: Run dashboard tests**

Run: `npm test -- --run src/components/Dashboard.test.tsx`

Expected: PASS for labels, exact values, evidence table, growth signal, responsive chart container, and two-step data erasure.

- [ ] **Step 5: Commit the dashboard**

```bash
git add src/components/Dashboard.tsx src/components/CompetencyChart.tsx src/components/ResetDialog.tsx src/components/Dashboard.test.tsx src/App.tsx src/styles/global.css
git commit -m "feat: add evidence-led projected benchmark dashboard"
```

### Task 8: Verify offline recovery, browser flow, accessibility, and release output

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/assessment.spec.ts`
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: the complete local app via `npm run dev -- --host 127.0.0.1`.
- Produces: browser proof that a selected answer remains after reload, a completed projection, and confirmation-gated reset.

- [ ] **Step 1: Write the failing end-to-end resume journey**

```ts
test('keeps assessment progress after browser refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel(/class/i).selectOption('8');
  await page.getByRole('button', { name: /begin calibration/i }).click();
  await page.getByRole('button', { name: /redirect flexible routes/i }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /redirect flexible routes/i })).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run the browser test to verify the initial behavior**

Run: `npm run e2e -- --project=chromium`

Expected: initially FAIL until the full learner flow and persistence are wired; after Tasks 1-7 it must pass.

- [ ] **Step 3: Add release documentation and accessibility metadata**

Document the local setup, offline boundary, provisional benchmark limitation, test commands, and local reset behavior in `README.md`. Add Playwright scripts and configuration. Ensure every input has an associated label, every chart has an accessible summary, focus states remain visible, and `prefers-reduced-motion` disables non-essential transitions.

- [ ] **Step 4: Run full verification**

Run: `npm test -- --run && npm run build && npm run e2e -- --project=chromium`

Expected: all unit/component tests, production build, and end-to-end refresh/resume test pass.

- [ ] **Step 5: Commit verified MVP**

```bash
git add playwright.config.ts e2e/ README.md package.json
git commit -m "test: verify AXIOM offline assessment journey"
```
