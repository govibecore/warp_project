# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 18 + Tailwind CSS v4 + Convex + Clerk + OpenAI

## Users

Students in Classes 3–12 taking a STEM competency assessment, and their parents and teachers who read the resulting benchmark report.

## Product Purpose

AXIOM is a STEM competency assessment that uses linked, fictional systems scenarios to generate a projected benchmark across five competencies — scientific inquiry, computational thinking, engineering design, mathematical reasoning, and systems thinking. Each of the 30 items is band-differentiated across five developmental bands (Classes 3–4, 5–6, 7–8, 9–10, 11–12), so a Class 3 learner and a Class 12 learner never see the same question text. Distractors are designed to diagnose canonical misconceptions, and every item is tagged with NGSS Science & Engineering Practices, PISA 2025 competencies, and NCF 2023 stage alignment.

## Positioning

A browser-based STEM benchmark tool that students can start in under a minute. Guest mode lets a student take the full assessment with results saved locally; a registered account adds cloud sync, written narrative reports, a dashboard with assessment history, and a public leaderboard. The assessment is grounded in real curriculum standards (NGSS, PISA 2025, NCF 2023) and common-misconception research.

## Operating Context

Used by students (Classes 3–12) directly in the browser. Guest mode stores progress in `localStorage`; registered accounts sync to Convex. The assessment is a fixed-length 30-item instrument (5 calibration + 25 mission items across 5 STEM missions) with a per-difficulty time limit. Reports include competency scores, regional percentile standings, a response transcript with misconception feedback, and an AI-generated narrative analysis.

## Capabilities and Constraints

- **Capabilities:** 30-item band-differentiated assessment (150 variants total), misconception-diagnosed distractors, standards-aligned items (NGSS/PISA/NCF), cloud-synced history, AI narrative reports, public leaderboard, account/data deletion, print-to-PDF reports.
- **Constraints:** Browser-based. Guest mode is local-only (no AI report, no cloud sync). Registered mode requires Clerk authentication and a Convex backend. AI report generation is rate-limited per user per day.

## Brand Commitments

Uses the Nordic Lagom Design System — a restrained, light-first system with one accent colour (Fjord), warm-paper neutrals, OKLCH tokens for light and dark themes, and a single hairline for elevation. No glassmorphism, no stacked shadows, no decorative motion. Documented in `DESIGN.md`.

## Evidence on Hand

The assessment uses provisional expert-authored reference distributions for score projection (`normVersion: 'provisional-2026.08'`). Item content is grounded in published STEM education research: NGSS Appendix F (Science & Engineering Practices), the PISA 2025 Assessment and Analytical Framework, India's NCF 2023 stage structure, and common-misconception literature in science and data education.

## Product Principles

1. **Measurement over motivation.** No streaks, no badges, no confetti. A score, an explanation, and a next step.
2. **Age-appropriate rigour.** A Class 3 student sees language and numeracy calibrated to their band; a Class 12 student sees the same competency assessed at Olympiad depth. Same instrument, different floor.
3. **Formative, not just summative.** Every designed-wrong answer carries a misconception tag that surfaces in the report, so the student learns what tripped them up — not just that they missed it.
4. **Standards-grounded.** Every item carries NGSS SEP and PISA 2025 competency tags, auditable in the data-quality test suite.
5. **Privacy is real.** Assessment data is encrypted in transit and at rest. Account and history can be deleted permanently from the dashboard. Guest mode never leaves the device.
