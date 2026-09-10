# AXIOM — Comprehensive Codebase, UI/UX & AI-Bloat Audit

**Audit date:** 2026-09-08
**Auditor:** WorkBuddy AI
**Method:** static analysis, dependency-graph dead-code tracing, typecheck (`tsc -p tsconfig.app.json --noEmit`), token-map verification, and cross-checking UI copy against source data.

---

## 0. Critical scope note — read first

**The checked-out branch (`main`) at `C:\axion` contains no application code at all.** It holds only `PRODUCT.md`, `skills-lock.json`, and `docs/`. The real application lives in a git worktree:

| Path | Branch | State |
|---|---|---|
| `C:\axion` | `main` | No `src/` — docs only |
| `C:\axion\.worktrees\axiom-mvp` | `feat/ui-redesign-desktop` | **The real codebase, heavily modified but UNCOMMITTED** |

The worktree has ~20 modified and 2 deleted files relative to its own branch tip (`25ccd76`, 2026-08-14) — i.e. **the newest architecture has never been committed.** Two older branches (`feat/axiom-mvp`, `feat/ui-redesign`) are stale forks with 32 src files each vs. 36 on the current branch.

All findings below are relative to `C:\axion\.worktrees\axiom-mvp`.

**Severity scale:** Critical = data/security breach or app-breaking · Major = significant defect or large debt · Minor = polish/consistency.

---

## 1. Code quality issues

### 1.1 CRITICAL — Hardcoded admin credentials in client bundle
**File:** `src/components/admin/AdminLogin.tsx`, lines 18–24

```ts
if (email === 'admin@axiom.com' && password === 'admin') {
  setAdmin({ id: 'admin-1', email, fullName: 'Axiom Admin', role: 'super_admin' }, 'mock-token');
```

- **Root cause:** Placeholder auth never replaced; auth is decided entirely in the browser.
- **Impact:** The admin portal gates access to all student PII (name, email, class, scores) and the full question bank. Anyone can bypass it by opening devtools and writing `localStorage['axiom-admin-auth'] = {"state":{"isAdminAuthenticated":true,...}}` — no server call required. The credentials are also plainly visible in the shipped JS bundle.
- **Remediation:** Delete client-side auth. Add a `role` check server-side in Convex (the `users` table already has a `role` field, currently hard-coded to `'student'` in `convex/users.ts:60`). Gate every admin query on `identity` + `role === 'admin'`. Move credentials out of the bundle entirely.

### 1.2 CRITICAL — Live secret key in a file that is NOT gitignored
**File:** `C:\axion\.env.local` (repo root)

```
SUPABASE_SECRET_KEY=sb_secret_REDACTED
SUPABASE_JWKS_URL=https://lbmouytfmekpllngxkql.supabase.co/auth/v1/.well-known/jwks.json
```

- **Root cause:** Root `.gitignore` lists only `.superpowers/`, `.worktrees/`, `node_modules/`, `dist/`, `coverage/`, `.vite/` — **no `.env*` rule.** `git check-ignore` confirms the file is *not* ignored. The worktree has its own `.gitignore` that *does* ignore `.env.local` (line 17), so the protection exists in one place and is missing in the other.
- **Impact:** A `git add .` at the root commits a live `sb_secret_` key. It has not been committed yet, but there is nothing preventing it.
- **Remediation:** Add `.env*` and `!.env.example` to the root `.gitignore` **immediately**. Rotate the Supabase secret and JWKS credentials — treat them as compromised since they have been sitting unprotected on disk. Also delete these vars outright: Supabase is not in `package.json` and appears nowhere in the code; the stack is Convex + Clerk. This is dead config carrying a live secret.

### 1.3 CRITICAL — All admin/analytics Convex queries are public and unauthenticated
**File:** `convex/admin.ts` — `getStats` (5–47), `getChartData` (49–71), `getStudents` (73–116), `getScenarios` (118–139), `getNorms` (141–147)

```ts
// convex/admin.ts:8
// Admin check could be here (e.g., checking user role)
```

