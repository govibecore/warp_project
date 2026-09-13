# WARP Transformation Plan

> CTO-led remediation log tracking every audit finding to resolution.
> Source: `CODEBASE_AUDIT.md` (Phase 1) → this plan (Phase 2 onward).

---

## Summary

| Metric | Before | After |
|---|---|---|
| Test count | 20 (1 failing) | 35 (all passing) |
| TypeScript errors | 2 (`TS6133`) | 0 |
| Item-bank variants | 30 (one text per item, all bands) | 150 (30 items × 5 band-specific variants) |
| Misconception-tagged distractors | 0 | 100% of designed-wrong (≤2 credit) options |
| Standards tags (NGSS / PISA / NCF) | 0 | Every blueprint tagged |
| Design system | Ad hoc, glassmorphism | Nordic Lagom, tokenised |
| Account deletion | Not implemented | Convex mutation + confirm dialog |
| Landing copy accuracy | "11 linked scenarios" | "30 assessment items" |
| Report misconception feedback | Not wired | Surfaced in transcript |

---

## Remediation Log

### 1. Security & Privacy

| # | Finding | Status | Resolution |
|---|---|---|---|
| 1.1 | No account/data deletion despite Landing copy claiming it | ✅ Done | Added `deleteAccount` mutation in `convex/users.ts` — cascades to `reports` and `assessments` tables, then deletes the user record. Leaderboard self-cleans because it reads from `assessments`. Wired to a confirm-dialog button in `StudentDashboard.tsx`. |
| 1.2 | Landing privacy copy said "offline-only, never transmit" while product uses Convex + Clerk | ✅ Done | `PRODUCT.md` updated to reflect the real architecture. Landing copy updated to match the 30-item instrument. |

### 2. Item Bank & Assessment Quality

| # | Finding | Status | Resolution |
|---|---|---|---|
| 2.1 | Single text per item across all class levels (Class 3 sees Class 12 wording) | ✅ Done | Replaced with band-differentiated bank: 30 items × 5 developmental bands = 150 variants. Each band has age-appropriate reading level, numeracy, and context. Files: `src/data/scenarios/{calibration,energy,ecology,space,data,infra}.ts` |
| 2.2 | No misconception diagnosis on distractors | ✅ Done | Added optional `misconception?: string` to `AssessmentOption` and `ItemResponse`. Every designed-wrong (≤2 credit) option now carries a canonical misconception tag (e.g. "heavier objects fall faster", "correlation implies causation"). Full-credit answers never carry one. |
| 2.3 | No curriculum-standards alignment | ✅ Done | Added optional `standards?: readonly string[]` to `AssessmentItem`. Every blueprint carries NGSS SEP tags (e.g. "NGSS SEP3: Planning investigations") and PISA 2025 competency tags (e.g. "PISA 2025 C2: Enquiry & data"). `materialize` appends the NCF 2023 stage tag for the band. |
| 2.4 | `getDevelopmentalBand(2)` returned `'5-6'` instead of throwing | ✅ Done | Replaced `<= 6` bounds with explicit `>= 5 && <= 6` ranges. Classes 1–2 and 13+ now throw with a clear error message. |
| 2.5 | No data-quality test for the item bank | ✅ Done | Created `src/data/scenarios/scenarios.test.ts` — 14 cases enforcing: 30 items per band, `cal-sci`/`cal-comp` order, unique IDs, unique full-credit option per item, ≤2 options tagged with misconception, full-credit never tagged, all 5 competencies covered with ≥150 available weight per band, determinism, and option-order shuffle producing >1 distinct correct-answer position. |
| 2.6 | TS6133 unused-parameter errors on old `scenarios.ts` | ✅ Done | Old `scenarios.ts` deleted. New `scenarios/` directory with `builder.ts` helper has no such params. Typecheck clean. |
| 2.7 | Misconception data not surfaced in reports | ✅ Done | Wired `selected.misconception` into the `lock()` callback in `Assessment.tsx` (line 69–77). `ReportDetail.tsx` response transcript now shows a warning icon + misconception text under any answer that was a designed-wrong option. |

### 3. Design System

