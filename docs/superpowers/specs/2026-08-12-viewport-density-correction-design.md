# AXIOM viewport-density correction

## Problem

The onboarding screen overflows vertically at ordinary desktop browser heights and display scaling. Its full-height, vertically centered grid contains a title and form whose combined height exceeds the space below the fixed header. The current single mobile breakpoint also leaves short desktop and tablet viewports without density rules.

## Goal

Keep every primary action and disclosure visible without scrolling at practical desktop sizes, while retaining AXIOM's dark, precise, applied-benchmark character. The interface must remain usable without horizontal overflow from 320 CSS pixels upward.

## Layout rules

* The header remains visually stable but uses compact, responsive inline padding and a bounded height.
* The onboarding screen uses `100dvh`-aware available space and bounded block padding. It may scroll when a viewport is physically too short, but it must not hide the submit action or fine print behind the fold at normal laptop and desktop heights.
* The onboarding content column is capped at approximately 30rem. The title uses a restrained responsive scale rather than the current 6rem maximum.
* Inputs, selects, and buttons use a compact shared control height. The primary action retains its intrinsic width on wide screens and becomes full-width only on narrow screens.
* Tablet and short-height media queries reduce vertical gaps, title size, and content padding before the mobile layout activates.

## Cross-view consistency

* Assessment and results inherit the same viewport-safe padding and compact control rhythm.
* The assessment action bar remains reachable above the viewport edge and its content cannot collide with the mission rail.
* Tables, charts, answer cards, and dashboard actions remain inside their containers at tablet and mobile widths.
* Existing shadcn token values, including the zero radius, remain unchanged. This work changes spatial rules and component usage only.

## Accessibility and resilience

* Keyboard focus treatment and semantic form controls remain unchanged.
* No fixed height may clip text, focus rings, the footer action, or form disclosures.
* Reduced-motion behavior remains intact.

## Verification

* Add a regression test that asserts the compact onboarding shell and primary action render with the intended responsive hooks.
* Run the unit suite and production build.
* Run Playwright journeys at 1280x720, 1440x900, 768x1024, and 390x844. Confirm no horizontal page overflow, visible primary controls, and persistence after a refresh.