- **Root cause:** Every handler is a plain `query` with `handler: async (ctx: any)`. The file also suppresses type checking with `// @ts-ignore` at line 2. `getStudents` returns `fullName`, `email`, `currentClass`, and scores for every user; `getScenarios`/`getNorms` return the entire assessment item bank.
- **Impact:** Any unauthenticated caller can invoke these functions and download the complete student database and the full question bank — which for an assessment product is the crown-jewel asset. `assessments.ts` (lines 43–45) *does* implement ownership checks, so the codebase already knows the correct pattern; `admin.ts` simply omits it.
- **Remediation:** Convert all five to authenticated queries that verify `ctx.auth.getUserIdentity()` and an admin `role`; throw otherwise. Remove `ctx: any` and the `@ts-ignore`.

### 1.4 CRITICAL — Admin portal crashes: `useLocation` with no Router provider
**File:** `src/components/admin/AdminLayout.tsx`, lines 2, 19–20

```ts
import { useLocation, useNavigate } from 'react-router-dom';
const location = useLocation();
const navigate = useNavigate();
```

- **Root cause:** `react-router-dom` is a dependency and its hooks are called, but **no `BrowserRouter`/`HashRouter` exists anywhere** in `src/` (verified by grep). `main.tsx` wraps the app in `ErrorBoundary` → `ClerkProvider` → `ConvexProviderWithClerk` only.
- **Impact:** React Router throws *"useLocation() may be used only in the context of a `<Router>`"*. `AdminLogin` renders, but the moment anyone "signs in", `AdminLayout` mounts and the whole `/admin` route white-screens. Both `location` and `navigate` are additionally never used — the file forces a full page reload with `window.location.href = '/admin'` (line 23) instead.
- **Remediation:** Delete the import and both hook calls. If routing is genuinely wanted later, introduce a router properly; the app currently navigates via `window.location` and `?dashboard` / `?assessment` query params (`App.tsx:19,29–31`).

### 1.5 MAJOR — IDOR: assessment data readable by any authenticated user
**File:** `convex/ai.ts` — `getAssessmentData` (142–151), `getReport` (220–231)

```ts
const assessment = await ctx.db.get(args.assessmentId);  // no ownership check
```

- **Root cause:** `generateReport` checks only `if (!identity) throw` (line 40) — it never verifies that `assessment.userId` matches the caller. `assessments.getById` (lines 43–45) *does* check ownership, so this is an inconsistency between two files doing the same job.
- **Impact:** Any signed-in user can read another student's full assessment and AI report by passing an arbitrary `assessmentId`. `ReportDetail.tsx:28–29` consumes exactly these two functions, so the leak is reachable from the UI.
- **Remediation:** Add `if (assessment.userId !== user._id) throw new Error('Unauthorized');` to both, mirroring `assessments.ts`.

### 1.6 MAJOR — 48.3% of the source tree is dead code
**Scope:** 35 files, 3,806 of 7,880 lines

Two orphan roots — `app-shell.tsx` and `efferd-dashboard.tsx` (plus `hero.tsx`, `logos-section.tsx`) — anchor a self-referential cluster that nothing in the live app imports:

| Dead cluster | Lines |
|---|---|
| `ui/sidebar.tsx` | 721 |
| `ui/chart.tsx` | 371 |
| `competency-trends.tsx` | 295 |
| `ui/dropdown-menu.tsx` | 268 |
| `delta.tsx` | 179 |
| `app-shared.tsx` | 115 |
| `ui/table.tsx` | 116 |
| `ui/avatar.tsx` | 107 |
| `nav-user.tsx`, `recent-assessments.tsx`, `ui/sheet.tsx`, `stats.tsx`, `hero.tsx`, `logo-cloud.tsx`, `ui/infinite-slider.tsx`, `mobile-nav.tsx`, `portal.tsx`, `app-sidebar.tsx`, `header.tsx`, `formater.ts`, `logo.tsx` + 12 smaller files | rest |

