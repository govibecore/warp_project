# Domain Logic & Assessment Architecture

The domain layer of WARP manages the core assessment logic, state transitions, scoring, and normative data.

## Core Entities (`src/domain/types.ts`)

- **Competency**: The core evaluation dimensions (Scientific Inquiry, Computational Thinking, Engineering Design, Mathematical Reasoning, Systems Thinking).
- **EvidenceContribution**: Defines how much weight an option gives towards a specific competency.
- **AssessmentItem**: Represents a single scenario-based question, including its options, state, and developmental band.
- **ResultSnapshot**: A frozen record of a completed assessment, capturing class level, scores, responses, and regional percentiles.
- **WarpSession**: The root state object tracking the current assessment phase (`landing`, `onboarding`, `assessment`, `results`), the learner's profile, and answers.

## Session Management (`src/domain/session.ts`)

State mutations are handled centrally through the `sessionReducer`. It acts as a strict state machine transitioning between:
1. `landing`: The initial state when no user exists.
2. `onboarding`: Setup screen to collect profile info.
3. `assessment`: The active assessment containing the `AssessmentPlan` (calibration and mission items).
4. `results`: The final state displaying the `ResultSnapshot`.

The reducer captures user responses (`answerItem`) and allows reverting the last choice (`undoLastResponse`).

## Scenarios & Developmental Bands (`src/data/scenarios.ts`)

Instead of static questions, WARP defines **Mission Blueprints**. These are dynamically instantiated into `AssessmentItem`s based on the learner's class level. 

The `getDevelopmentalBand(classLevel)` function maps classes (3-12) to specific bands.
The system then appends a band-specific instruction to the prompt:
- **3-4**: Focuses on observable, safe, connected actions.
- **5-6**: Focuses on evidence and comparison.
- **7-8**: Focuses on tracing local decisions to linked parts.
- **9-10**: Focuses on trade-offs, constraints, and feedback.
- **11-12**: Focuses on uncertainty, dependencies, and second-order effects.

## Scoring & Norms (`src/domain/scoring.ts`, `src/data/norms.ts`)

### Raw Calculation
For each item, users select an option which carries `EvidenceContribution`s. 
The system tracks `earnedWeight` vs `availableWeight` for each competency.
A `rawPercent` is calculated: `(100 * total.earned) / total.available`.

### Normalization
The `rawPercent` is compared against a provisional reference distribution (`src/data/norms.ts`) to produce a Z-score.
`Z = (rawPercent - mean) / standardDeviation`
The final scaled score maps the Z-score to a 100-900 scale, centered at 480:
`score = 480 + 100 * Z`

### Regional Percentiles
WARP compares the user's overall performance against simulated regional offsets (e.g., Singapore +8, USA +3). It averages the Z-scores and uses a Normal Cumulative Distribution Function (`normalCdf`) to estimate the percentile rank for that region.
