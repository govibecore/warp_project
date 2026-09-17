# Nordic Lagom Design System (2026 Edition)

> _"Lagom"_ — not too much, not too little. The right amount.

A design system for **WARP**, a STEM competency assessment platform for students in Classes 3–12. The system prioritizes legibility, calm, intellectual trust, and mathematical precision. It is strictly non-decorative.

---

## 1. Philosophy

### Restraint Over Decoration
A student solving a complex systems problem does not need confetti, particle storms, or neon halos. A parent reading an assessment report does not need glassmorphism. The design system uses one accent color, warm mineral-paper neutrals, and a single 1px hairline for elevation. Everything else is typography, grid, and space.

### Light is Primary
The primary operating environment is daytime desk study, printed parental reports, and classroom projectors. Dark mode (Twilight Mineral Slate) is a complete, low-glare second theme for evening use—never an afterthought override.

### Depth from Alignment, Not Shadow
No stacked drop shadows. No glowing neon bloom. Depth is achieved through whitespace, section rhythm, and a crisp **1px hairline border** (`1px solid var(--border)`).

### Sharp Geometry Contract
Every border radius is **`0px`**. Surfaces meet at clean 90-degree corners. Bubbly pills, rounded buttons, and curved card frames are strictly forbidden.

---

## 2. Color System

### Light Theme (Daytime & Projector Standard)

| Token | OKLCH | Purpose | WCAG Contrast |
|---|---|---|---|
| `--background` | `oklch(0.982 0.006 205)` | Page canvas (warm mineral paper) | Canvas |
| `--surface` | `oklch(0.956 0.010 205)` | Subtle sections / sub-surfaces | Layer 1 |
| `--elevated` | `oklch(1.000 0 0)` | Cards, panels, elevated surfaces | Layer 2 |
| `--foreground` | `oklch(0.24 0.03 240)` | Body text (deep mineral slate) | >12:1 (AAA) |
| `--foreground-secondary` | `oklch(0.46 0.03 235)` | Captions, secondary labels | >5.5:1 (AA) |
| `--foreground-muted` | `oklch(0.58 0.025 230)` | Placeholders, inactive hints | >4.5:1 (AA) |
| `--primary` (Fjord Cyan) | `oklch(0.52 0.14 215)` | Primary action, focus, selection | >4.5:1 (AA) |
| `--primary-foreground` | `oklch(1.000 0 0)` | Text on primary button | >4.5:1 (AA) |
| `--success` (Moss) | `oklch(0.56 0.14 150)` | Positive diagnostic outcome | >4.5:1 (AA) |
| `--warning` (Amber) | `oklch(0.62 0.15 65)` | Caution / timing threshold | >4.5:1 (AA) |
| `--highlight` (Terracotta) | `oklch(0.62 0.15 45)` | Attention / misconception callout | >4.5:1 (AA) |
| `--destructive` | `oklch(0.56 0.19 25)` | Error semantic | >4.5:1 (AA) |
| `--border` | `oklch(0.88 0.012 210)` | Hairline boundary | Non-text 3:1 |
| `--border-strong` | `oklch(0.76 0.020 215)` | Emphasized hairline / active | Non-text 3:1 |

### Dark Theme (Twilight Mineral Slate Standard)

