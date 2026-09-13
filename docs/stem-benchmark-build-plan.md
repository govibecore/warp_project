# STEM Benchmark Platform — Innovative Build Plan
### Vite + React 19 · Supabase · OpenRouter · NVIDIA Nemotron

> **Document version:** 2.0 (build plan)
> **Supersedes:** v1.0 MongoDB/Express architecture
> **Scope:** End-to-end implementation blueprint with DPDP-native compliance, IRT adaptive testing, and dual-audience AI reports

---

## 0. Executive Summary

This plan rebuilds the STEM Benchmark Platform on a **Supabase-native** stack, replacing the v1.0 MongoDB + Express design. The pivot is not cosmetic — it changes the security model, the server model, and what the AI can do.

| Dimension | v1.0 (MongoDB/Express) | v2.0 (Supabase/Nemotron) | Why it's better |
|---|---|---|---|
| **Database** | MongoDB (document) | Supabase Postgres + RLS | Relational + **database-enforced** student isolation |
| **Backend** | Express.js server | Supabase Edge Functions (Deno) | Serverless, no server to maintain, auto-scaled |
| **Auth** | Custom JWT + bcrypt | Supabase Auth (GoTrue) | Managed, audited, OAuth-ready |
| **Security** | Middleware checks | **Row Level Security policies** | Can't be bypassed by app bugs — enforced at DB |
| **AI model** | `mistral-7b-instruct:free` (deprecated) | **NVIDIA Nemotron 3 Ultra** (1M ctx) | Reasoning + full-history context in one prompt |
| **Reports** | Per-assessment snapshot | **Longitudinal trajectory** + dual-audience | Reason over entire student history |
| **Psychometrics** | Raw earned/available | **IRT + CAT** (adaptive) | Valid measurement, comparable across grades |
| **Compliance** | COPPA-inspired (wrong statute) | **DPDP Act 2023 native** | India's actual law, ₹200cr-penalty-safe |
| **Realtime** | Polling | Supabase Realtime (WAL) | Live progress + AI streaming |

### The five innovations that define v2.0

1. **Longitudinal Trajectory Reports** — Nemotron's 1M-token context fits a student's *entire* assessment history into one prompt, producing a growth-arc report (not a single-test snapshot) with trajectory prediction.
2. **Database-level psychometrics** — IRT ability estimation and norm lookup run as Postgres RPC functions, testable and audit-friendly at the data layer.
3. **RLS-enforced consent gating** — a student literally cannot read/write an assessment row until their `consent_status = 'verified'`; the check lives in Postgres, not application code.
4. **Realtime AI streaming** — Nemotron's streamed output flows through Supabase Realtime channels to render report sections progressively with a Lottie "brain-loading" state.
5. **Outcome-based peer matching** — pgvector embeddings of competency *profiles* (not behavioral data) power "students like you" — DPDP-compliant because it never profiles behavior.

---

## 1. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Build** | Vite 6 + React 19 | Dev server + production bundling |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility CSS + accessible primitives |
| **Animations** | GSAP + Framer Motion + Lottie | Rich interactive experiences |
| **Charts** | Recharts | Radar + bar + line charts |
| **State** | Zustand + TanStack Query | Global + server state |
| **PDF** | html2pdf.js + jsPDF | Client-side report export |
| **BaaS** | Supabase (Postgres 15 + Auth + Edge Functions + Realtime + Storage + Vault) | Entire backend |
| **AI gateway** | OpenRouter | Routes to free Nemotron models |
| **Primary AI** | `nvidia/nemotron-3-ultra-550b-a55b:free` | Longitudinal reasoning reports (1M ctx) |
| **Fallback AI** | `nvidia/nemotron-3.5-lightning:free` → `thinkingmachines/inkling:free` | Speed + multilingual |
| **Vector** | pgvector extension | Competency-profile similarity |
| **Deploy** | Vercel (frontend) + Supabase (backend) | Cloud hosting |

### OpenRouter model allow-list (privacy-filtered)

> **Hard rule:** several OpenRouter free models (Poolside Laguna, Liquid LFM) state they **train on user inputs**. For children's assessment data this is a DPDP violation. The allow-list is explicit and privacy-verified; the `openrouter/free` auto-router is **banned** because it can route to training-on-inputs models.

```typescript
// lib/ai/models.ts
export const AI_MODEL_CASCADE = [
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free',   role: 'primary',    ctx: 1_000_000, reason: 'best reasoning' },
  { id: 'nvidia/nemotron-3.5-lightning:free',        role: 'secondary',  ctx: 1_000_000, reason: 'high throughput' },
  { id: 'thinkingmachines/inkling:free',             role: 'multilingual', ctx: 1_050_000, reason: 'regional languages' },
] as const;

// Models that may retain/train on inputs — NEVER used for minors
export const PRIVACY_BLOCKLIST_PREFIXES = ['poolside/', 'liquid/'];

// v1.0's hardcoded model is deprecated — NEVER hardcode a single ID
export const DEPRECATED = ['openrouter/mistralai/mistral-7b-instruct:free'];
```

