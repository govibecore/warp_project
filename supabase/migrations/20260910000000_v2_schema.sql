-- v2 Schema for STEM Benchmark Platform
-- This implements the DPDP-native schema, IRT assessment engine, and dual-audience reports.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. STUDENTS (Profile and Consent)
CREATE TABLE public.students (
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
  preferred_language text default 'en',

  -- DPDP consent
  consent_status  text not null default 'pending'
                  check (consent_status in ('pending','verified','withdrawn')),
  consent_method  text,
  consent_token_ref text,
  consent_verified_at timestamptz,
  consent_expires_at  timestamptz,

  -- competency embedding
  competency_embedding vector(5),

  created_at      timestamptz not null default now()
);

create index on public.students (current_class);
create index on public.students (consent_status) where consent_status = 'verified';

-- 2. ASSESSMENTS
CREATE TABLE public.assessments (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  class_level   smallint not null check (class_level between 3 and 12),
  difficulty    text not null check (difficulty in ('standard','advanced','olympiad')),
  status        text not null default 'in_progress'
                check (status in ('in_progress','completed','abandoned','timed_out')),

  responses     jsonb not null default '[]'::jsonb,

  -- IRT outputs
  ability_theta jsonb,
  scaled_scores jsonb,
  global_score  smallint check (global_score between 100 and 900),
  percentiles   jsonb,

  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  total_time_ms integer,
  created_at    timestamptz not null default now()
);

create index on public.assessments (student_id, status, created_at desc);
create index on public.assessments (student_id, created_at desc);

-- 3. SCENARIOS (IRT item bank)
CREATE TABLE public.scenarios (
  id              uuid primary key default gen_random_uuid(),
  scenario_code   text not null unique,
  competency      text not null check (competency in (
                    'scientificInquiry','computationalThinking',
                    'engineeringDesign','mathematicalReasoning','systemsThinking')),
  developmental_band text not null check (developmental_band in
                    ('3-4','5-6','7-8','9-10','11-12')),
  difficulty      text default 'standard',
  prompt          text not null,
  context_image   text,
  options         jsonb not null,
  learning_objective text,
  hint            text,

  -- IRT parameters (3PL)
  irt_a           float check (irt_a between 0 and 3),
  irt_b           float check (irt_b between -3 and 3),
  irt_c           float check (irt_c between 0 and 1),

  is_active       boolean default true,
  usage_count     integer default 0,
  created_at      timestamptz default now()
);

create index on public.scenarios (competency, developmental_band, difficulty, is_active);

-- 4. REPORTS
CREATE TABLE public.reports (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  assessment_id   uuid not null unique references public.assessments(id) on delete cascade,

  student_variant jsonb,
  parent_variant  jsonb,

  trajectory_context_assessment_ids uuid[] default '{}',

  ai_provenance   jsonb,
  resource_keys   text[],

  pdf_path        text,
  pdf_generated_at timestamptz,

  share_token     text unique,
  share_expires_at timestamptz,

  generated_at    timestamptz default now()
);

create index on public.reports (student_id, generated_at desc);

-- 5. NORMS
CREATE TABLE public.norms (
  region          text not null,
  class_level     smallint not null,
  difficulty      text,
  competency      text not null,
  mean            float not null,
  std_dev         float not null,
  sample_size     integer,
  source          text,
  version         text not null,
  is_provisional  boolean default true,
  updated_at      timestamptz default now()
);

create unique index on public.norms (region, class_level, difficulty, competency, version);

-- 6. RESOURCES
CREATE TABLE public.resources (
  key             text primary key,
  title           text not null,
  url             text not null,
  category        text check (category in ('course','project','practice','resource','retest')),
  difficulty      text check (difficulty in ('beginner','intermediate','advanced')),
  competency      text,
  language        text default 'en',
  verified        boolean default true,
  verified_at     timestamptz default now()
);

-- 7. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid,
  action      text not null,
  metadata    jsonb,
  actor_id    uuid,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index on public.audit_logs (student_id, created_at desc);
create index on public.audit_logs (action, created_at desc);

-- Audit Trigger for assessments
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

-- 8. ROW LEVEL SECURITY
alter table public.students   enable row level security;
alter table public.assessments enable row level security;
alter table public.reports    enable row level security;
alter table public.audit_logs  enable row level security;
alter table public.scenarios   enable row level security;
alter table public.norms       enable row level security;
alter table public.resources   enable row level security;

-- Students
create policy "self select" on public.students
  for select using (auth.uid() = id);
create policy "self update" on public.students
  for update using (auth.uid() = id);

-- Assessments (DPDP Consent Gated)
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

-- Reports
create policy "own reports" on public.reports
  for all using (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  );

create policy "shared report read" on public.reports
  for select using (
    share_token is not null
    and (share_expires_at is null or share_expires_at > now())
  );

-- Public/Authenticated read policies
create policy "authenticated read scenarios" on public.scenarios
  for select to authenticated using (is_active = true);
create policy "authenticated read norms" on public.norms
  for select to authenticated using (true);
create policy "authenticated read resources" on public.resources
  for select to authenticated using (verified = true);
