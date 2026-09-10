# AXIOM Viewport Density Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AXIOM's onboarding, assessment, and dashboard reliably fit common viewport heights and widths without losing the dark benchmark character.

**Architecture:** Preserve assessment behavior and compact the existing component layouts in CSS. Add stable test hooks, then test the rendered page at target viewports rather than inferring fit from unit tests.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest, Playwright.

## Global Constraints

* Preserve the exact light and dark OKLCH token values, including `--radius: 0`.
* Do not change local-storage keys, scoring logic, learner data, or assessment copy.
* Support from 320 CSS pixels wide upward with no horizontal page overflow.
* Keep keyboard focus and reduced-motion rules intact.
* Verify 1280x720, 1440x900, 768x1024, and 390x844 in Playwright.

---

### Task 1: Add viewport regression coverage

**Files:**
* Modify: `src/App.test.tsx`
* Modify: `e2e/assessment.spec.ts`

**Interfaces:**
* Consumes: `App` renders onboarding before a profile is saved.
* Produces: `data-testid="onboarding-shell"` and `data-testid="onboarding-submit"` for layout assertions.

- [ ] **Step 1: Write the failing unit test**

```tsx
expect(screen.getByTestId('onboarding-shell')).toBeInTheDocument();
expect(screen.getByTestId('onboarding-submit')).toHaveTextContent(/begin calibration/i);
```

- [ ] **Step 2: Run it to verify red**

Run `pnpm test -- --run src/App.test.tsx`. Expected: FAIL because the hooks do not exist.

- [ ] **Step 3: Write the failing browser viewport loop**

```ts
for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`keeps onboarding controls inside ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByTestId('onboarding-submit')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
```

- [ ] **Step 4: Run it to verify red**

Run `pnpm exec playwright test e2e/assessment.spec.ts --project=chromium --reporter=list`. Expected: FAIL because the hooks do not exist.

- [ ] **Step 5: Commit the red tests**

Run `git add src/App.test.tsx e2e/assessment.spec.ts; git commit -m "test: cover AXIOM viewport density"`.

### Task 2: Apply compact viewport-safe layout rules

**Files:**
* Modify: `src/components/Onboarding.tsx`
* Modify: `src/styles/global.css`

**Interfaces:**
* Consumes: Regression selectors from Task 1.
* Produces: An onboarding flow whose title, controls, action, and disclosure fit normal desktop and mobile viewports.

- [ ] **Step 1: Add minimal test hooks**

```tsx
<main className="onboarding" data-testid="onboarding-shell">
  <Button data-testid="onboarding-submit" type="submit">Begin calibration</Button>
</main>
```

- [ ] **Step 2: Add bounded-density CSS**

```css
.onboarding { width: min(30rem, calc(100% - 2rem)); min-height: calc(100dvh - var(--header-height)); padding-block: clamp(1.5rem, 4vh, 3rem); }
.onboarding h1 { font-size: clamp(2.75rem, 7vw, 4.5rem); }
@media (max-height: 760px) and (min-width: 701px) { .onboarding { align-content: start; padding-block: 1.5rem; } }
```

Extend the same bounded padding and wrapping approach to header, assessment action bar, dashboard grid, and tablet/mobile media rules without changing their content.

- [ ] **Step 3: Verify green**

Run `pnpm test -- --run src/App.test.tsx` and `pnpm exec playwright test e2e/assessment.spec.ts --project=chromium --reporter=list`. Expected: PASS.

- [ ] **Step 4: Commit the implementation**

Run `git add src/components/Onboarding.tsx src/styles/global.css src/App.test.tsx e2e/assessment.spec.ts; git commit -m "fix: compact AXIOM viewport layouts"`.

### Task 3: Full verification

**Files:** Verify only.

**Interfaces:**
* Consumes: Tasks 1 and 2.
* Produces: Evidence that compact layouts preserve the offline assessment journey.

- [ ] **Step 1: Run full validation**

Run `pnpm install --frozen-lockfile; pnpm test -- --run; pnpm run build; pnpm exec playwright test --project=chromium --reporter=list`.

Expected: all commands succeed; the existing JavaScript chunk advisory is acceptable.

- [ ] **Step 2: Inspect the 1280x720 screenshot**

Use Playwright to capture the onboarding screen. Confirm its fine print and primary action remain visible without horizontal scroll.

- [ ] **Step 3: Confirm a clean commit state**

Run `git status --short`. Expected: no output.