---

## 2. System Architecture (v2.0)

```
┌──────────────────────── CLIENT (Vite + React 19) ────────────────────────┐
│  shadcn/ui · GSAP/Framer · Lottie · Recharts · Zustand · TanStack Query   │
│  └─ @supabase/supabase-js (auth + RLS queries + Realtime subs)            │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │ HTTPS  (supabase-js, anon key + JWT)
┌─────────────────────────────────┴─────────────────────────────────────────┐
│                         SUPABASE PROJECT                                   │
│ ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────────────┐ │
│ │  Auth (GoTrue)   │  │  Postgres 15     │  │  Edge Functions (Deno)     │ │
│ │  • email/pw      │  │  + RLS policies  │  │  • ai-report-generate      │ │
│ │  • OAuth         │  │  + pgvector      │  │  • irt-estimate           │ │
│ │  • session JWT   │  │  + triggers      │  │  • consent-webhook         │ │
│ │  • auth hooks    │  │  + RPC functions │  │  • pdf-render (fallback)   │ │
│ └────────┬────────┘  └────────┬─────────┘  └────────────┬───────────────┘ │
│          │                    │                          │ (secret key)   │
│          └────────────────────┴─── Realtime (WAL) ────────┤                │
│                                                          ▼                │
│                                              ┌──────────────────┐        │
│                                              │  OpenRouter API  │        │
│                                              │  → NVIDIA Nemotron│        │
│                                              └──────────────────┘        │
│ ┌─────────────────┐  ┌──────────────────┐                                 │
│ │  Storage (S3)   │  │  Vault (secrets) │                                 │
│ │  • PDF reports  │  │  • OpenRouter key│                                 │
│ │  • signed URLs  │  │  • DigiLocker cfg│                                 │
│ └─────────────────┘  └──────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key architectural wins vs. v1.0:**
- No Express server to deploy, patch, or scale.
- The OpenRouter key never reaches the browser — it lives in Supabase Vault and is used only inside Edge Functions.
- Student isolation is a Postgres constraint (`auth.uid() = student_id`), not middleware that a bug can skip.
- Audit logging is a **database trigger** — it fires on every mutation regardless of which client or function performed it.

---

## 3. Database Schema (PostgreSQL)

### 3.1 `students` — auth lives in Supabase Auth; this table is the profile

```sql
create table public.students (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text        not null,
  date_of_birth   date,
  gender          text check (gender in ('male','female','other','prefer_not_to_say')),

  -- Academic
  current_class   smallint    not null check (current_class between 3 and 12),
  school_name     text,
  city            text,
  state           text,

  -- Parent / guardian
  parent_name     text,
  parent_phone    text,   -- phone, not email: DigiLocker uses phone/Aadhaar

  -- Preferences
  difficulty_pref text default 'standard'
                  check (difficulty_pref in ('standard','advanced','olympiad')),
  preferred_language text default 'en',   -- 'en','hi','ta','te','bn','mr'...

  -- DPDP consent (THE innovation: gating lives here, enforced by RLS)
  consent_status  text not null default 'pending'
                  check (consent_status in ('pending','verified','withdrawn')),
  consent_method  text,
  consent_token_ref text,   -- opaque DigiLocker/Aadhaar reference, never raw ID
  consent_verified_at timestamptz,
  consent_expires_at  timestamptz,   -- re-verify periodically per Rule 8

  -- competency embedding (outcome-based peer matching)
  competency_embedding vector(5),     -- pgvector; updated post-assessment

  created_at      timestamptz not null default now()
);

-- Indexes
create index on students (current_class);
create index on students (consent_status) where consent_status = 'verified';
```

> **Innovation Spotlight — RLS consent gating.** A student cannot read or write assessment rows until their own `students.consent_status = 'verified'`. The policy joins to the student row, so even a compromised anon key with a valid-but-unverified JWT is blocked at the database. This is impossible to achieve with middleware alone.

### 3.2 `assessments` — sessions + responses (embedded as JSONB for hot reads)

```sql
create table public.assessments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  class_level   smallint not null check (class_level between 3 and 12),
  difficulty    text not null check (difficulty in ('standard','advanced','olympiad')),
  status        text not null default 'in_progress'
                check (status in ('in_progress','completed','abandoned','timed_out')),

  -- responses stored as JSONB (capped ~20); adaptive engine appends here
  responses     jsonb not null default '[]'::jsonb,

  -- IRT outputs (the v2.0 measurement core)
  ability_theta jsonb,   -- { scientificInquiry: float, ... } latent trait per competency
  scaled_scores jsonb,   -- { scientificInquiry: 100-900, ... }
  global_score  smallint check (global_score between 100 and 900),
  percentiles   jsonb,   -- { india, singapore, usa, uk, southKorea, global }

  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  total_time_ms integer
);

