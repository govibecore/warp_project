-- Migration: 20260913000004_add_scenarios_class_level_and_admin_rpc.sql
-- 1. Add class_level and international_benchmark columns to public.scenarios
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS class_level smallint;
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS international_benchmark text;

-- 2. Backfill class_level from scenario_code or developmental_band for existing scenarios
UPDATE public.scenarios
SET class_level = CASE
  WHEN scenario_code ~ '^C03' THEN 3
  WHEN scenario_code ~ '^C04' THEN 4
  WHEN scenario_code ~ '^C05' THEN 5
  WHEN scenario_code ~ '^C06' THEN 6
  WHEN scenario_code ~ '^C07' THEN 7
  WHEN scenario_code ~ '^C08' THEN 8
  WHEN scenario_code ~ '^C09' THEN 9
  WHEN scenario_code ~ '^C10' THEN 10
  WHEN scenario_code ~ '^C11' THEN 11
  WHEN scenario_code ~ '^C12' THEN 12
  WHEN developmental_band = '3-4' THEN 3
  WHEN developmental_band = '5-6' THEN 5
  WHEN developmental_band = '7-8' THEN 7
  WHEN developmental_band = '9-10' THEN 9
  WHEN developmental_band = '11-12' THEN 11
  ELSE 8
END
WHERE class_level IS NULL;

-- 3. Update scenarios_safe view to include class_level and international_benchmark
DROP VIEW IF EXISTS public.scenarios_safe CASCADE;
CREATE VIEW public.scenarios_safe AS
  SELECT id, scenario_code, subject, competency, developmental_band, class_level, difficulty,
         prompt, context_image, options, learning_objective, hint, international_benchmark,
         is_active, usage_count, created_at
  FROM public.scenarios
  WHERE is_active = true;

GRANT SELECT ON public.scenarios_safe TO authenticated;
GRANT SELECT ON public.scenarios_safe TO anon;

-- 4. Re-create next_scenario RPC matching updated scenarios_safe shape
DROP FUNCTION IF EXISTS public.next_scenario(uuid);
CREATE OR REPLACE FUNCTION public.next_scenario(
  p_assessment uuid
) RETURNS SETOF public.scenarios_safe AS $$
DECLARE
  v_student   uuid;
  v_theta     jsonb;
  v_band      text;
  v_subject   text;
BEGIN
  -- Read assessment state (server-authoritative)
  SELECT a.student_id, a.ability_theta, a.subject
    INTO v_student, v_theta, v_subject
  FROM public.assessments a
  WHERE a.id = p_assessment;

  IF v_student IS NULL THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;

  -- Derive developmental band from the student's class
  SELECT CASE
    WHEN current_class BETWEEN 3 AND 4 THEN '3-4'
    WHEN current_class BETWEEN 5 AND 6 THEN '5-6'
    WHEN current_class BETWEEN 7 AND 8 THEN '7-8'
    WHEN current_class BETWEEN 9 AND 10 THEN '9-10'
    ELSE '11-12' END
  INTO v_band
  FROM public.students WHERE id = v_student;

  -- Return the optimal next item matching subject and developmental band
  RETURN QUERY
    SELECT
      s.id, s.scenario_code, s.subject, s.competency, s.developmental_band,
      s.class_level, s.difficulty, s.prompt, s.context_image, s.options,
      s.learning_objective, s.hint, s.international_benchmark, s.is_active,
      s.usage_count, s.created_at
    FROM public.scenarios s
    WHERE s.is_active = true
      AND (
        s.subject = v_subject
        OR (v_subject IN ('English', 'English Literacy') AND s.subject IN ('English', 'English Literacy'))
        OR (v_subject IN ('STEM', 'stem') AND s.subject IN ('STEM', 'stem'))
      )
      AND s.developmental_band = v_band
      -- Exclude already-seen items by ID or by duplicate prompt text
      AND s.id NOT IN (
        SELECT (r->>'scenario_id')::uuid
        FROM jsonb_array_elements(
          COALESCE(
            (SELECT a2.responses FROM public.assessments a2 WHERE a2.id = p_assessment),
            '[]'::jsonb
          )
        ) AS r
        WHERE r->>'scenario_id' IS NOT NULL
      )
      AND s.prompt NOT IN (
        SELECT s_seen.prompt
        FROM public.scenarios s_seen
        WHERE s_seen.id IN (
          SELECT (r->>'scenario_id')::uuid
          FROM jsonb_array_elements(
            COALESCE(
              (SELECT a2.responses FROM public.assessments a2 WHERE a2.id = p_assessment),
              '[]'::jsonb
            )
          ) AS r
          WHERE r->>'scenario_id' IS NOT NULL
        )
      )
    ORDER BY abs(s.irt_b - COALESCE(
      (v_theta->>s.competency)::float, 0
    )) ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.next_scenario(uuid) TO authenticated, anon;

-- 5. Define get_admin_stats RPC for AdminOverview dashboard
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total_students integer;
  v_assessments_today integer;
  v_completed_assessments integer;
  v_avg_score numeric;
  v_completion_rate integer;
BEGIN
  SELECT count(*) INTO v_total_students FROM public.students;
  SELECT count(*) INTO v_assessments_today FROM public.assessments WHERE created_at >= current_date;
  SELECT count(*) INTO v_completed_assessments FROM public.assessments WHERE status = 'completed';
  SELECT coalesce(round(avg(global_score)), 0) INTO v_avg_score FROM public.assessments WHERE status = 'completed' AND global_score IS NOT NULL;
  
  IF v_total_students > 0 THEN
    v_completion_rate := round((v_completed_assessments::numeric / v_total_students::numeric) * 100);
  ELSE
    v_completion_rate := 0;
  END IF;

  RETURN jsonb_build_object(
    'totalStudents', v_total_students,
    'assessmentsToday', v_assessments_today,
    'completedAssessments', v_completed_assessments,
    'avgScore', v_avg_score,
    'completionRate', v_completion_rate,
    'dailyStats', '[]'::jsonb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated, anon;

-- 6. Define get_admin_students RPC for AdminStudents table
CREATE OR REPLACE FUNCTION public.get_admin_students(
  page_num integer DEFAULT 0,
  page_size integer DEFAULT 20,
  search_term text DEFAULT ''
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT coalesce(jsonb_agg(sub.row_data), '[]'::jsonb) INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'id', s.id,
      'fullName', s.full_name,
      'email', coalesce(u.email, ''),
      'currentClass', s.current_class,
      'assessmentsCount', (SELECT count(*) FROM public.assessments a WHERE a.student_id = s.id),
      'lastScore', (
        SELECT a.global_score 
        FROM public.assessments a 
        WHERE a.student_id = s.id AND a.status = 'completed' AND a.global_score IS NOT NULL 
        ORDER BY a.completed_at DESC NULLS LAST 
        LIMIT 1
      ),
      'joinedAt', s.created_at
    ) AS row_data
    FROM public.students s
    LEFT JOIN auth.users u ON u.id = s.id
    WHERE (
      search_term = '' 
      OR s.full_name ILIKE '%' || search_term || '%' 
      OR u.email ILIKE '%' || search_term || '%'
    )
    ORDER BY s.created_at DESC
    LIMIT page_size
    OFFSET (page_num * page_size)
  ) sub;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_students(integer, integer, text) TO authenticated, anon;