| Token | OKLCH | Purpose | WCAG Contrast |
|---|---|---|---|
| `--background` | `oklch(0.215 0.022 235)` | Canvas — mineral slate (#18202C) | Canvas |
| `--surface` | `oklch(0.255 0.024 235)` | Inputs, sub-surface panels (#212B3A) | Layer 1 |
| `--elevated` | `oklch(0.295 0.026 235)` | Elevated cards, modals (#2A3649) | Layer 2 |
| `--foreground` | `oklch(0.95 0.010 230)` | Body text (crisp mineral white) | >13:1 (AAA) |
| `--foreground-secondary` | `oklch(0.80 0.018 230)` | Captions, secondary labels | >8:1 (AAA) |
| `--foreground-muted` | `oklch(0.66 0.022 230)` | Placeholders, inactive hints | >5:1 (AA) |
| `--primary` (Fjord Cyan) | `oklch(0.74 0.16 215)` | Luminous Fjord Cyan CTA (#38BDF8) | >10:1 (AAA) |
| `--primary-foreground` | `oklch(0.14 0.03 235)` | Deep midnight slate text on cyan | >8:1 (AAA) |
| `--border` | `oklch(0.36 0.025 235)` | Hairline boundary | Non-text 3:1 |
| `--border-strong` | `oklch(0.48 0.030 235)` | Emphasized hairline / active | Non-text 3:1 |

### 5 STEAM Competency Spectral Tokens

| Token | Light (OKLCH) | Dark (OKLCH) | Competency Domain |
|---|---|---|---|
| `--chart-1` | `0.52 0.14 215` (Glacier Cyan) | `0.74 0.16 215` | Scientific Inquiry (Ecology) |
| `--chart-2` | `0.52 0.15 270` (Cobalt Petrol) | `0.70 0.17 270` | Computational Thinking (Data) |
| `--chart-3` | `0.52 0.13 170` (Pine Teal) | `0.74 0.14 168` | Engineering Design (Infrastructure) |
| `--chart-4` | `0.60 0.15 65` (Solar Amber) | `0.80 0.14 68` | Mathematical Reasoning (Energy) |
| `--chart-5` | `0.54 0.16 315` (Aurora Amethyst) | `0.74 0.17 315` | Systems Thinking (Space) |

---

## 3. Typography

| Token | Family | Use |
|---|---|---|
| `--font-display` | Space Grotesk Variable | Headings, score callouts, prominent figures |
| `--font-sans` | Inter Variable | Body, UI controls, explanatory text |
| `--font-mono` | JetBrains Mono Variable | Tabular numbers, metadata, coordinates, timers |

- **Modular Scale:** Clean geometric scale. Sentence-case headings in weights 500–600.
- **Tabular Numerals:** Class `.tabular` (`font-variant-numeric: tabular-nums`) applied wherever numbers align vertically.

---

## 4. Spacing & Sharp Corner Geometry

| Token | Value | Applied To |
|---|---|---|
| `--radius` | `0px` | Global default |
| `--radius-control` | `0px` | Buttons, inputs, search fields |
| `--radius-card` | `0px` | Cards, modals, dialogs, drawers |
| `--radius-pill` | `0px` | Badges, tags, status indicators |

Every element has sharp rectangular edges. When elements interact, borders darken to `--border-strong` and backgrounds subtly shift. No zoom scale transforms.

---

## 5. Components & Registries

### Approved Component Foundation
- **shadcn/ui:** Clean, headless Radix primitives styled with zero border radius and 1px hairlines.
- **Ali Imam Ecosystem (`old.aliimam.in`):**
  - `Header03`: Ultra-crisp fixed navigation with brand logo, section anchors, and action CTA.
  - `BentoGrid` / `BentoGridItem`: Rectilinear layout system for competency showcase and technical features.
  - `DotPattern` / `GridPattern`: Lightweight SVG geometric backgrounds without glowing sci-fi bloat.
  - `CounterNumber`: Calm numerical transitions for stat counters.
  - `Accordion`: Semantic hairline disclosure items.
  - `Typewriter`: Subtle terminal decoding text for technical subtitles.

---

## 6. Illustration & Visual Assets

### Technical Blueprint & Editorial Line-Art
- Isometric and orthogonal technical schematics illustrating Item Response Theory (IRT), multidimensional coordinate spaces, and normative population distributions.
- Warm mineral paper canvas (`#FAFAF7`), deep charcoal drafting hairlines (`#1A1A1A`), and quiet Fjord Cyan accents.
- All media enclosed in sharp 0px 1px hairline frames.

---

_Version: 2.0 (Nordic Lagom Sharp) · Updated: September 2026_