**Every shadcn primitive except `button`, `select` and `border-beam` is imported only by dead files** (verified: `avatar`, `badge`, `breadcrumb`, `card`, `chart`, `dropdown-menu`, `infinite-slider`, `input`, `separator`, `sheet`, `skeleton`, `table`, `tooltip` → all dead-only importers).

- **Root cause:** Two design generations were generated side by side and never reconciled. The PascalCase set (`AppShell.tsx`, `Landing.tsx`, `Assessment.tsx`) is live; the kebab-case "efferd" set is an abandoned redesign that still compiles and ships.
- **Impact:** ~3.8k lines shipped to users, inflating bundle and review surface. No linter exists to flag it (see 1.8).
- **Remediation:** Delete all 35 files. Then delete the now-orphaned shadcn primitives as well. Keep `button`, `select`, `border-beam`.

### 1.7 MAJOR — Backend/frontend field-name contract mismatch (admin Students table is empty)
**File:** `src/components/admin/AdminStudents.tsx` lines 85–89 vs `convex/admin.ts` lines 98–106

| Frontend reads | Backend returns | Result |
|---|---|---|
| `s.assessmentCount` | `assessmentsCount` | `undefined` |
| `s.avgScore` | `lastScore` | always `0` → renders `—` |
| `s.createdAt` | `joinedAt` | `Invalid Date` |
| `s.schoolName` | *(not returned)* | always `—` |

- **Root cause:** Frontend written against an assumed shape; no shared type between Convex and React. `AdminContent.tsx:170` has the same class of bug (`n.stdDev` vs. the `standardDeviation` used in `norms.ts`).
- **Impact:** 4 of 6 data columns in the Students table render empty or invalid.
- **Remediation:** Export the return types from `convex/admin.ts` (e.g. `AdminStudentRow`) and type `useQuery` with them; delete the `(s: any)` casts at lines 72 and 42.

### 1.8 MAJOR — No linter; unused-code detection disabled
**Files:** `tsconfig.app.json`, repo root

- `noUnusedLocals` / `noUnusedParameters` are **not set** (only `strict: true`). `tsc --noEmit` passes with **0 errors**, which is misleading — the compiler simply isn't looking.
- **No ESLint or Biome config exists anywhere.**
- Confirmed consequence: `Landing.tsx:1` imports `useEffect, useRef` and uses neither. Root cause of the 48% dead-code figure in 1.6.

**Remediation:** Add ESLint (typescript-eslint + react-hooks + `eslint-plugin-unused-imports`), set `noUnusedLocals: true`, `noUnusedParameters: true`.

### 1.9 MAJOR — `@ts-ignore` used to hide missing generated types (7 occurrences)
**Files:** `App.tsx:15`, `StudentDashboard.tsx:5`, `ReportDetail.tsx:2`, `AdminOverview.tsx:2`, `AdminStudents.tsx:3`, `AdminContent.tsx:2`, `convex/admin.ts:2`

- **Root cause:** `convex/_generated/api` is outside `tsconfig`'s `include: ["src"]`, so imports resolve as errors and are suppressed rather than fixed.
- **Impact:** Type errors in the Convex boundary are invisible; `api.admin.getStudents` args and return values are effectively unchecked.
- **Remediation:** Add `convex` to a `tsconfig.node.json` (or a dedicated `convex/tsconfig.json`) so generated types are real, then remove all `@ts-ignore`.

### 1.10 MAJOR — `localStorage.clear()` destroys unrelated app state (4 sites)
**Files:** `Assessment.tsx:116`, `ReportDetail.tsx:158`, `ReportDetail.tsx:233`, `ErrorBoundary.tsx:40`

- **Root cause:** Using a nuke to reset one feature's state.
- **Impact:** Wipes the Clerk session, Convex cache, `axiom.admin.auth`, and any other same-origin state — logging the user out and, on a shared origin, destroying other apps' data. `Assessment.tsx:116` is the "Start Over" button.
- **Remediation:** Use the existing targeted API — `resetSession(storage)` in `persistence/storage.ts:55` removes exactly the three `axiom.*` keys. Pair with `useAuthStore.clearAuth()` / Clerk `signOut()`.