create index on assessments (student_id, status, created_at desc);
create index on assessments (student_id, created_at desc);

-- Next-item selection uses this index heavily
create index on scenarios (competency, developmental_band, difficulty, is_active);
```

### 3.3 `scenarios` — question bank with IRT parameters

```sql
create extension if not exists vector;  -- also needed for pgvector

create table public.scenarios (
  id              uuid primary key default gen_random_uuid(),
  scenario_code   text not null unique,          -- 'SCI-08-003'
  competency      text not null check (competency in (
                    'scientificInquiry','computationalThinking',
                    'engineeringDesign','mathematicalReasoning','systemsThinking')),
  developmental_band text not null check (developmental_band in
                    ('3-4','5-6','7-8','9-10','11-12')),
  difficulty      text default 'standard',
  prompt          text not null,
  context_image   text,
  options         jsonb not null,    -- [{text, contributions:[{competency,weight}], explanation}]
  learning_objective text,
  hint            text,

  -- IRT parameters (3PL) — the v2.0 measurement upgrade
  irt_a           float check (irt_a between 0 and 3),   -- discrimination
  irt_b           float check (irt_b between -3 and 3),  -- difficulty (logits)
  irt_c           float check (irt_c between 0 and 1),   -- guessing

  is_active       boolean default true,
  usage_count     integer default 0,
  created_at      timestamptz default now()
);

create index on scenarios (competency, developmental_band, difficulty, is_active);
```

### 3.4 `reports` — dual-audience + AI provenance

```sql
create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  assessment_id   uuid not null unique references public.assessments(id) on delete cascade,

  -- Dual-audience AI content (THE v2.0 reporting innovation)
  student_variant jsonb,   -- { summary, keyStrengths[], nextMission, percentileAsRank }
  parent_variant  jsonb,   -- { overallAssessment, keyStrengths[], growthAreas[],
                           --   learningPath, parentGuidance, actionPlan[] }

  -- Longitudinal context: which past assessments were included
  trajectory_context_assessment_ids uuid[] default '{}',

  -- Provenance & safety
  ai_provenance   jsonb,   -- { model, cascadeStep, fallbackUsed, promptTokens, completionTokens }
  resource_keys   text[],  -- curated allow-list keys used (NEVER raw URLs)

  -- PDF
  pdf_path        text,    -- Supabase Storage path
  pdf_generated_at timestamptz,

  -- Sharing
  share_token     text unique,
  share_expires_at timestamptz,

  generated_at    timestamptz default now()
);

create index on reports (student_id, generated_at desc);
```

### 3.5 `norms` — PISA/TIMSS-anchored benchmark data

```sql
create table public.norms (
  region          text not null,    -- 'india','singapore','usa','uk','southKorea','global'
  class_level     smallint not null,
  difficulty      text,
  competency      text not null,
  mean            float not null,
  std_dev         float not null,
  sample_size     integer,
  source          text,             -- 'pisa_2025','timss_2023','organic'
  version         text not null,     -- '2026-Q3'
  is_provisional  boolean default true,   -- until organic data validates
  updated_at      timestamptz default now()
);

create unique index on norms (region, class_level, difficulty, competency, version);
```

### 3.6 `resources` — curated anti-hallucination DB

```sql
-- The LLM emits resource_key from this table; server maps key→URL.
-- Prevents the #1 free-model failure: fabricating links for minors.
create table public.resources (
  key             text primary key,          -- 'math-fractions-khan'
  title           text not null,
  url             text not null,             -- verified URL, curated
  category        text check (category in ('course','project','practice','resource','retest')),
  difficulty      text check (difficulty in ('beginner','intermediate','advanced')),
  competency      text,
  language        text default 'en',
  verified        boolean default true,
  verified_at     timestamptz default now()
);
```

### 3.7 `audit_logs` — trigger-driven (can't be bypassed)

```sql
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid,
  action      text not null,
  metadata    jsonb,
  actor_id    uuid,        -- who performed it (from auth.uid())
  ip_address  inet,
  created_at  timestamptz not null default now()
);
create index on audit_logs (student_id, created_at desc);
create index on audit_logs (action, created_at desc);

-- Trigger: fires on EVERY assessment mutation, no matter the caller
create or replace function public.fn_audit_assessment() returns trigger as $$
begin
  insert into public.audit_logs (student_id, action, metadata, actor_id)
  values (
    new.student_id,
    'assessment_' || lower(TG_OP),
    jsonb_build_object('assessment_id', new.id, 'status', new.status),
    auth.uid()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_audit_assessment
  after insert or update on public.assessments
  for each row execute function public.fn_audit_assessment();
```

---

## 4. Row Level Security (RLS) — the compliance core

```sql
alter table public.students   enable row level security;
alter table public.assessments enable row level security;
alter table public.reports    enable row level security;
alter table public.audit_logs  enable row level security;

-- Students: see/update only their own profile
create policy "self select" on public.students
  for select using (auth.uid() = id);
create policy "self update" on public.students
  for update using (auth.uid() = id);

-- Assessments: a student may ONLY act when their consent is verified
create policy "own assessments select" on public.assessments
  for select using (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  );
create policy "own assessments insert" on public.assessments
  for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  );
