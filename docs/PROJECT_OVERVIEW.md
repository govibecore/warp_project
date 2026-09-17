# WARP - Close the Gap
## Project Overview & Architecture Report

### 1. Project Description
**WARP** is a next-generation educational diagnostic platform engineered to precisely evaluate and map a student's underlying cognitive abilities. Unlike traditional assessments that rely on raw percentage scores or rote memorization, WARP utilizes a **3-Parameter Logistic Item Response Theory (3PL IRT)** engine paired with **Computerized Adaptive Testing (CAT)**. It dynamically measures true student capability (represented as `theta` or θ) across multidimensional domains. The platform's assessment models are rigorously calibrated against top-tier global frameworks, including **NGSS SEP, PISA 2025, and India NCF 2023**.

Designed with strict adherence to a "Nordic Lagom" philosophy—prioritizing calm, restraint, sharp architectural geometry, and cinematic telemetry—WARP provides a distraction-free environment. It deliberately eschews addictive gamification (no streaks, confetti, or artificial rewards) in favor of deep, meaningful psychometric measurement.

### 2. Shaping the Future: Empowering Students and Parents
In today's rapidly evolving technological landscape driven by AI, automation, and complex systems, traditional education metrics are becoming obsolete. Knowing *what* a child has memorized is less critical than knowing *how* they think. 

WARP empowers families and educators by:
- **Pinpointing Cognitive Strengths & Gaps**: Instead of a generic "B+" in science, parents see high-fidelity mappings of specific skills like *Systems Thinking*, *Mathematical Reasoning*, and *Scientific Inquiry*.
- **Future-Proofing Capability**: By aligning with PISA 2025 and NGSS, WARP prepares students for the exact problem-solving paradigms required by emerging tech industries.
- **Actionable AI-Driven Insights**: Leveraging secure Generative AI, the platform translates dense statistical psychometrics into clear, plain-language reports. Parents receive concrete, personalized strategies to help their children "close the gap" and become global champions in their respective fields.

### 3. System Architecture
WARP is built on a modern, secure, and privacy-first technology stack:

- **Frontend Application**: Built with **React 18** and **Vite**, styled using **Tailwind CSS**. The UI adheres to a strict Lagom contract (`--radius: 0px`, hairline borders, muted mineral palettes, and Fjord Cyan accents) to ensure cognitive focus and WCAG 2.2 accessibility.
- **Backend & Database**: Powered by **Supabase (PostgreSQL)**. 
- **Security & Privacy (DPDP Compliant)**: 
  - **RLS Consent Gating**: All database access is gated by strict Row-Level Security policies requiring `consent_status='verified'`.
  - **Server-Authoritative CAT**: The client cannot spoof ability estimates. `theta` is recalculated securely on the server via PostgreSQL RPCs on every response.
  - **Non-Enumerable Sharing**: Reports are shared using cryptographically secure, timed tokens.
- **AI Edge Infrastructure**: AI insights are generated via **Supabase Edge Functions** calling **OpenRouter** models. API keys are strictly vaulted, and PII (Personally Identifiable Information) is aggressively stripped before sending payloads. Provider routing rules enforce zero data-retention policies.
- **Offline & Sync Resilience**: Includes robust network degradation handlers and local caching while ensuring sensitive IRT item parameters never leak to the client.

### 4. Core Use Cases

#### 4.1. The Student Adaptive Assessment (CAT)
A student initiates an assessment in a calm, focused interface. As they answer scenario-based questions, the 3PL IRT engine recalculates their latent ability in real-time. The server dynamically routes them to the next optimal question—ensuring the test is never too easy (causing boredom) or too hard (causing frustration), maximizing measurement precision in exactly 30 questions.

#### 4.2. Parent Psychometric Reporting
Upon test completion, parents are presented with a dual-audience report. They receive a visual radar chart mapping the student's abilities across five key STEAM domains. Secure AI models generate tailored narratives highlighting cognitive strengths and identifying specific developmental areas.

#### 4.3. Secure Institution & Tutor Sharing
Parents can generate secure, time-limited access tokens for specific reports to share with schools or private tutors. These tokens are evaluated server-side by security-definer RPCs, ensuring anonymous or unauthorized actors cannot enumerate or harvest student data.

#### 4.4. Administrative Cohort Analytics
Administrators and educational researchers can access aggregated, anonymized overviews to evaluate cohort-level performance, test item discrimination parameters, and systemic educational trends without compromising individual student privacy.
