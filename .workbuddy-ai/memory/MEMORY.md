# Project memory — axiom-mvp / WARP

Curated, long-term notes. Daily logs in `YYYY-MM-DD.md`; this file holds
reusable truths that survive across sessions.

## CSS cascade trap (Tailwind v4)

Unlayered rules **always beat** layered ones, regardless of source order.
This bites in dark-themed apps:/n/n- The token block `.dark { --background: oklch(...) }` is **unlayered**
  (lives at the top of `global.css`, outside any `@layer ...` block).
- Any `@media print { .dark { --background: #fff } }` placed **inside**
  `@layer base` is layered, so the layered rule loses and the dark token
  survives to paper. The print stylesheet looks right in DevTools but
  the screenshot stays dark.
- Fix: put the print palette override **outside** `@layer base` (an
  unlayered `@media print { .dark { ... } }`) so it wins. Keep utility
  overrides (`.no-print`, `.overflow-y-auto` unclip, `body { background:/n  #fff }`) inside the layer — they don't need to beat the `.dark` block.

## Stale compiled configs shadow the real ones

`tsc` (or old tooling) can emit `vite.config.js` / `vite.config.d.ts` next to
`vite.config.ts`. **Vite loads `.js` before `.ts`**, so the stale compiled config
silently wins — aliases and plugins vanish (`Rollup failed to resolve "@/..."`,
missing Tailwind) while `tsc -b` still passes. If Vite behaviour stops matching
`vite.config.ts`, `ls vite.config.*` first and delete any `.js`/`.d.ts`/
`.timestamp-*.mjs` artifacts. Same risk applies to `playwright.config.*`.

## App conventions

- App is **dark-only on screen**; `html` has hardcoded `class="dark"` and
  `currentTheme()` in `WarpLogo.tsx` reads it.
- Logo wordmark ink: `warp-logo-dark.svg` = near-white ink (for dark
  surfaces); `warp-logo-light.svg` = navy ink (for paper / print).
- Radius tokens (`--radius-control/card/pill`) are **all zeroed** — the UI
  is fully angular, no curves. Any future rounded value comes through
  the token, so reverting is one edit.
- Print deliverable: the report page (`?assessment=...`) has a
  "Save as PDF" button. The `@media print` block in `global.css`
  provides a paper palette (outside `@layer base` — see trap above),
  hides AppShell chrome (`no-print`), unclips the scroller, and hides
  the screen-ink wordmark (`print:hidden`) in favour of the
  `print-only` light-ink wordmark.