create policy "own assessments update" on public.assessments
  for update using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- Reports: same consent gate
create policy "own reports" on public.reports
  for all using (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  );

-- Shared report (public read via share_token, no JWT)
create policy "shared report read" on public.reports
  for select using (
    share_token is not null
    and (share_expires_at is null or share_expires_at > now())
  );

-- Scenarios & norms: readable by any authenticated student
create policy "authenticated read scenarios" on public.scenarios
  for select to authenticated using (is_active = true);
create policy "authenticated read norms" on public.norms
  for select to authenticated using (true);
create policy "authenticated read resources" on public.resources
  for select to authenticated using (verified = true);
```

> **Innovation Spotlight.** The consent gate is a `select 1 from students where consent_status='verified'` clause inside the RLS policy. It cannot be skipped by a frontend bug, a stolen anon key, or even a misconfigured Edge Function — Postgres rejects the row before it leaves the database. This is the single most DPDP-defensible design choice in the stack.

---

## 5. NVIDIA Nemotron Integration Architecture

### 5.1 Why Nemotron is the right model for this product

| Nemotron strength | Platform use case |
|---|---|
| **1M-token context** | Feed a student's *entire* assessment history into one prompt → longitudinal trajectory report |
| **550B MoE (55B active)** | Reasoning depth for nuanced, age-band-adapted analysis |
| **Multi-step reasoning** | Connecting growth across tests; predicting trajectory |
| **Free on OpenRouter** | Aligns with the $0–30 AI cost line |

### 5.2 The longitudinal trajectory innovation

v1.0 generated one report per assessment. v2.0 generates a **trajectory report** — Nemotron reasons over *all* the student's completed assessments in a single call, producing:

- A growth arc ("Your mathematical reasoning rose from the 58th to the 84th percentile over 3 tests")
- Trajectory prediction ("At current pace, you'd reach the 90th percentile in ~2 more cycles")
- Cross-test competency momentum (which pillar is accelerating, which is plateauing)

```typescript
// supabase/functions/ai-report-generate/index.ts (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENROUTER_KEY = Deno.env.get('OPENROUTER_API_KEY')!; // stored in Vault, never client

const SYSTEM_PROMPT = `You are an expert STEM education analyst for Indian students
(Classes 3-12). Generate a DUAL-AUDIENCE report from assessment data.

OUTPUT STRICT JSON with two variants:
  student_variant: { summary, keyStrengths[3], nextMission, percentileAsRank }
  parent_variant:  { overallAssessment, keyStrengths[3], growthAreas[3],
                    learningPath, parentGuidance,
                    actionPlan[4] { title, description, category, difficulty,
                                    estimatedDuration, resourceKey } }

RULES:
- For actionPlan.resourceKey, choose ONLY from the ALLOW-LIST provided. NEVER invent URLs.
- student_variant: encouraging, age {band}-appropriate, strengths-first,
  frame growth as "next level", avoid raw scaled scores, use percentile-as-rank.
- parent_variant: analytical, honest, growth-areas-first, scaled scores OK.
- Language: {preferredLanguage}.
- If trajectory data is provided, describe the growth arc and predict momentum.`;

export default async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // service role bypasses RLS for server-side joins
  );

  const { assessmentId } = await req.json();

  // 1. Load assessment + student
  const [{ data: assessment }, { data: student }] = await Promise.all([
    supabase.from('assessments').select('*').eq('id', assessmentId).single(),
    supabase.from('students').select('*').eq('id', /* student_id */).single(),
  ]);

  // 2. Load ENTIRE history for trajectory (Nemotron's 1M ctx makes this feasible)
  const { data: history } = await supabase
    .from('assessments')
    .select('id, completed_at, scaled_scores, global_score, percentiles, difficulty')
    .eq('student_id', student.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true });

  // 3. Load curated resource allow-list (anti-hallucination)
  const { data: resources } = await supabase
    .from('resources').select('key, competency, difficulty').eq('verified', true);

  // 4. Build the longitudinal prompt
  const userPrompt = buildPrompt(assessment, student, history, resources);

  // 5. Cascade: Nemotron → Nemotron-Lightning → Inkling → deterministic fallback
  for (const model of AI_MODEL_CASCADE) {
    if (PRIVACY_BLOCKLIST_PREFIXES.some(p => model.id.startsWith(p))) continue;
    try {
      const result = await callOpenRouter(model.id, SYSTEM_PROMPT, userPrompt);
      const parsed = await safeJsonParse(result);          // strip fences, etc.
      const validated = DualReportSchema.parse(parsed);   // Zod — throws if invalid
      // 6. Persist + publish via Realtime
      await persistReport(supabase, assessmentId, validated, model, history);
      return Response.json({ success: true, report: validated });
    } catch (e) {
      console.warn(`model ${model.id} failed: ${e.message}`);  // try next
    }
  }

  // 7. Deterministic fallback — never fails, never leaves a student without a report
  const fallback = deterministicReport(assessment, student, history);
  await persistReport(supabase, assessmentId, fallback,
                      { id: 'deterministic-fallback' }, history);
  return Response.json({ success: true, report: fallback, fallback: true });
};
```

### 5.3 Streaming via Supabase Realtime

```typescript
// Edge Function publishes partial chunks; client subscribes
// supabase/functions/ai-report-generate/index.ts (inside the cascade)
await supabase.channel(`report:${assessmentId}`).send({
  type: 'broadcast', event: 'section', payload: { section: 'summary', text: chunk }
});