### 1.11 MAJOR — Tokens persisted to localStorage; comment contradicts the code
**File:** `src/stores/authStore.ts`, lines 67–78

```ts
// Only persist non-sensitive fields; access token persisted for UX continuity
partialize: (state) => ({ student, accessToken: state.accessToken, refreshToken: state.refreshToken, ... })
```

- **Root cause:** The comment claims sensitive fields are excluded; the code persists both `accessToken` **and** `refreshToken`.
- **Impact:** Any XSS exfiltrates a long-lived refresh token. **60% of this store is also dead** — `setAuth`, `setAccessToken`, `clearAuth`, `isAuthenticated` have zero call sites; only `isGuest`, `setGuest`, and `student` are used. Clerk is the real auth system, so this is a vestigial second auth layer.
- **Remediation:** Stop persisting `refreshToken` (and ideally `accessToken`) — Clerk already manages sessions. Delete the unused actions. Rewrite the comment or remove the `partialize`.

### 1.12 MINOR — Unused / misused dependencies
| Package | Status |
|---|---|
| `react-router-dom` | Imported only in `AdminLayout.tsx`, which crashes (1.4). Either wire it up or remove. |
| `ms`, `@types/ms` | Zero imports in `src/`. |
| `@fontsource-variable/outfit` | Installed but never imported in `global.css`. |
| `react-use-measure` | Used only by `ui/infinite-slider.tsx` (dead cluster). |
| `openai` | Correctly used in `convex/ai.ts` — keep. |

### 1.13 MINOR — Duplicated logic
- **`getOrdinal` implemented 3×** — `StudentDashboard.tsx:21`, `ReportDetail.tsx:71`, `AdminStudents.tsx:26` (identical bodies). The `AdminStudents` copy is **never called**. Extract to `src/lib/`.
- **Region list hardcoded in 4 places** — `norms.ts` `regionOffsets`, `CompetencyChart.tsx:6–11`, `ReportDetail.tsx:174–180`, `convex/ai.ts` `COMPETENCY_LABELS`. Derive one `REGIONS` constant.
- **Primary colour literal `oklch(0.58 0.110 222)` repeated 3×** in `AdminOverview.tsx:66,67,77` instead of `var(--primary)`.
- **Gradient `linear-gradient(135deg, var(--primary)…var(--success))`** duplicated in `Landing.tsx:57`, `Landing.tsx:79`, `Onboarding.tsx:58`.

### 1.14 MINOR — Backend correctness & performance
- `convex/ai.ts:114` — `JSON.parse(raw)` on LLM output with **no validation**, then stored via `v.any()`. `zod` is already a dependency and unused here. Parse with a schema; a malformed response currently poisons the `reports` table.
- `convex/ai.ts:169` — `const limit = 5; // Configurable limit` — hard-coded; the comment is false.
- `convex/admin.ts` — every handler does `.collect()` then filters/sorts/slices **in memory** (lines 10–11, 52, 77, 121). Full table scans; will not survive production scale. Use indexed queries + `.paginate()`.
- `convex/assessments.ts:81` — `startedAt` and `completedAt` are both `new Date().toISOString()`, so assessment duration is always 0. The comment admits: *"In a real app we'd track start time earlier."*
- `convex/admin.ts:121` — `getScenarios` queries a `scenarios` table; `AdminContent` requests `scenarioId`/`question` fields that the data may not carry.

### 1.15 MINOR — Dead states in persistence layer
`persistence/storage.ts:15–19` defines `'saving'` and `'offline_sync_pending'`, but `saveSession` (26–37) can only ever return `'saved'` or `'unavailable'`. `SaveStatus.tsx:9–10,18–19` therefore has two unreachable branches.

---

## 2. UI/UX inconsistencies

