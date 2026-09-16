-- Migration to add question_type and metadata to scenarios

-- Ensure we can store interactive types like 'multiple_choice', 'math_input', 'code_block', 'drag_drop'
ALTER TABLE public.scenarios
ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'multiple_choice',
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Optional: Create an index on question_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_scenarios_question_type ON public.scenarios(question_type);

-- Update public.scenario_safe type
DROP TYPE IF EXISTS public.scenario_safe CASCADE;
CREATE TYPE public.scenario_safe AS (
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
  created_at      timestamptz,
  question_type   text,
  metadata        jsonb
);

-- Update next_scenario RPC
CREATE OR REPLACE FUNCTION public.next_scenario(
  p_assessment uuid
) RETURNS setof public.scenario_safe AS $$
DECLARE
  v_student   uuid;
  v_theta     jsonb;
  v_band      text;
BEGIN
  -- Read assessment state (server-authoritative)
  SELECT a.student_id, a.ability_theta
    INTO v_student, v_theta
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

  -- Return the optimal next item, excluding IRT parameters
  RETURN QUERY
    SELECT
      s.id, s.scenario_code, s.competency, s.developmental_band,
      s.difficulty, s.prompt, s.context_image, s.options,
      s.learning_objective, s.hint, s.is_active, s.usage_count, s.created_at,
      s.question_type, s.metadata
    FROM public.scenarios s
    WHERE s.is_active = true
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

-- Update scenarios_safe view
DROP VIEW IF EXISTS public.scenarios_safe CASCADE;
CREATE OR REPLACE VIEW public.scenarios_safe AS
  SELECT id, scenario_code, competency, developmental_band, difficulty,
         prompt, context_image, options, learning_objective, hint,
         is_active, usage_count, created_at, question_type, metadata
  FROM public.scenarios
  WHERE is_active = true;

GRANT SELECT ON public.scenarios_safe TO authenticated;
GRANT SELECT ON public.scenarios_safe TO anon;