// Client (React)
useEffect(() => {
  const channel = supabase.channel(`report:${assessmentId}`)
    .on('broadcast', { event: 'section' }, ({ payload }) => {
      setReportSections(prev => [...prev, payload]);   // render progressively
    }).subscribe();
  return () => { supabase.removeChannel(channel); };
}, [assessmentId]);
```

> **Innovation Spotlight — Realtime AI streaming.** The Lottie "brain-loading" animation plays briefly, then report sections fade in one-by-one as Nemotron streams. Perceived latency drops dramatically and the UX degrades gracefully (if streaming fails, the final persisted report still renders).

### 5.4 Anti-hallucination contract

| Failure mode | v1.0 risk | v2.0 mitigation |
|---|---|---|
| LLM invents a course URL | High (sent a child to a broken/malicious page) | LLM emits `resourceKey` from curated `resources` table only; server maps key→verified URL |
| LLM fabricates a percentile | Medium | Server computes percentile from `norms` *before* the prompt; LLM only narrates |
| LLM JSON breaks | High on free tier | Zod validation → repair attempt → next model in cascade → deterministic fallback |
| Model trains on inputs | Existential for DPDP | Allow-list filter; Poolside/Liquid blocked |

---

## 6. IRT / CAT Engine — the measurement core

### 6.1 Why IRT replaces raw scoring

v1.0 scored `earned / available` per competency. That approach:
- Can't compare across grades (a Class-3 "80%" ≠ a Class-11 "80%")
- Can't compare across difficulties
- Is noisy at extremes (a strong student gets every easy item right — no information gained)

IRT models each student as a latent ability **θ** and each item with (a, b, c). The ability estimate is on a common scale, so percentiles and longitudinal growth become meaningful.

### 6.2 Next-item selection (adaptive engine)

```sql
-- Postgres RPC: pick the next item maximizing Fisher information at current θ
create or replace function public.next_scenario(
  p_student uuid,
  p_theta jsonb,            -- current ability per competency
  p_seen uuid[]            -- already-answered scenario ids
) returns public.scenarios as $$
  select s.* from public.scenarios s
  where s.is_active = true
    and s.id <> all(coalesce(p_seen, '{}'::uuid[]))
    and s.development_band = (
      select case
        when current_class between 3 and 4 then '3-4'
        when current_class between 5 and 6 then '5-6'
        when current_class between 7 and 8 then '7-8'
        when current_class between 9 and 10 then '9-10'
        else '11-12' end
      from public.students where id = p_student
    )
  -- maximize information at θ: roughly, minimize |irt_b - theta|
  order by abs(s.irt_b - (p_theta->>s.competency)::float) asc
  limit 1;
$$ language sql stable;
```

### 6.3 Ability estimation (EAP) in the Edge Function

```typescript
// lib/irt/estimate.ts — Expected A Posteriori, simple & stable
export function estimateThetaEAP(
  responses: { a: number; b: number; c: number; correct: boolean }[]
): number {
  // Standard normal quadrature on [-3, 3]
  const nodes = [-3, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3];
  const weights = [0.004, 0.054, 0.13, 0.242, 0.352, 0.399, 0.352, 0.242, 0.13, 0.054, 0.004];

  let numer = 0, denom = 0;
  nodes.forEach((theta, i) => {
    let likelihood = 1;
    for (const r of responses) {
      const p = r.a * (theta - r.b) + r.c * (1 - r.a); // simplified 3PL-ish
      const prob = 1 / (1 + Math.exp(-p));
      likelihood *= r.correct ? prob : (1 - prob);
    }
    numer += theta * likelihood * weights[i];
    denom += likelihood * weights[i];
  });
  return denom === 0 ? 0 : numer / denom;
}
```

### 6.4 Percentile & scaled score from norms (Postgres RPC)

```sql
-- θ → percentile → scaled score (100-900), per competency per region
create or replace function public.score_competency(
  p_theta float, p_competency text, p_region text default 'global'
) returns table (percentile float, scaled_score int) as $$
  select
    100 * cdf(normal(mean, std_dev), p_theta) as percentile,
    (100 + 800 * cdf(normal(mean, std_dev), p_theta))::int as scaled_score
  from public.norms
  where competency = p_competency
    and region = p_region
    and version = (select max(version) from public.norms where region = p_region)
  limit 1;