### 2.1 MAJOR — Garbled Tailwind classes (silent no-ops)
Two tokens got concatenated during generation. These classes **match nothing and apply no styling** — the intended design simply doesn't render.

| File:line | Written | Intended |
|---|---|---|
| `Assessment.tsx:148` | `border-borderborder` | `border-border` |
| `Assessment.tsx:153` | `font-mediumprimary` | `font-medium` |
| `Assessment.tsx:160` | `text-(--foreground-secondary)xs` | `… text-xs` |
| `Assessment.tsx:196` | `text-warning[10px]` | `text-warning text-[10px]` |
| `Assessment.tsx:202` | `text-foregroundsm` | `text-foreground text-sm` |
| `Assessment.tsx:213` | `border-warningborder` | `border-warning` |
| `Assessment.tsx:245` | `text-foregroundsm` | `text-foreground text-sm` |
| `AdminOverview.tsx:55` | `border-borderborder` | `border-border` |
| `AdminStudents.tsx:47` | `text-foregroundsm` | `text-foreground text-sm` |
| `AdminStudents.tsx:69` | `divide-borderborder` | `divide-border` |
| `AdminOverview.tsx:42` | `border-primary4 border-bordert-transparent` | `border-4 border-primary border-t-transparent` |
| `AdminStudents.tsx:54` | *(same garbled pair)* | `border-4 border-primary border-t-transparent` |
| `ReportDetail.tsx:139,151` | `bg-/5`, `border-/30` | `bg-primary/5`, `border-primary/30` |
| `AdminContent.tsx:99,162` | `hover:bg-/40` | `hover:bg-accent/40` |

- **Root cause:** String concatenation of utility fragments without a separating space — a hallmark of generated markup that was never rendered or reviewed.
- **Remediation:** Fix all 14. Add a Tailwind class-lint step (or `eslint-plugin-tailwindcss` with `no-custom-classname`) so this cannot recur.

### 2.2 MAJOR — Broken design-token classes (referencing unmapped tokens)
`global.css` `@theme inline` (lines 106–131) maps `--color-*` for 24 tokens but **omits `foreground-secondary`, `surface`, and `elevated`.** Code that uses the plain Tailwind form therefore gets nothing:

| Broken usage | Count | Correct form used elsewhere |
|---|---|---|
| `bg-surface` | 5 (`AdminLayout:30`, `ReportDetail:84,111,186`, `AdminContent:103`) | `bg-(--surface)` ×16 |
| `text-foreground-secondary` | 1 (`AdminOverview:38`) | `text-(--foreground-secondary)` ×54 |

- **Remediation:** Add `--color-surface`, `--color-elevated`, `--color-foreground-secondary` to `@theme inline`, then standardise on the plain `bg-surface` form everywhere (54 arbitrary-value call sites).

### 2.3 MAJOR — `prose` classes do nothing
`ReportDetail.tsx:143` uses `prose prose-sm prose-invert`, but **`@tailwindcss/typography` is not installed** and not imported in `global.css`. The AI report body renders unstyled.

### 2.4 MAJOR — Three different spinners, two of them invisible
| Location | Markup | Renders? |
|---|---|---|
| `Leaderboard.tsx:26` | `border-2 border-primary border-t-transparent` | ✅ correct |
| `StudentDashboard.tsx:70` | `border-primary border-t-transparent` | ❌ no width — `border-primary` sets *colour* only, so the spinner is invisible |
| `AdminOverview.tsx:42`, `AdminStudents.tsx:54` | `border-primary4 border-bordert-transparent` | ❌ garbled, invisible |
| `ReportDetail.tsx:62` | `border-4 border-primary border-t-transparent` | ✅ but 4px vs 2px elsewhere |

**Remediation:** One `<Spinner />` component, used in all four places.

### 2.5 MAJOR — Timer gives no colour escalation
`Assessment.tsx:46–51`:
```ts
timerFraction > 0.5  ? 'text-primary'
: timerFraction > 0.25 ? 'text-primary font-bold'
:                       'text-primary font-bold animate-pulse'
```
All three branches are `text-primary`. As time expires the countdown never changes colour — only a pulse is added. **Remediation:** use `text-primary` → `text-warning` → `text-destructive`; add `role="timer"` and announce at thresholds for a11y.

