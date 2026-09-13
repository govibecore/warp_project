-- PRODUCT-REDESIGN Enforcement Migration
-- Fixes: RLS breaches, consent gate, IRT parameter exposure, shared-report RPC

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Fix Flaw #1 — Drop enumerable shared-report policy
--    The current policy allows anyone to scan all reports with a non-null
--    share_token. Replace with a server-side RPC that requires knowing
--    the exact token.
-- ═══════════════════════════════════════════════════════════════════════
drop policy if exists "shared report read" on public.reports;

-- get_shared_report: token-gated, non-enumerable report access
create or replace function public.get_shared_report(p_token text)
returns setof public.reports as $$
  select * from public.reports
  where share_token = p_token
    and (share_expires_at is null or share_expires_at > now());
$$ language sql stable security definer;

-- Only anon (public share links) and authenticated users may call this
grant execute on function public.get_shared_report(text) to anon;
grant execute on function public.get_shared_report(text) to authenticated;
revoke execute on function public.get_shared_report(text) from public;


-- ═══════════════════════════════════════════════════════════════════════
-- 2. Fix Flaw #5 — Add DPDP consent gate to assessment UPDATE policy
--    SELECT and INSERT already have the consent check; UPDATE was missing.
-- ═══════════════════════════════════════════════════════════════════════
drop policy if exists "own assessments update" on public.assessments;

create policy "own assessments update" on public.assessments
  for update using (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  )
  with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.consent_status = 'verified'
    )
  );


-- ═══════════════════════════════════════════════════════════════════════
-- 3. Fix Flaw #6 — Harden next_scenario RPC
--    Replace the existing next_scenario to:
--    a) Accept p_assessment UUID (not raw theta/seen arrays)
--    b) Derive theta and seen items server-side from the assessment record
--    c) Return only safe columns (no irt_a, irt_b, irt_c)
-- ═══════════════════════════════════════════════════════════════════════

-- Create a return type that excludes IRT parameters
drop type if exists public.scenario_safe cascade;
create type public.scenario_safe as (
  id              uuid,
  scenario_code   text,
  competency      text,
  developmental_band text,
  difficulty      text,
  prompt          text,
  context_image   text,
  options         jsonb,
  learning_objective text,
  hint            text,
  is_active       boolean,
  usage_count     integer,
  created_at      timestamptz
);

-- Drop old next_scenario signatures
drop function if exists public.next_scenario(uuid, jsonb, uuid[]);

-- New hardened next_scenario: derives state from the assessment record
create or replace function public.next_scenario(
  p_assessment uuid
) returns setof public.scenario_safe as $$
declare
  v_student   uuid;
  v_theta     jsonb;
  v_band      text;
begin
  -- Read assessment state (server-authoritative)
  select a.student_id, a.ability_theta
    into v_student, v_theta
  from public.assessments a
  where a.id = p_assessment;

  if v_student is null then
    raise exception 'Assessment not found';
  end if;

  -- Derive developmental band from the student's class
  select case
    when current_class between 3 and 4 then '3-4'
    when current_class between 5 and 6 then '5-6'
    when current_class between 7 and 8 then '7-8'
    when current_class between 9 and 10 then '9-10'
    else '11-12' end
  into v_band
  from public.students where id = v_student;

  -- Return the optimal next item, excluding IRT parameters
  return query
    select
      s.id, s.scenario_code, s.competency, s.developmental_band,
      s.difficulty, s.prompt, s.context_image, s.options,
      s.learning_objective, s.hint, s.is_active, s.usage_count, s.created_at
    from public.scenarios s
    where s.is_active = true
      and s.developmental_band = v_band
      -- Exclude already-seen items by ID or by duplicate prompt text
      and s.id not in (
        select (r->>'scenario_id')::uuid
        from jsonb_array_elements(
          coalesce(
            (select a2.responses from public.assessments a2 where a2.id = p_assessment),
            '[]'::jsonb
          )
        ) as r
        where r->>'scenario_id' is not null
      )
      and s.prompt not in (
        select s_seen.prompt
        from public.scenarios s_seen
        where s_seen.id in (
          select (r->>'scenario_id')::uuid
          from jsonb_array_elements(
            coalesce(
              (select a2.responses from public.assessments a2 where a2.id = p_assessment),
              '[]'::jsonb
            )
          ) as r
          where r->>'scenario_id' is not null
        )
      )
    order by abs(s.irt_b - coalesce(
      (v_theta->>s.competency)::float, 0
    )) asc
    limit 1;
end;
$$ language plpgsql stable security definer;


-- ═══════════════════════════════════════════════════════════════════════
-- 4. Fix Flaw #6 — Restrict scenarios SELECT to exclude IRT params
--    Create a view without irt_a/b/c and point the RLS policy at it.
--    Since RLS can't do column-level security, we drop direct authenticated
--    read and create a safe view instead.
-- ═══════════════════════════════════════════════════════════════════════
drop policy if exists "authenticated read scenarios" on public.scenarios;

-- Re-create a restrictive policy: authenticated users can only see
-- non-IRT columns via the safe view; the raw table is only accessible
-- by security-definer functions (next_scenario, score_competency)
create policy "authenticated read scenarios safe" on public.scenarios
  for select to authenticated
  using (false);  -- Block direct table access

-- Create the safe view for any legitimate client-side scenario browsing
create or replace view public.scenarios_safe as
  select id, scenario_code, competency, developmental_band, difficulty,
         prompt, context_image, options, learning_objective, hint,
         is_active, usage_count, created_at
  from public.scenarios
  where is_active = true;

-- Grant access to the view (views bypass RLS of the underlying table
-- only when owned by the table owner, which they are by default)
grant select on public.scenarios_safe to authenticated;
grant select on public.scenarios_safe to anon;


-- ═══════════════════════════════════════════════════════════════════════
-- 5. Auto-create students row on signup
--    Add a trigger to automatically create a student row when a new auth
--    user signs up.
-- ═══════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.students (id, full_name, current_class, consent_status)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New Student'), coalesce((new.raw_user_meta_data->>'current_class')::smallint, 8), 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
