# System Architecture & Persistence

WARP is designed as a standalone, offline-first React application targeting modern browsers. It requires zero backend infrastructure, networking APIs, or external databases post-initial load.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, integrated with shadcn/ui components (`base-lyra` preset).
- **Package Manager**: pnpm (exclusively, as enforced by `GEMINI.md`).

## Folder Structure
- `src/components/`: React UI components.
- `src/domain/`: Core business logic, types, session reducer, and scoring algorithms. Pure TypeScript without UI dependencies.
- `src/data/`: Static configurations, scenarios (blueprints for assessments), and provisional norms.
- `src/persistence/`: Abstractions for browser `localStorage`.
- `src/context/`: React Context providers binding domain logic and persistence to the component tree.
- `src/styles/`: Global CSS and Tailwind token definitions.
- `e2e/`: Playwright end-to-end tests.
- `src/test/`: Vitest setup and unit tests.

## Offline-First Persistence

Since there is no backend, all user progression and profile data is saved locally in the browser via `src/persistence/storage.ts`.
It relies on the `StorageLike` interface (mapping to `window.localStorage`).

### Stored Entities
- `warp.profile.v1`: Stores the `LearnerProfile` (Name, Class Level, Difficulty).
- `warp.session.v2`: Stores the active or completed `WarpSession` (phase, plan, responses, result snapshot).

### Hydration & Recovery
When the app loads, `loadSession` reads the storage keys.
If it finds existing data, it runs `migrateAndHydrate()`, verifying the shape of the data and applying the responses through the `sessionReducer` sequentially to ensure state integrity. If data is corrupted, it safely falls back to a clean state.
