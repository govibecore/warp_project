# Nordic Lagom Design System

> _"Lagom"_ - not too much, not too little. The right amount.

A design system for WARP, a STEM competency assessment platform for students in Classes 3–12. The system prioritises legibility, calm, and trust. It is not decorative.

---

## 1. Philosophy

**Restraint over decoration.** A student taking a timed assessment does not need confetti. A parent reading a report does not need glassmorphism. The design system uses one accent colour, warm-paper neutrals, and a single hairline for elevation. Everything else is typography and space.

**Light is primary.** The scene is a student at a desk in daytime, a parent reading a printed report, a classroom projector. Dark mode is a complete second theme for evening and low-glare use - not an afterthought override.

**Depth from alignment, not shadow.** No stacked shadows. No glow. No blur. Depth comes from whitespace, section rhythm, and a single 1px border on cards.

---

## 2. Colour

### Light theme (default)

| Token | OKLCH | Purpose |
|---|---|---|
| `--background` | `oklch(0.985 0.003 90)` | Page - warm paper |
| `--surface` | `oklch(0.968 0.004 90)` | Subtle sections |
| `--elevated` | `oklch(1 0 0)` | Cards, popovers |
| `--foreground` | `oklch(0.21 0.008 260)` | Body text |
| `--foreground-secondary` | `oklch(0.5 0.008 260)` | Captions, labels |
| `--foreground-muted` | `oklch(0.62 0.008 260)` | Placeholders |
| `--primary` (Fjord) | `oklch(0.52 0.11 230)` | The single accent - action, focus, selection |
| `--success` (Moss) | `oklch(0.55 0.1 150)` | Positive semantic |
| `--warning` (Amber) | `oklch(0.58 0.12 40)` | Caution semantic |
| `--highlight` (Terracotta) | `oklch(0.68 0.13 75)` | Attention semantic |
| `--destructive` | `oklch(0.55 0.19 25)` | Error semantic |
| `--border` | `oklch(0.9 0.005 90)` | Hairline |
| `--border-strong` | `oklch(0.82 0.007 90)` | Emphasised hairline |

### Dark theme (Nordic Night)

A complete parallel set with inverted luminance, tuned chroma for dark surfaces, and the same semantic mapping. See `src/styles/global.css` `.dark` block.

### Data visualisation tokens

Five distinguishable, contrast-safe hues for charts:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` | Fjord (primary) | Fjord light | Student's own standing / primary series |
| `--chart-2` | Moss | Moss light | Secondary series |
| `--chart-3` | Terracotta | Terracotta light | Tertiary series |
| `--chart-4` | Amber | Amber light | Quaternary series |
| `--chart-5` | Violet | Violet light | Quinary series |

**Rule:** Use `--chart-1` for the data point the user cares about (their score, their region). All other series use `--chart-2` through `--chart-5`. Never use all five at once if fewer will do.

---

## 3. Typography

Two families plus one mono:

| Token | Family | Use |
|---|---|---|
| `--font-display` | Space Grotesk Variable | Headings, scores, prominent numbers |
| `--font-sans` | Inter Variable | Body, UI, everything else |
| `--font-mono` | JetBrains Mono Variable | Tabular numbers, keyboard hints, timers |

**Scale:** Tailwind's default modular scale. No custom sizes.

**Weight:** 400 for body, 600 for emphasis, 700 for headings. Never 800 or above - it shouts.

**Tabular numerals:** Applied via the `.tabular` utility class wherever numbers appear in columns (scores, percentiles, timers, progress counts).

---

## 4. Spacing & Radius

| Token | Value | Use |
|---|---|---|
| `--radius-control` | `0` | Buttons, inputs, small chips |
| `--radius-card` | `0` | Cards, panels |
| `--radius-pill` | `0` | Badges, tags |

**Sharp geometry.** Every radius is zero. The brand's spacetime grid is angular - surfaces meet at corners, never curves. The one organic form in the brand language is the logo's sphere (the mass that warps the grid). Loading states tick a square edge (`.spinner-square`) rather than sweeping an arc.

---

## 5. Components

### Card

A surface with one hairline. It does not glow or float.

```css
.card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
}
```

Interactive variant: border darkens to `--border-strong`, background shifts to `--surface`. No scale transform, no shadow.

### Button

Three variants (`primary`, `secondary`, `ghost`), three sizes (`sm`, `default`, `lg`). Solid Fjord fill for primary; surface fill for secondary; transparent for ghost. No gradients, no glass.

### Badge

Pill-shaped, semantic-toned. Used for status (Calibration, Mission, Class level), never for decoration.

### Progress

A 4px track with a fill. Fill colour follows semantics: `--primary` for the user's own progress, `--border-strong` for neutral comparison.

### Tooltip (chart)

A plain card. No `backdrop-filter: blur()`, no `box-shadow: 0 10px 30px rgba(0,0,0,0.5)`, no `font-weight: 800`. Background is `--surface`, border is `--border`, text is `--foreground`.

---

## 6. Motion

| Token | Easing | Use |
|---|---|---|
| `--ease-lagom` | `cubic-bezier(0.2, 0, 0, 1)` | Default transitions (150–300ms) |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Enter animations |

Motion is calm, short, and single-purpose. Staggered children animate in over 50–100ms each. No bounce, no spring physics, no parallax. `prefers-reduced-motion: reduce` zeroes all durations.

---

## 7. Application Rules

1. **One accent.** Fjord is the only colour that marks action. Moss, Amber, Terracotta, and Destructive are semantics with meaning - never decoration.
2. **Hairline elevation.** Cards get `1px solid var(--border)`. No `box-shadow` except the scrollbar thumb.
3. **No glass.** No `backdrop-filter`, no `blur()`, no translucent overlays.
4. **No rainbow.** Charts use `--chart-*` tokens, not raw colour values. The primary series uses `--chart-1`; others use neutrals or the remaining chart tokens.
5. **Tabular numbers.** Scores, percentiles, timers, and progress counts use `.tabular`.
6. **Section rhythm.** Sections use `padding-block: 5rem` (3.5rem on mobile). More space above a heading than below it.
7. **Print-ready.** Reports are printed. The `@media print` block flattens to paper, drops chrome (`.no-print`), and uses black-on-white fallbacks.

---

## 8. File Map

| File | Responsibility |
|---|---|
| `src/styles/global.css` | Token definitions, base layer, composed `.card` / `.kbd` / `.section` classes |
| `src/components/ui/button.tsx` | Button component (CVA variants) |
| `src/components/ui/badge.tsx` | Badge component |
| `src/components/ui/card.tsx` | Card + EmptyState |
| `src/components/ui/progress.tsx` | Progress bar |
| `src/components/ui/spinner.tsx` | Loading spinner + SpinnerBlock |
| `src/components/ui/input.tsx` | Text input |
| `src/components/CompetencyChart.tsx` | Regional standings bar chart (Recharts, `--chart-*` tokens) |

---

_Version: 1.0 · Last updated: 2026-09-08_