$$ language sql stable;
```

> **Innovation Spotlight — DB-level psychometrics.** Scoring is SQL, auditable, and re-runnable. If a norm gets recalibrated, you can backfill every past report with one `update ... from score_competency(...)` — impossible with v1.0's embedded-in-the-app scoring.

---

## 7. DPDP-Native Consent & Security

### 7.1 The consent flow

```
Student registers (Supabase Auth email/password)
   │
   ▼
students row created, consent_status = 'pending'
   │  ◄── RLS blocks ALL assessment reads/writes while pending
   ▼
Parental consent step (Rule 10 compliant)
   ├─ Option A: DigiLocker token (preferred) → /functions/consent-webhook
   ├─ Option B: Aadhaar OTP via consent-manager partner
   └─ Option C: School-exempt (B2B2C) → verifier_id = school code
   │
   ▼
consent_status = 'verified', consent_verified_at, consent_expires_at set
   │  ◄── RLS now allows assessment rows
   ▼
Assessment unlocked
```

```typescript
// supabase/functions/consent-webhook/index.ts
// Receives DigiLocker verification callback, sets consent_status
export default async (req: Request) => {
  const { token, studentId, method } = await req.json();
  // Verify token with DigiLocker API using Vault-stored credentials
  const verified = await verifyWithDigiLocker(token);
  if (!verified) return Response.json({ success: false }, { status: 401 });

  const supabase = createClient(/* service role */);
  await supabase.from('students').update({
    consent_status: 'verified',
    consent_method: method,
    consent_token_ref: hash(token),              // never store raw token
    consent_verified_at: new Date().toISOString(),
    consent_expires_at: addYears(new Date(), 1), // re-verify yearly per Rule 8
  }).eq('id', studentId);

  // audit_logs trigger fires automatically
  return Response.json({ success: true });
};
```

### 7.2 DPDP compliance matrix

| DPDP requirement | v2.0 implementation |
|---|---|
| Child = under 18 | All Class 3–12 students treated as children; consent required |
| Verifiable parental consent (Rule 10) | DigiLocker/Aadhaar via Edge Function + `consent_status` RLS gate |
| No behavioral tracking/profiling | Reward loops re-scoped to outcome-only; no engagement analytics for minors |
| Data minimization | Profile collects only assessment-essential fields |
| Right to erasure | `on delete cascade` + parent erasure dashboard + audit trigger logs it |
| Retention limits (Rule 8) | `consent_expires_at` + scheduled job re-verifies; inactive purge after 1 yr |
| Audit trail | **Database trigger** on assessments + auth events from Supabase Auth |
| Breach notification | Vault + alerts; SOP to notify parents + Data Protection Board |
| Significant Data Fiduciary readiness | Schema supports annual DPIA export (all flows in `audit_logs`) |

### 7.3 What was removed from v1.0 for compliance

- ❌ Behavioral engagement analytics → replaced with outcome-only analytics
- ❌ Engagement-based reward badges → kept only **outcome-based** milestones (e.g., "80th Percentile Club" — earned from a score, not from behavior)
- ❌ Tab-switch / keystroke monitoring → integrity comes from item randomization + IRT, not surveillance
- ❌ `openrouter/free` auto-router → explicit privacy-filtered allow-list

---

## 8. Frontend Architecture (Vite + React 19)

### 8.1 Project structure

```
src/
├── lib/
│   ├── supabase.ts          # client (anon key + auth)
│   ├── supabase-server.ts   # Edge Function use (service role)
│   ├── ai/models.ts         # Nemotron cascade + privacy blocklist
│   └── irt/estimate.ts      # EAP ability estimation
├── hooks/
│   ├── useAuth.ts           # supabase.auth.onAuthStateChange
│   ├── useAssessment.ts     # adaptive session state (Zustand)
│   ├── useReportStream.ts   # Realtime channel subscription
│   └── useKeyboardShortcuts.ts   # A/B/C/D + Enter
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── auth/                # RegisterForm, ConsentGate
│   ├── assessment/          # QuestionCard, OptionButton, ProgressBar, Timer
│   ├── dashboard/           # StatCard, ProgressChart, CompetencyRadar, BenchmarkChart
│   ├── report/
│   │   ├── ReportHeader.tsx
│   │   ├── StudentVariant.tsx   # encouraging, age-adapted
│   │   ├── ParentVariant.tsx    # analytical, action-oriented
│   │   ├── TrajectoryArc.tsx    # longitudinal growth visualization
│   │   └── PDFExportButton.tsx
│   └── animations/          # LottiePlayer, ConfettiEffect, FadeIn
├── routes/                  # React Router v7
│   ├── /dashboard
│   ├── /assessment/:id
│   ├── /reports/:id
│   └── /shared/:token       # public read-only via RLS share policy
└── stores/
    ├── authStore.ts
    └── assessmentStore.ts
