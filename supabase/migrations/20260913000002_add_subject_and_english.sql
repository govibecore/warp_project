-- 1. Add subject columns and update competency constraints
ALTER TABLE public.scenarios DROP CONSTRAINT IF EXISTS scenarios_competency_check;
ALTER TABLE public.scenarios ADD CONSTRAINT scenarios_competency_check CHECK (competency in (
  'scientificInquiry','computationalThinking','engineeringDesign','mathematicalReasoning','systemsThinking',
  'understanding','locatingInformation','synthesis'
));

ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'STEM';
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'STEM';

-- 2. Update scenarios_safe view to include subject
DROP VIEW IF EXISTS public.scenarios_safe CASCADE;
CREATE VIEW public.scenarios_safe AS
  SELECT id, scenario_code, subject, competency, developmental_band, difficulty,
         prompt, context_image, options, learning_objective, hint,
         is_active, usage_count, created_at
  FROM public.scenarios
  WHERE is_active = true;

GRANT SELECT ON public.scenarios_safe TO authenticated;
GRANT SELECT ON public.scenarios_safe TO anon;

-- 3. Update next_scenario RPC to filter by subject
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

  -- Return the optimal next item, excluding IRT parameters, matching subject
  RETURN QUERY
    SELECT
      s.id, s.scenario_code, s.subject, s.competency, s.developmental_band,
      s.difficulty, s.prompt, s.context_image, s.options,
      s.learning_objective, s.hint, s.is_active, s.usage_count, s.created_at
    FROM public.scenarios s
    WHERE s.is_active = true
      AND s.subject = v_subject
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

-- 4. Seed English Literacy Scenarios
INSERT INTO public.scenarios (scenario_code, subject, competency, developmental_band, difficulty, prompt, options, irt_a, irt_b, irt_c)
VALUES
  ('ENG-3-4-01', 'English Literacy', 'understanding', '3-4', 'standard', 'Identify the main idea of the following passage: The quick brown fox jumps over the lazy dog.', 
   '[{"text": "The fox is quick.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "The dog is fast.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}], "misconception": "misread subject"}, {"text": "The animals are sleeping.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "The fox is brown.", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}]'::jsonb, 
   1.0, -1.0, 0.25),
   
  ('ENG-5-6-01', 'English Literacy', 'locatingInformation', '5-6', 'standard', 'According to the poster, what time does the event start? "Summer Fair! Join us this Saturday at 10:00 AM."', 
   '[{"text": "10:00 AM", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "11:00 AM", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Saturday", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Summer", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb, 
   1.2, 0.0, 0.25),

  ('ENG-7-8-01', 'English Literacy', 'understanding', '7-8', 'standard', 'Identify the main idea of the following passage: The quick brown fox jumps over the lazy dog.', 
   '[{"text": "The fox is quick.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "The dog is fast.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}], "misconception": "misread subject"}, {"text": "The animals are sleeping.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "The fox is brown.", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}]'::jsonb, 
   1.0, -1.0, 0.25),
   
  ('ENG-9-10-01', 'English Literacy', 'locatingInformation', '9-10', 'standard', 'According to the poster, what time does the event start? "Summer Fair! Join us this Saturday at 10:00 AM."', 
   '[{"text": "10:00 AM", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "11:00 AM", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Saturday", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Summer", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb, 
   1.2, 0.0, 0.25);