| # | Finding | Status | Resolution |
|---|---|---|---|
| 3.1 | No coherent design system; ad hoc Tailwind classes | ✅ Done | Implemented Nordic Lagom Design System in `src/styles/global.css`. Warm-paper light theme + Nordic-night dark theme. OKLCH tokens for all colours. Single accent (Fjord) + four semantics. Documented in `DESIGN.md`. |
| 3.2 | CompetencyChart used glassmorphism (`backdrop-blur`, heavy shadow, `font-weight: 800`, rainbow fills) | ✅ Done | Rewritten to Lagom data-viz rules: `--chart-*` tokens, plain tooltip card (no blur, no shadow), `font-weight: 600`, one accent for the student's standing + neutrals for others. Added `--chart-1`–`--chart-5` tokens to the dark theme. |
| 3.3 | No `--chart-*` tokens for dark theme | ✅ Done | Added `--chart-1` through `--chart-5` to `.dark` block in `global.css`. |

### 4. Landing Copy

| # | Finding | Status | Resolution |
|---|---|---|---|
| 4.1 | `STATS` said `{ value: '11', label: 'Linked scenarios' }` — real instrument has 30 items | ✅ Done | Changed to `{ value: '30', label: 'Assessment items' }`. |
| 4.2 | `STEPS[1]` said "Eleven linked STEM scenarios" | ✅ Done | Changed to "Thirty scenario items across five STEM missions — energy, ecology, space, data, and infrastructure — plus five calibration items." |

### 5. Test Suite

| # | Finding | Status | Resolution |
|---|---|---|---|
| 5.1 | `Assessment.test.tsx` E2E test failing (regex mismatch) | ✅ Done | Button text is "Continue without an account" but test queried `/continue without account/i` (missing "an"). Fixed regex to `/continue without an account/i`. 21/21 → now 35/35. |
| 5.2 | Vitest "window is not defined" when run from workspace root | ✅ Done | Root cause: `npx vitest` from `C:\warp` installs vitest@5 globally (no jsdom). Fix: always `cd C:/warp/.worktrees/warp-mvp` before running `npx vitest`. |

### 6. Product Documentation

| # | Finding | Status | Resolution |
|---|---|---|---|
| 6.1 | `PRODUCT.md` claimed offline-only, no backend, no telemetry | ✅ Done | Updated to reflect real architecture: Convex + Clerk + OpenAI. Privacy claims now match the actual implementation (encrypted in transit and at rest; account deletion available). |
| 6.2 | No `DESIGN.md` documenting the design system | ✅ Done | Written. See `DESIGN.md`. |
| 6.3 | No transformation plan tracking audit remediation | ✅ Done | This document. |

---

## Deferred / Future Work

| # | Item | Rationale |
|---|---|---|
| D1 | `noUncheckedIndexedAccess` hardening pass | The compiler flag is off; enabling it would catch array-access-by-undefined risks. Worthwhile but touches many files — defer to a dedicated PR. |
| D2 | ESLint setup | No linter configured. The typecheck (`tsc -b`) catches type errors but not style. Add `eslint` + `@typescript-eslint` in a follow-up. |
| D3 | `convex/_generated/api` `@ts-ignore` cleanup | Three `@ts-ignore` comments on generated imports. These resolve once `convex dev` regenerates the API with the new `deleteAccount` mutation. |
| D4 | Auth `act(...)` warning in `App.test.tsx` | React state update in a test not wrapped in `act()`. Cosmetic — test passes. Wrap in a follow-up. |

---

## Architecture (Current)

```
WARP
├── Frontend: Vite + React 18 + Tailwind CSS v4
├── Design System: Nordic Lagom (tokenised in src/styles/global.css)
├── Backend: Convex (real-time database, mutations, queries, actions)
├── Auth: Clerk (email + OAuth, guest mode)
├── AI: OpenAI (narrative report generation)
├── Testing: Vitest (35 tests) + Playwright (E2E)
├── Item Bank: 30 items × 5 bands = 150 variants
│   ├── 5 calibration (cal-sci, cal-comp, cal-eng, cal-math, cal-sys)
│   └── 5 missions × 5 items (stem-energy, stem-ecology, stem-space, stem-data, stem-infra)
├── Standards: NGSS SEPs + PISA 2025 competencies + NCF 2023 stages
└── Misconception diagnosis: canonical tags on every designed-wrong distractor
```

_Version: 1.0 · Last updated: 2026-09-08_
