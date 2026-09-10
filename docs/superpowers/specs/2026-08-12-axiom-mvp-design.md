# AXIOM MVP Design

**Status:** Approved for implementation

## Product intent

AXIOM is a zero-backend, offline-first browser assessment that projects Indian students in Classes 3-12 onto a transparent global STEAM competency scale. It evaluates applied systems thinking through connected decisions rather than rote recall. The MVP is a single local learner profile per browser and does not include accounts, classroom administration, leaderboards, or a server.

## Product boundary

The MVP covers an onboarding flow, class selection, a calibration, three adaptive missions, an evidence-led results dashboard, and exact progress recovery after refresh or browser closure. The intended session length is 25-35 minutes.

The assessment has five developmental content bands: Classes 3-4, 5-6, 7-8, 9-10, and 11-12. Norm selection remains exact to the learner's chosen class within its band. Each completed session is a projection using provisional expert-authored reference distributions; AXIOM must never present it as a validated global rank.

## Experience and visual system

The application defaults to a dark slate-and-cyan cinematic interface that reads as a serious scientific instrument. It avoids childish gamification, noisy decoration, and transient layout changes.

The assessment viewport has a locked shell:

- A persistent top bar identifies AXIOM and local-save state.
- A fixed left mission rail provides orientation on desktop.
- A stable bottom action bar contains the response action and save indicator.
- Mission prompt content changes inside the center panel without moving primary controls.
- On narrow screens, the rail collapses but the top and action bars remain stable.

Charts use Recharts and preserve exact plotted values, readable labels, responsive dimensions, and accessible text alternatives. Charts must not use motion that hides or changes values.

## Assessment content

The five scenario frameworks are fictional and universal:

1. City mobility network
2. Water resilience system
3. Food and habitat intelligence
4. Digital safety and data routing
5. Orbital research station

The delivered assessment chooses a calibration plus three missions from these frameworks using a deterministic seed. Each item is a connected decision, not a fact-recall question. Content is tailored to the developmental band while preserving the same competency intent.

Every item declares the targeted competencies, difficulty, rubric, response options, explanation, and a scenario-state contract. A scenario state holds named system attributes. The engine may only alter an attribute when an item explicitly declares that mutation; otherwise the state is copied unchanged. This protects narrative and visual continuity across connected questions.

The measured competencies are scientific reasoning, quantitative reasoning, computational thinking, engineering decisions, and systems thinking. Each selected response contributes weighted evidence to one or more of these competencies.

## Assessment engine

The assessment engine is a pure TypeScript domain layer independent of React and storage. It receives immutable catalog data and a session, then exposes deterministic functions for session creation, item selection, answer recording, mission progression, result computation, and scenario-state validation.

The calibration establishes a deterministic seed and band-appropriate first mission. The remaining mission path is selected from the learner class, calibration evidence, and seed; the same input session always produces the same next item and mission sequence. The MVP may display a pacing timer, but time is never stored as score evidence or used in ranking.

## Benchmarking and results

For each competency, AXIOM calculates the weighted raw percentage:

`rawPercent = 100 * earnedWeight / availableWeight`

It selects the learner's exact class-and-competency provisional norm `{ mean, standardDeviation }` and calculates:

`zScore = (rawPercent - mean) / standardDeviation`

`projectedScore = clamp(round(480 + 100 * zScore), 100, 900)`

The overall projection is the rounded mean of the five competency projected scores. The projected percentile is derived from the normal cumulative distribution of the overall Z-score, capped to 1-99. All results prominently use the phrases "Projected benchmark" and "Provisional reference distribution". The UI describes the result as a score projection rather than a verified global rank.

On completion the engine creates an immutable result snapshot containing: assessment version, completed time, learner class, selected mission IDs, item responses, per-item evidence, five competency raw percentages, Z-scores, projected scores, percentile, and the exact norms used. The dashboard only renders the snapshot, never recomputes a past result using updated norms.

## Persistence and recovery

`AxiomSession` is versioned JSON persisted under one local-storage key. A `useLocalStorage` hook owns safe serialization, parsing, validation, migration, write errors, and reset. `AxiomSessionProvider` uses that hook and is the only React-level owner of mutable session state.

The session is saved after learner profile edits, every answer, every navigation transition, and completed snapshot creation. The header visibly reports `Saved locally` when the most recent persistence operation succeeds, or an explicit non-destructive warning if browser storage is unavailable.

At startup, the persistence layer validates unknown data before exposing it. It migrates supported older versions into the current session shape. If the stored record is invalid or unreadable, it removes only the corrupt session record, starts a clean session, and preserves any independently readable learner profile. A learner can reset the local session only after an explicit confirmation.

## Dashboard

The dashboard is an evidence console, not a leaderboard. It contains:

- Global projection: standardized score, percentile band, chosen class norm reference, and provisional-data disclaimer.
- Competency signal map: five exact competency results rendered in Recharts.
- Mission evidence: each decision, the selected intervention, and the competency evidence it supplied.
- Growth signal: one deterministic next-step recommendation based on the lowest competency score.
- Session controls: resume incomplete session, view completed result snapshot, start a new session, and erase local data after confirmation.

## Technology and accessibility

The browser-only app uses React, TypeScript, Vite, React Context, localStorage, and Recharts. It has no backend endpoint, authentication, database, network API, telemetry, or runtime data fetch.

All controls are keyboard usable and use native semantic elements. Color never carries meaning alone. The dark palette meets readable contrast requirements. The user can reduce motion through their OS preference. The app remains usable at 320px wide and provides clear screen-reader labels for all charts and critical save/projection information.

## Error handling

An invalid answer target, unavailable item, illegal scenario transition, missing norm, invalid stored session, or persistence failure must produce a safe visible state rather than silently emit an incorrect score. Result calculation refuses to create a snapshot if it cannot calculate all five competency scores against exact class norms.

## Validation requirements

Automated tests must cover:

- Standard-score calculation, rounding, and 100-900 clamping.
- Exact class and competency norm selection and missing-norm rejection.
- Deterministic adaptive mission selection.
- Weighted evidence calculation and immutable completed snapshots.
- Scenario continuity, including rejection of undeclared changes.
- localStorage parsing, migrations, unavailable-storage handling, and corrupt-session recovery.
- Provider persistence on a response and hydration after a simulated reload.
- Dashboard projection labels, disclaimer, and evidence rendering.
- A browser journey covering class selection, an answer, refresh/resume, completion, and local reset confirmation.

## Explicit exclusions

The MVP excludes multi-learner device support, data synchronization, administration dashboards, real normative datasets, verified international rankings, parental reporting, content authoring tools, real-world regional imagery, and score effects based on answer speed.
