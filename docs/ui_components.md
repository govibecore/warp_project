# UI Components & State Management

AXIOM's UI is built with React 18, utilizing functional components and Tailwind CSS v4. State is strictly managed by domain logic but injected into the React tree via the Context API.

## State Management (`src/context/AxiomSessionContext.tsx`)

The UI does not hold core business state natively; it wraps the `sessionReducer` inside a `useReducer` hook.
- **Provider**: `AxiomSessionProvider` initializes the session from `localStorage` on the first render.
- **Actions**: Provides high-level dispatch methods (`setProfile`, `answer`, `undo`, `complete`, `startNew`) to child components without exposing the raw dispatch loop.
- **Persistence Hooks**: `useLocalStorage` is triggered via `useEffect` to autosave on every mutation.

## Core Component Flow (`src/App.tsx`)

The root `App` component acts as a router based on `session.phase`. Since this is a pure offline app without external URLs, routing is entirely state-driven:
1. `landing`: Renders `Landing.tsx`.
2. `onboarding`: Renders `Onboarding.tsx` to collect the learner's profile.
3. `assessment`: Renders `Assessment.tsx`.
4. `results`: Renders `Dashboard.tsx`.

Transitions between these phases are animated using `motion/react` (`AnimatePresence`).

## Key Screens

### 1. Assessment View (`src/components/Assessment.tsx`)
This is the core interactive interface where the learner resolves scenarios.
- **Dynamic Questions**: Pulls `item` from `session.plan` based on the sequence.
- **Progress Tracking**: Sidebar visualizes the active mission and a progress bar mapping locked answers.
- **Accessibility & UX**: Supports keyboard navigation (A/B/C/D keys + Enter to lock) and utilizes shadcn/ui components for smooth interactions.

### 2. Results Dashboard (`src/components/Dashboard.tsx`)
After the assessment is completed, the user views their generated benchmark.
- **Executive Summary**: Displays the global score and basic profile.
- **Competency Chart**: Visualizes performance across the 5 STEM competencies using `Recharts` (`CompetencyChart.tsx`).
- **Action Plan**: Identifies the strongest and weakest competencies to offer immediate next steps.
- **International Standings**: Maps the learner's percentile against configured regions.
- **Print Layout**: Includes `print:` tailwind modifiers so the dashboard can be natively printed/saved as a PDF report.
