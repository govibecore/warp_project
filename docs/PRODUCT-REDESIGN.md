# WARP v2.0 - Plan Review & Product Redesign Blueprint

**Input reviewed:** *STEM Benchmark Platform - Innovative Build Plan v2.0* (Vite + React 19 · Supabase · OpenRouter · Nemotron)
**Redesign system applied:** Nordic Lagom × Sci-Fi (see `REDESIGN-PROMPT.md`, landing prototype `index.html`)
**Verdict:** The architecture pivot is right. Four flaws need fixing before build, and the plan has **no design system** - that's what this document supplies.

---

## Part 1 - Build plan review

### 1.1 What's genuinely strong (keep)

| Decision | Why it's right |
|---|---|
| RLS consent gating (`consent_status='verified'` inside the policy) | The best idea in the plan. DB-enforced, unbypassable by frontend bugs. |
| OpenRouter key in Vault, all AI calls via Edge Functions | Fixes v1.0's fatal `VITE_OPENROUTER_KEY` browser exposure. |
| Curated `resources` table - LLM emits keys, server maps to URLs | Correct anti-hallucination pattern for a children's product. |
| Audit via Postgres triggers | Fires regardless of caller; DPIA-ready. |
| Dual-audience reports in one call | Matches the product promise; halves AI cost. |
| Deterministic fallback report | A child never sees a dead end. Good. |
| Signed URLs for PDFs, `share_expires_at` | Right instinct (but see 1.2-#1 - the implementation is broken). |
| Outcome-only badges, no engagement analytics | DPDP-correct and on-brand ("no streaks, no badges, no confetti"). |

### 1.2 Critical flaws - fix before writing code

**#1 - The shared-report RLS policy is publicly enumerable.** *Severity: critical.*

```sql
-- AS WRITTEN IN THE PLAN - anyone, no token needed, can read every shared report:
create policy "shared report read" on public.reports
  for select using (share_token is not null and (share_expires_at is null or share_expires_at > now()));
```

The policy checks *that a token exists*, not *that the requester presented it*. Any anonymous user can `select * from reports` and harvest every unexpired shared report - a children's-data breach by design. RLS can't compare a client-supplied value inside `using()` without a function. Replace with a security-definer RPC:

```sql
-- Drop that policy entirely. Then:
create or replace function public.get_shared_report(p_token text)
returns setof public.reports language sql security definer stable
set search_path = public as $$
  select * from public.reports
  where share_token = p_token
    and (share_expires_at is null or share_expires_at > now());
$$;
revoke all on function public.get_shared_report(text) from public;
grant execute on function public.get_shared_report(text) to anon;
-- Client: supabase.rpc('get_shared_report', { p_token: token })
```

**#2 - The OpenRouter `:free` privacy claim doesn't hold.** *Severity: critical for DPDP.*

The plan asserts the allow-list is "privacy-verified" and blocks Poolside/Liquid. But OpenRouter's free-tier endpoints generally state that prompts/completions **may be logged and used for training by the provider** - that's the whole reason they're free. A prefix blocklist misses the actual mechanism. For minors' assessment data, the plan as written likely violates its own DPDP matrix. Concrete fixes, in order of preference:

1. Send every request with provider routing preference `provider: { data_collection: "deny" }` (OpenRouter supports this) - models that retain data are skipped automatically.
2. Treat `:free` models as **fallback-only for non-PII payloads** (scores + band, never name/school), and make the primary a paid zero-retention endpoint - the plan already budgets $0–30; earmark it here.
3. Strip PII server-side before the prompt regardless: the Edge Function should build the prompt from `scaled_scores`, `class_level`, `preferred_language` - never `full_name`, `school_name`, `city`.

**#3 - The 3PL likelihood formula is wrong.** *Severity: high (measurement validity).*

```ts
// PLAN'S VERSION - guessing crammed into the logit; not 3PL:
const p = r.a * (theta - r.b) + r.c * (1 - r.a);
const prob = 1 / (1 + Math.exp(-p));

// CORRECT 3PL - guessing scales the asymptote, outside the logistic:
const p3pl = (a: number, b: number, c: number, theta: number) =>
  c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
// likelihood per response: correct ? p3pl(...) : 1 - p3pl(...)
```

The quadrature weights listed also sum to ~1.96, not 1 - harmless in EAP (numerator and denominator both scale), but use a proper Gauss–Hermite table to avoid confusion.

**#4 - Client-supplied θ is a cheat vector.** *Severity: high.*

`next_scenario(p_student, p_theta, p_seen)` accepts ability from the caller. Any student can POST an inflated θ and get easy items + a high score. Scoring must be **server-authoritative**: the Edge Function recomputes θ from the stored `responses` JSONB on every answer, and the RPC reads θ from the assessment row - never from request params:

```sql
create or replace function public.next_scenario(p_assessment uuid)
returns setof public.scenarios language sql security definer stable as $$
  -- θ read from assessments.ability_theta (written only by the irt-estimate
  -- Edge Function via service role), p_seen derived from responses jsonb
$$;
```

**#5 - Pseudo-SQL that won't run as written.** *Severity: medium.*

- `cdf(normal(mean, std_dev), p_theta)` - Postgres has no built-in normal CDF. Use `0.5 * (1 + erf((p_theta - n.mean) / (n.std_dev * sqrt(2))))`.
- `next_scenario` references `s.development_band`; the column is `developmental_band`.
- The pgvector `update` references `assessment.scaled_scores` out of scope, and `unnest()` doesn't decompose a JSONB object into ordered rows. Canonical fix: store embeddings in a fixed competency order (document it: `computationalThinking, engineeringDesign, mathematicalReasoning, scientificInquiry, systemsThinking` - alphabetical) and build the vector with `jsonb ->> 'key'` lookups, not `unnest`.
- `assessments` **update** policy lacks the consent gate that select/insert have - make all three identical.

**#6 - PWA caches the item bank.** *Severity: medium (test security).*

`StaleWhileRevalidate` on `/rest/v1/scenarios` persists the question bank on-device - scrapeable, and it leaks IRT parameters (`irt_a/b/c` are in the table and select-able by any authenticated student). Two fixes: (a) cache the app shell and static assets only, queue *responses* in IndexedDB (the plan gets this half right); (b) never expose `scenarios` to the client at all - serve items one at a time from the `next_scenario` RPC with IRT params **excluded** (`select id, prompt, options.text ...`), so discrimination/difficulty values never leave the server.

**#7 - The item pool is too thin for CAT.** *Severity: medium (psychometrics).*

Phase 1 seeds **20 scenarios total**. CAT needs a pool per competency per developmental band - 5 competencies × 5 bands means 20 items = **less than 1 item per cell**. With ~4 items per competency per session, ability estimates will have huge standard errors and percentiles will be noise. Minimum viable: **12–15 active items per competency per band** (~300+ items), or launch CAT for one band first and fixed-form for the rest. Also: report SEM alongside θ in the UI - honesty about uncertainty is on-brand.

**#8 - Brand/UX incoherence with the landing page.** *Severity: low but visible.*

- Landing FAQ says **"No timers, no pressure"**; the plan ships a `Timer` component. Replace countdown with a quiet **elapsed-time** indicator (mono, muted) - same data, no threat.
- Plan lists `ConfettiEffect` - the brand promise is *"no confetti."* Kill it. Celebration = a single cyan "new personal best" hairline chip.
- "Lottie brain-loading" everywhere risks clutter; Lagom allows **one** loading artifact (report streaming). Elsewhere use skeleton hairlines.

### 1.3 Smaller notes

- `students.id` FK to `auth.users` with cascade - good; add a DB trigger to auto-create the `students` row on signup (plan implies manual insert).
- `audit_logs.ip_address inet` - Edge Functions must forward `x-forwarded-for`; fine, but document retention of IPs under data-minimization (hash after 90 days?).
- `total_time_ms` client-reported - treat as indicative, not integrity evidence (consistent with the no-surveillance stance).
- Realtime `broadcast` from Edge Function works via supabase-js in Deno; prefer **throttled section-level events** (per JSON key), not per-token, to avoid 100+ messages per report.
- Multilingual: `preferred_language` is only a prompt flag. Devanagari/Tamil/Bengali need **Noto Sans** webfonts + line-height ≥ 1.7 and font-size +1px for Indic scripts. Budget for it in Phase 3.

---

## Part 2 - The redesign: Lagom × Sci-Fi across the product

The landing page (`index.html`) is surface #1 of 8. The same system now rolls out to the other seven. Principle unchanged: **the product's data carries the drama; the chrome stays quiet.**

### 2.1 Token mapping → Tailwind v4

```css
/* app/globals.css - one source of truth, consumed by Tailwind @theme */
@theme {
  --color-ink-0:#F4F6F8; --color-ink-1:#DCE2E8; --color-ink-2:#A8B3BD;
  --color-ink-3:#6B7785; --color-ink-6:#14181F; --color-ink-7:#0B0E13;
  --color-accent:#8FCFE8; --color-accent-2:#4DA8C9; --color-warm:#D9A86E;
  --color-ok:#7FCBA0;   --color-bad:#D9886E;
  --color-c1:#8FCFE8; --color-c2:#7FCBA0; --color-c3:#D9A86E;
  --color-c4:#D9886E; --color-c5:#B89BD9;   /* competency colors, fixed order */
  --font-sans:'Inter',ui-sans-serif,system-ui;
  --font-mono:'JetBrains Mono',ui-monospace;
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px;
  --ease-standard:cubic-bezier(.2,.7,.2,1);
}
```

Rules that apply everywhere: hairline borders at 5–8% white; one accent per viewport; mono only for data/labels; headlines 500-weight sentence case; no corner brackets, no boxed nav, no scanlines.

### 2.2 Surface-by-surface redesign

| # | Surface (route) | Redesign spec |
|---|---|---|
| 1 | **Landing** `/` | ✅ Done - see `index.html`. |
| 2 | **Auth + Consent gate** `/register` | Split screen: left, the game cosmos (reuse hero canvas, dimmed 40%); right, a single glass card. Steps as mono `- 01 account · - 02 parent consent · - 03 language`. While `consent_status='pending'`, the entire app shows this gate with a calm status line ("Waiting for parent verification · usually < 1 day") - the RLS block becomes a *designed state*, not an error. |
| 3 | **App shell** | 64px glass top bar (identical to landing nav): brand left, mono section tabs center, student chip (initial + class, e.g. `A · CLASS 8`) + consent-verified dot right. No sidebar - the product has ≤5 sections; a sidebar is furniture for its own sake. |
| 4 | **Assessment session** `/assessment/:id` | The Lagom centerpiece - a test should feel like a clean desk. Centered 720px column; top meta row: band chip + competency dot+label + `ITEM 07 / 20` + elapsed time (mono, muted - **not a countdown**); 2px progress hairline in accent; scenario card = prompt at 20px/1.6 + options as full-width hairline rows with letter chips `A B C D`, 1px hover border, selected = 8% accent fill + cyan letter chip; keyboard shortcuts A–D/Enter (plan already specced - style the hints as faint mono at row right). Footer: `Hint` quiet link, `Save & exit`, pill `Next →`. Zero ornament while answering; between items, a 250ms cross-fade only. |
| 5 | **Dashboard** `/dashboard` | KPI row (global score `/900`, India percentile, global percentile, tests taken) as open numerals, no cells. Two hero cards: **TrajectoryChart** (line, dashed prediction segment - this is the v2.0 headline feature, give it the most space) and **CompetencyRadar** (pentagon, student polygon in accent at 12% fill vs cohort dashed outline). Then BenchmarkChart, "Next mission" card (top action-plan item), outcome-based "students like you" anonymized chips, and a hairline history table with per-row delta. Provisional-norms footnote in mono until `is_provisional` flips. |
| 6 | **Report** `/reports/:id` | Header: `WARP SIGNAL` + class/date + **provenance chip** (`nemotron-3-ultra · cascade 1 · 4 assessments in context` - the AI transparency the plan promises, made visible). A segmented `Student │ Parent` toggle switches tone, not layout: Student = encouraging summary, 3 green strength chips, "next mission", percentile-as-rank ("Top 12% in India"); Parent = analytical paragraph, strengths/growth two-column, 4 action-plan cards with `resourceKey` chips + duration + difficulty, parent-guidance block. Streaming: sections fade in under one Lottie pass, then hairline skeletons. |
| 7 | **PDF export** | Print stylesheet inverts to paper: white bg, ink text, competency colors darkened 15% for contrast, charts rasterized at 2×. The dark sci-fi theme must never hit a printer - html2pdf reads the same DOM with a `.print` class. |
| 8 | **Shared report** `/shared/:token` | Read-only render of the parent variant inside the landing page's chrome (nav + footer) - so a shared link markets the product. Expired token = calm mono notice, not a 404. Served via `get_shared_report` RPC (see 1.2-#1). |

### 2.3 Recharts theming (one wrapper, used everywhere)

```tsx
// components/charts/theme.ts - every chart inherits these
export const chartTheme = {
  grid:   { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '0' },
  axis:   { tick: { fill: '#6B7785', fontSize: 11, fontFamily: 'JetBrains Mono' },
            axisLine: { stroke: 'rgba(255,255,255,0.08)' } },
  series: { student: '#8FCFE8', cohort: '#F4F6F8' },   // cohort always dashed white
  competency: ['#8FCFE8','#7FCBA0','#D9A86E','#D9886E','#B89BD9'],
  tooltip: { contentStyle: { background: '#14181F', border: '1px solid rgba(255,255,255,0.08)',
             borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12 } },
};
```

### 2.4 Motion & accessibility contract

- 200–350ms, `cubic-bezier(.2,.7,.2,1)`; hovers translate 1–2px, never scale.
- During assessment: **no animation at all** except the 250ms item cross-fade. Focus is the feature.
- Cyan focus rings on everything interactive; contrast ≥ 4.5:1 (audit `--color-c4 #D9886E` body text - it's borderline on `#0B0E13`, use for data only).
- `prefers-reduced-motion`: disables starfield, streaming fades, bar animations.
- Indic-language reports: swap to Noto Sans stack, line-height 1.7.

### 2.5 Where design slots into the plan's phases

| Phase | Add this design work |
|---|---|
| 1 (Foundation) | Tailwind `@theme` tokens, app shell, consent-gate designed state |
| 2 (Assessment) | Assessment session UI (the most important screen in the product - do not let it ship unstyled) |
| 3 (AI Reports) | Report dual-variant layout, streaming states, provenance chip, print stylesheet, Noto fonts |
| 4 (Dashboard) | TrajectoryChart + Radar theming, peer chips, history table |
| 5 (Scale) | Educator dashboard in the same system; educator view is *more* restrained (no accent color beyond status) |

---

## Files in this folder

| File | What it is |
|---|---|
| `index.html` | Landing page prototype (surface #1) - Nordic Lagom × Sci-Fi |
| `REDESIGN-PROMPT.md` | Landing analysis + master prompt |
| `app.html` | **Product surfaces prototype** - dashboard, assessment session, dual-audience report, in the same design system |
| `PRODUCT-REDESIGN.md` | This document - v2.0 plan review + product-wide redesign blueprint |
