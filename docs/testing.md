# Testing Strategy

WARP employs a dual testing strategy using Vitest for fast, localized unit and domain tests, and Playwright for end-to-end (E2E) browser interactions.

## Unit Testing (Vitest)

Unit tests are colocated with the source files in `src/` (e.g., `scoring.test.ts`, `session.test.ts`, `Assessment.test.tsx`).
- **Configuration**: Defined in `vitest.config.ts`. It uses `jsdom` as the test environment to support React component testing without a real browser.
- **Scope**: Focuses heavily on the domain logic (`src/domain/`), ensuring the scoring algorithms, percentiles, and state reducers work perfectly before hitting the UI. React component tests use `@testing-library/react`.
- **Execution**: Run via `pnpm test`.

## End-to-End Testing (Playwright)

End-to-End tests are located in the `e2e/` folder.
- **Configuration**: Defined in `playwright.config.ts`. It uses a local dev server running on port 4173. Tests are configured to run primarily on the Chromium engine.
- **Scope**: Simulates real user flows, ensuring that the offline persistence works across page reloads, that the UI responds to clicks, and that the progression from onboarding to the results dashboard functions correctly.
- **Execution**: Run via `pnpm e2e`.

## Continuous Integration
Both test suites can be run in a CI pipeline using `pnpm test -- --run` and `pnpm run e2e`. Ensure the Playwright browser binaries are installed (`pnpm exec playwright install chromium`) beforehand.
