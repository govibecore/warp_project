# AGENTS.md — WARP Engineering & Design System Laws

> **CRITICAL REPOSITORY DIRECTIVES**
> Every AI agent, engineer, and tool working in this repository MUST strictly follow these rules without exception.

---

## 1. Package Manager Contract

- **`pnpm` exclusively.**
- It is strictly **FORBIDDEN** to use `npm` or `yarn` for installation, script execution, or dependency resolution.
- Always execute commands using `pnpm` (e.g., `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm add`).

---

## 2. Sharp Geometry Contract (Zero Curved Lines)

- **`--radius: 0px` globally.**
- All surfaces, cards, buttons, badges, inputs, dialogs, popovers, dropdowns, and media frames meet at crisp 90-degree corners.
- **NEVER** use Tailwind rounded utility classes:
  - ❌ Forbidden: `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`.
  - ✅ Required: `rounded-none` or omit radius utilities so elements inherit `--radius: 0px`.
- The spacetime grid of WARP is strictly angular and architectural.

---

## 3. Nordic Lagom Elevation & Aesthetic Contract

- **Lagom Principle:** *"Not too much, not too little."* Prioritize calm, restraint, legibility, and psychometric credibility.
- **Hairline Elevation:** Depth is created through whitespace, alignment, and a single **1px hairline border** (`1px solid var(--border)`).
- **Prohibited Effects:**
  - ❌ **NO drop shadows** (except subtle 1px border elevation on hover).
  - ❌ **NO glowing neon halos**, bloom filters, or sci-fi console aesthetics.
  - ❌ **NO `backdrop-filter: blur()`** or translucent frosted glassmorphism.
  - ❌ **NO confetti, gaming streaks, or artificial reward animations.**
- **Color Strategy:**
  - Light mode (Daytime Mineral Paper: `oklch(0.982 0.006 205)`) is the primary standard.
  - Dark mode (Twilight Mineral Slate: `oklch(0.215 0.022 235)`) is the low-glare evening standard.
  - One primary interactive accent: **Fjord Cyan** (`oklch(0.52 0.14 215)` light / `oklch(0.74 0.16 215)` dark).
  - Fixed 5-domain STEAM competency spectrum: `--chart-1` through `--chart-5`. Never alter this ordering.

---

## 4. Typography Hierarchy

- **Headings & Prominent Numbers:** Space Grotesk Variable (`--font-display`).
- **Body & General UI:** Inter Variable (`--font-sans`).
- **Tabular Data, Timers, Metadata, Coordinates:** JetBrains Mono Variable (`--font-mono`). Apply `.tabular` for numerical alignment.
- Headings use weight 500–600. Avoid 800+ ("loud screaming").

---

## 5. Approved Component Registries & Ecosystem

- Use components and blocks strictly from:
  1. **shadcn/ui** (base accessible primitives).
  2. **Ali Imam Design System** (`old.aliimam.in` / `@aliimam` / `@designali`):
     - `Header03` (minimalist nav).
     - `BentoGrid` (sharp grid layouts).
     - `DotPattern` and `GridPattern` (subtle mathematical textures).
     - `CounterNumber` (numerical transitions).
     - `Accordion` (semantic hairline disclosures).
     - `Typewriter` (subtle decoding text).
- Use curated SVG geometric vectors and icons from the Ali Imam library.

---

## 6. Illustration & Visual Assets Art Direction

- **Technical Blueprint & Editorial Line-Art:**
  - Fine-line isometric and technical schematics depicting psychometrics, coordinate grids, and ability branching.
  - Warm mineral paper backgrounds with hairline drafting marks and coordinate annotations.
  - Muted Fjord Cyan and mineral secondary accents.
  - Framed strictly in sharp 0px hairline boxes. No rounded photo borders.

---

## 7. Psychometric Integrity & Security

- WARP is an educational diagnostic instrument calibrated against **NGSS SEP, PISA 2025, and India NCF 2023**.
- Guest mode is deprecated. All sessions run through authenticated profiles.
- Registered accounts authenticate via Supabase.
- Never weaken data privacy, non-enumerable token policies, or RLS security patterns.