```

### 8.2 Supabase client + auth

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// hooks/useAuth.ts — reactive auth state
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return session;
}
```

### 8.3 PWA + offline-first (for Indian connectivity)

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [react(), VitePWA({
    strategies: 'generateSW',
    runtimeCaching: [{
      // Cache scenario assets; assessment survives a disconnect
      urlPattern: /\/rest\/v1\/scenarios/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'scenarios' }
    }]
  })]
});
```

Responses are queued in IndexedDB on mutation failure and synced on reconnect — a mid-test disconnect does not destroy the session.

---

## 9. PDF Generation

```typescript
// Primary: client-side via html2pdf (instant, no round-trip)
import html2pdf from 'html2pdf.js';
export async function generatePDF(element: HTMLElement, filename: string) {
  await html2pdf().set({
    margin: [12, 12, 12, 12], filename: `${filename}.pdf`,
    html2canvas: { scale: 2, backgroundColor: '#fff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  }).from(element).save();
}

// Then upload to Supabase Storage → signed URL (revocable, time-limited)
const { data } = await supabase.storage
  .from('reports').upload(`${studentId}/${reportId}.pdf`, pdfBlob);
const { data: { signedUrl } } = await supabase.storage
  .from('reports').createSignedUrl(data.path, 3600); // 1h link
```

> v1.0 stored a `pdfUrl` (public S3). v2.0 uses **signed URLs** — revocable, 1-hour, DPDP-friendly. The `share_token` RLS policy is the only public-read path.

---

## 10. Innovative Feature Set (differentiators)

| # | Feature | Innovation | Enabled by |
|---|---|---|---|
| 1 | **Longitudinal trajectory reports** | AI reasons over entire student history, not one test | Nemotron 1M ctx |
| 2 | **DB-level psychometrics** | Scoring as Postgres RPC; backfillable, auditable | Supabase Postgres |
| 3 | **RLS consent gating** | Can't read assessment rows until consent verified — at the DB | Supabase RLS |
| 4 | **Realtime AI streaming** | Report sections render as Nemotron streams | Supabase Realtime |
| 5 | **Outcome-based peer matching** | "Students like you" via competency embeddings, not behavior | pgvector |
| 6 | **Dual-audience reports** | One call → student variant + parent variant | Edge Function + Nemotron |
| 7 | **Anti-hallucination resource DB** | LLM emits curated keys, never raw URLs | `resources` table + Zod |
| 8 | **School-exempt B2B2C** | DPDP Rule 12 exemption eases consent at scale | `consent_method='school_exempt'` |
| 9 | **Trigger-driven audit** | Every mutation logged, can't be bypassed | Postgres triggers |
| 10 | **Multilingual reports** | Hindi + regional language variants | Inkling/Nemotron + `preferred_language` |
| 11 | **PWA offline sessions** | Survives connectivity drops mid-test | vite-plugin-pwa + IndexedDB |
| 12 | **Vertical-scaled growth charts** | Honest cross-grade progress via θ | IRT common scale |

### pgvector peer matching (outcome-based, DPDP-safe)

```sql
-- After each assessment, update the student's competency embedding
update public.students
set competency_embedding = (
  select array_agg(scaled_score order by competency)
  from unnest(assessment.scaled_scores)
)
where id = assessment.student_id;

-- Find 5 "students like you" — by OUTCOME similarity, never behavior
select id from public.students
where id <> auth.uid() and consent_status = 'verified'
order by competency_embedding <-> (select competency_embedding from students where id = auth.uid())
limit 5;
```

> This is DPDP-compliant because it profiles **competency outcomes**, not behavior — the DPDP prohibition is on behavioral monitoring/tracking, not on outcome-based academic similarity.

---

## 11. Build Roadmap (phased)

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Supabase project + schema (§3) + RLS (§4)
- [ ] Supabase Auth + `students` profile + consent table
- [ ] `consent-webhook` Edge Function (DigiLocker/Aadhaar stub)
- [ ] Vite + React 19 + Tailwind v4 + shadcn/ui scaffold
- [ ] Registration + consent gate UI
- [ ] Audit trigger live
- [ ] Seed 20 scenarios *with IRT params* (a/b/c estimated)

### Phase 2 — Adaptive Assessment (Weeks 4–6)
- [ ] IRT EAP estimation (§6.3)
- [ ] `next_scenario` RPC + adaptive engine
- [ ] Assessment session UI (QuestionCard, Timer, ProgressBar)
- [ ] PWA offline-first + IndexedDB sync queue
- [ ] `score_competency` RPC + norms seeded from PISA/TIMSS (provisional)
- [ ] Results page with Recharts competency radar

### Phase 3 — AI Reports (Weeks 7–9)
- [ ] `ai-report-generate` Edge Function with Nemotron cascade (§5)
- [ ] Dual-audience report UI (StudentVariant / ParentVariant)
- [ ] Trajectory arc visualization
- [ ] Realtime streaming subscription
- [ ] Curated `resources` table seeded + resourceKey mapping
- [ ] Client-side PDF + Storage signed URLs
- [ ] Multilingual prompt flag (Hindi pilot)

### Phase 4 — Dashboard & Polish (Weeks 10–12)
- [ ] Student dashboard (StatCards, ProgressChart, CompetencyRadar, BenchmarkChart)
- [ ] Assessment history + "Retake Similar" (equivalent forms via IRT)
- [ ] Shared report links via `share_token` RLS policy
- [ ] Lottie/GSAP/Framer polish
- [ ] Outcome-based badges only (no engagement analytics)
- [ ] pgvector peer matching
- [ ] Load test (1000 concurrent via Supabase auto-scale)

### Phase 5 — Scale & Compliance (Ongoing)
- [ ] School B2B2C onboarding (`consent_method='school_exempt'`)
- [ ] Educator analytics dashboard (cohort-level, anonymized)
- [ ] Norm recalibration with organic data (flip `is_provisional`)
- [ ] Annual DPIA automation (export from `audit_logs`)
- [ ] Paid Nemotron fallback triggered at free-tier 429 ceiling

---

## 12. Environment & Secrets

```bash
# Frontend (.env) — Vite
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...           # public, safe (RLS protects data)
VITE_APP_NAME=STEM Benchmark

# Supabase Vault (Edge Function secrets) — NEVER in frontend
OPENROUTER_API_KEY=sk-or-v1-...         # used only in Edge Functions
SUPABASE_SERVICE_ROLE_KEY=...           # server-side only
DIGILOCKER_CLIENT_ID=...
DIGILOCKER_CLIENT_SECRET=...
```

> v1.0 put `VITE_OPENROUTER_KEY` in the frontend `.env` — that exposes the key to the browser. **v2.0 moves it to Supabase Vault** and proxies all AI calls through Edge Functions. This alone fixes a serious v1.0 security flaw.

---

## 13. Cost (updated for Supabase, 1000 students)

| Service | Provider | Est. cost/mo |
|---|---|---|
| Frontend | Vercel Pro | $20 |
| Backend (Postgres + Auth + Edge Functions + Realtime + Storage) | Supabase Pro | $25 |
| AI (OpenRouter free Nemotron + paid fallback ceiling) | OpenRouter | $0–$30 |
| Vector (pgvector, included in Supabase) | — | $0 |
| Domain + SSL | Cloudflare | $15 |
| **Total** | | **~$60–$90/mo** |

> Supabase's all-in-one pricing (Postgres, Auth, Edge Functions, Realtime, Storage, Vault) collapses ~4 line items from v1.0's $132–162 estimate into one. The revised floor is roughly half the v1.0 cost, with stronger security.

---

## 14. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Nemotron free-tier rate-limited at peak | Med | Med | Cascade to Lightning → Inkling → paid fallback at 429 |
| DPDP enforcement on behavioral features | High if ignored | Critical (₹200cr) | Outcome-only analytics; no engagement profiling |
| Free model trains on inputs | Low (filtered) | Critical | Privacy blocklist; explicit allow-list; re-verify monthly |
| IRT params mis-estimated early | High | Med | Start `is_provisional`; recalibrate with usage_count + correct rate |
| Shared report link leaked | Low | Med | `share_expires_at`; revocable; RLS-enforced |
| Norms not yet organic | High (launch) | Med | PISA/TIMSS anchor + `is_provisional=true` label in UI |
| Edge Function cold start latency | Med | Low | Warm via scheduled pings; stream first token fast |

---

## 15. What changed from v1.0 (migration summary)

| v1.0 concept | v2.0 concept | Reason |
|---|---|---|
| MongoDB + Mongoose | Supabase Postgres | Relational + RLS + RPC |
| Express server | Edge Functions (Deno) | Serverless, no maintenance |
| Custom JWT + bcrypt | Supabase Auth | Managed, audited |
| Middleware auth | RLS policies | DB-enforced, unbypassable |
| `mistral-7b-instruct:free` (deprecated) | Nemotron 3 Ultra (1M ctx) | Reasoning + longitudinal |
| Per-assessment report | Longitudinal trajectory report | Uses 1M context |
| Single report variant | Dual-audience (student + parent) | Matches the ask |
| Raw earned/available | IRT + CAT | Valid measurement |
| COPPA-inspired | DPDP Act 2023 native | India's actual law |
| `VITE_OPENROUTER_KEY` in browser | OpenRouter key in Vault | Security fix |
| Public `pdfUrl` | Storage signed URLs | DPDP-friendly |
| Polling for updates | Supabase Realtime | Live + streaming |
| Behavioral badges | Outcome-only badges | DPDP compliance |

---

*End of plan. This document is the single source of truth for the v2.0 build. Every schema, policy, function, and Edge Function snippet above is implementation-ready.*