### 2.6 MAJOR — Data visualisation uses border colours as data colours
- `CompetencyChart.tsx:10` — Europe bar `fill: 'var(--border)'` (a dark grey) on a dark surface → effectively invisible.
- `ReportDetail.tsx:174–180` — **3 of 5** progress bars (USA, China, Europe) use `var(--border)`; Singapore uses `var(--accent)` (also very dark). Only Global is legible.

**Remediation:** Use the existing `--chart-1…--chart-5` tokens (defined at `global.css:80–84` and currently unused by any live chart).

### 2.7 MAJOR — Light-mode token block is incomplete
`global.css:88–104` overrides `background`, `surface`, `elevated`, `foreground`, `border`, `input`, `muted`, `accent`, `sidebar` — but **not** `primary`, `success`, `warning`, `highlight`, or any `*-glow`. Dark-optimised accents (e.g. `--primary: oklch(0.58 0.110 222)`) on a light `#F5F2ED` background will fail contrast.

Also: the block keys off two different conventions — `.light` **and** `[data-theme="light"]`. Pick one.

### 2.8 MAJOR — Button system is incoherent
| Source | Height | Radius |
|---|---|---|
| `ui/button.tsx` (shadcn/Base UI) | `h-7` default, `h-8` lg, `h-5` xs | `rounded-none` |
| `Landing.tsx:77,195` | `h-13` | `rounded-full` |
| `Onboarding.tsx:57,71` | `h-14` | `rounded-2xl` |
| `Onboarding.tsx:172` | `h-12` | `rounded-full` |
| `StudentDashboard.tsx:60,63` | `h-10` | pill / `rounded-xl` |
| `AppShell.tsx:24` | auto | `rounded-full` |

The live code fights the design system: `Assessment.tsx:134` renders `<Button size="lg" className="btn-pill h-12 …">` — overriding height and forcing a pill. Meanwhile `.btn-pill` (`global.css:298–302`) uses **`!important` on padding**, which silently defeats `px-6` / `px-8` on callers (`StudentDashboard:43,60`; `ReportDetail:158,233`).

- **Remediation:** Reconcile one scale. Set the app's radius/size defaults in `ui/button.tsx` (pill, `h-10`/`h-12`), delete `.btn-pill`'s `!important`, and stop passing `h-*`/`rounded-*` at call sites.

### 2.9 MINOR — Radius inconsistency
`rounded-full`, `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-none`, and `rounded-b-3xl`/`rounded-t-3xl` (`ReportDetail:84,218`) all coexist. `global.css:65–66` documents a scale ("Cards: 16px, Inputs: 10px, Pills: 9999px") that no component follows — inputs are `rounded-xl` (12px) in `Onboarding.tsx` and `rounded-lg` in `AdminStudents.tsx:108`.

### 2.10 MINOR — Typography
- `global.css:145` declares `--font-mono: 'JetBrains Mono', 'Fira Code', …` but **neither font is loaded** (only Inter and Space Grotesk are imported at lines 4–5). `.score-display` and all `font-mono` score readouts silently fall back to a system mono — different metrics across machines.
- `h-13`, `min-w-37.5`, `min-h-62.5`, `max-w-50`, `h-75`, `w-125` — off-scale arbitrary values that break the 4px rhythm (`Landing:77,103,195`; `CompetencyChart:15`; `Assessment:163`; `ReportDetail:111,132`; `AdminLogin:39`).

### 2.11 MINOR — Eyebrow/label sizes drift
The same "small uppercase label" role uses `text-[10px]` (`StudentDashboard:56`, `AdminOverview:36`), `text-[11px]` (`Landing:105`, `Leaderboard:21`, `Onboarding:105`), and `text-xs` (`AdminLogin:50`, `Assessment:150`). Pick one token.

### 2.12 MINOR — UI copy contradicts the data
| Claim | Location | Reality |
|---|---|---|
| "India, Singapore, USA, **UK**, and globally" | `Landing.tsx:25` | `norms.ts` has **Europe**, not UK; **China** exists but is unmentioned |
| "11+ Linked Scenarios" / "Navigate 11 linked…" | `Landing.tsx:11,18` | `scenarios.ts` has **30** items (5 calibration + 25 across 5 missions) |
| "Saved to cloud" / "Syncing…" | `SaveStatus.tsx:8–9` | `saveSession` writes **only to localStorage** — no network call exists |
| "Your data stays yours… encrypted at rest" | `Landing.tsx:180` | `convex/ai.ts:73–88` sends student **name, class and scores** to OpenAI/OpenRouter |

The last two are the serious ones: they are **false privacy claims** in a product positioned on "Privacy First: Never transmit user data" (`PRODUCT.md:46`) and marketed to children (Classes 3–12). This is a COPPA/GDPR exposure, not just a copy bug. Derive the numbers from `data/` and rewrite the privacy claims to match what the code actually does.

### 2.13 MINOR — Dead CSS
`competency-badge`, `divider-nordic`, `section-parent`, `achievement-badge` (`global.css:348–381`) have **zero** usages. Likewise `@custom-variant dark` (line 11) — `dark:` appears only in files inside the dead cluster, and `.dark` is never applied to any element.

### 2.14 MINOR — Miscellaneous
- `Leaderboard.tsx:37,52` — a "School" column and header rendered with a hard-coded `—` for every row. Unimplemented feature shipped in the UI.
- `ReportDetail.tsx:229` — `hover:bg-background` on a `bg-background` button: no visible hover state.
- `ReportDetail.tsx:203` — `missionId.replace('-', ' ')` replaces only the first hyphen (`stem-energy` → `stem energy`); fragile.
- Navigation is `window.location.href` / `window.location.search` full reloads (`App.tsx:70`, `StudentDashboard:60,135`, `ReportDetail:220,233`) — every transition loses React state and re-mounts providers.
- `Assessment.tsx:94,129` — `h-[calc(100vh-4rem)]` hard-codes the header height (matching `h-16` in `AppShell.tsx:8`). Brittle coupling; use flex layout.

---

## 3. Bloated AI-generated components

### 3.1 MAJOR — `ui/sidebar.tsx`, 721 lines, entirely dead
The single largest file in the project belongs to a sidebar navigation pattern that no live route uses. It carries 8 internal sub-components, a cookie-persistence layer, mobile sheet handling, keyboard shortcut (`cmd+b`), and 7 distinct width constants. Ship it or delete it — do not keep it "for later".

### 3.2 MAJOR — `ui/chart.tsx` (371 lines) — dead, and duplicated by hand-rolled charts
A full Recharts wrapper (`ChartContainer`, `ChartTooltip`, `ChartLegend`, context providers, config resolution) with **zero live consumers**. Meanwhile `CompetencyChart.tsx` and `AdminOverview.tsx` each hand-roll their own Recharts setup with duplicated `contentStyle`/`labelStyle` blobs.

### 3.3 MAJOR — `ui/button.tsx`: 6 variants × 7 sizes, ~3 used
`cva` defines `default/outline/secondary/ghost/destructive/link` and `default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg`. Live code uses `default`, `ghost`, `outline` and `default`/`lg` only. The base string is ~180 characters of `aria-invalid:`, `dark:`, and `has-data-[icon=…]` conditionals (`dark:` being dead per 2.13), and it ships `rounded-none` — the opposite of the app's pill language.

### 3.4 MAJOR — `BorderBeam` (44 lines) — decorative effect over a button
`ui/border-beam.tsx` is pure ornament: a conic-gradient pseudo-element with a spin animation. It is used once, inside the Landing CTA (`Landing.tsx:84`), where it also relies on `mask-intersect!` — a very new Tailwind utility with limited browser support. Four of its six props (`borderWidth`, `colorFrom`, `colorTo`, `delay`) are never passed.

### 3.5 MAJOR — Unused state and props
- `AdminStudents.tsx:26–30` — `getOrdinal` defined and **never called**.
- `AdminLayout.tsx:19–20` — `location` and `navigate` assigned, never used, and crash the route (1.4).
- `authStore.ts` — 4 of 7 actions and 3 of 6 state fields have no call sites (1.11).
- `ui/border-beam.tsx:8–11` — 4 unused props.
- `AdminOverview.tsx:17` — `StatCard` takes `accent` + `delay`; all four call sites pass both explicitly, so the defaults are dead and `delay` is duplicated in a `transition` prop at line 19.

### 3.6 MINOR — Unused imports
- `Landing.tsx:1` — `useEffect`, `useRef` imported, neither used. Undetected because `noUnusedLocals` is off.
- `Leaderboard.tsx:1` — `motion` used; no issue. (Contrast with `competency-trends.tsx`, dead file, which re-implements the same FADE pattern.)

### 3.7 MINOR — Inline style objects bypass the token system
`Landing.tsx` carries 8 inline `style` blocks (lines 35–36, 56–60, 78–82, 126, 132, 144, 174, 189, 196–200) with raw `var(--primary)` and `oklch(...)` values, including nested `oklch(from …)` expressions. `Onboarding.tsx:136–137` mutates `e.target.style` imperatively on focus/blur instead of using `focus:` variants. This makes the design un-themeable and un-reviewable.

### 3.8 MINOR — Redundant abstractions & magic values
- `ReportDetail.tsx:174–180` — a 5-element array literal constructed **inside JSX**, recreated on every render, then `.sort()`ed inline.
- `CompetencyChart.tsx:15` — `min-h-62.5` / `print:min-h-75` (250px/300px expressed as odd decimals).
- Hard-coded domain constants scattered instead of derived: `/900` (`ReportDetail:131`, `StudentDashboard:131`, `AdminStudents:87`, `ai.ts:81`), `?? 5` calibration fallback duplicated (`Assessment.tsx:57,114`).
- `app-shared.tsx` (115 lines) — a shared-constants file for the dead cluster only.
- `formater.ts` (95 lines) — miscased filename, imported only by the dead `competency-trends.tsx`.

---

## 4. Recommended remediation order

**Immediate (security / app-breaking)**
1. Rotate the Supabase secret; add `.env*` to the root `.gitignore` (§1.2).
2. Remove hardcoded admin credentials; move admin auth server-side (§1.1, §1.3).
3. Fix the admin crash — delete the `useLocation`/`useNavigate` calls (§1.4).
4. Add ownership checks to `ai.getAssessmentData` / `ai.getReport` (§1.5).

**Next (correctness)**
5. Delete the 35 dead files (‑3,806 lines) and orphaned shadcn primitives (§1.6).
6. Fix the 14 garbled + 6 broken-token classes; add Tailwind linting (§2.1–2.3).
7. Reconcile the AdminStudents/AdminContent field contract with typed Convex responses (§1.7).
8. Add ESLint; enable `noUnusedLocals` (§1.8). Remove the 7 `@ts-ignore` (§1.9).
9. Replace `localStorage.clear()` with `resetSession()` (§1.10).

**Then (consistency)**
10. Unify the button scale and delete `.btn-pill`'s `!important` (§2.8).
11. One `<Spinner />`; map `surface`/`elevated`/`foreground-secondary` tokens; install or drop `prose` (§2.2–2.4).
12. Fix the timer colour escalation and chart data colours (§2.5, §2.6).
13. Correct the false privacy/cloud claims, or change the architecture to match them (§2.12).
14. Extract `getOrdinal`, `REGIONS`, and the gradient/score constants (§1.13).

**Note on the uncommitted work:** ~20 modified files in `.worktrees/axiom-mvp` have never been committed, and `main` is three branches behind the real code. Commit or branch this work before making sweeping deletions, so the dead cluster remains recoverable from history.
