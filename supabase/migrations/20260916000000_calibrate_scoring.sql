-- ═══════════════════════════════════════════════════════════════════════
-- Migration: 20260916000000_calibrate_scoring.sql
-- Description: Server-authoritative IRT response recording, 3PL EAP
--              quadrature estimation, and unified linear score calibration.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Helper function to compute EAP theta via 41-node Gauss-Hermite quadrature
CREATE OR REPLACE FUNCTION public.estimate_theta_eap(
  p_responses jsonb
) RETURNS float AS $$
DECLARE
  v_nodes float[] := array[
    -4.0, -3.8, -3.6, -3.4, -3.2, -3.0, -2.8, -2.6, -2.4, -2.2,
    -2.0, -1.8, -1.6, -1.4, -1.2, -1.0, -0.8, -0.6, -0.4, -0.2,
     0.0,  0.2,  0.4,  0.6,  0.8,  1.0,  1.2,  1.4,  1.6,  1.8,
     2.0,  2.2,  2.4,  2.6,  2.8,  3.0,  3.2,  3.4,  3.6,  3.8,  4.0
  ];
  v_theta float;
  v_w float;
  v_lik float;
  v_p float;
  v_numer float := 0.0;
  v_denom float := 0.0;
  v_r jsonb;
  v_a float;
  v_b float;
  v_c float;
  v_corr boolean;
  i int;
BEGIN
  IF p_responses IS NULL OR jsonb_array_length(p_responses) = 0 THEN
    RETURN 0.0;
  END IF;

  FOR i IN 1..array_length(v_nodes, 1) LOOP
    v_theta := v_nodes[i];
    v_w := exp(-0.5 * v_theta * v_theta);
    v_lik := 1.0;

    FOR v_r IN SELECT * FROM jsonb_array_elements(p_responses) LOOP
      v_a := COALESCE((v_r->>'a')::float, 1.0);
      v_b := COALESCE((v_r->>'b')::float, 0.0);
      v_c := COALESCE((v_r->>'c')::float, 0.25);
      v_corr := COALESCE((v_r->>'correct')::boolean, false);

      -- 3PL probability model: P(theta) = c + (1 - c) / (1 + exp(-a * (theta - b)))
      v_p := v_c + (1.0 - v_c) / (1.0 + exp(-v_a * (v_theta - v_b)));
      IF v_corr THEN
        v_lik := v_lik * v_p;
      ELSE
        v_lik := v_lik * (1.0 - v_p);
      END IF;
    END LOOP;

    v_numer := v_numer + v_theta * v_lik * v_w;
    v_denom := v_denom + v_lik * v_w;
  END LOOP;

  IF v_denom = 0.0 THEN
    RETURN 0.0;
  END IF;

  RETURN v_numer / v_denom;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp;

-- 2. Server-authoritative response submission with real scenario parameters
CREATE OR REPLACE FUNCTION public.record_assessment_response(
  p_assessment uuid,
  p_scenario_id uuid,
  p_selected_text text,
  p_correct boolean,
  p_option jsonb default null
) RETURNS jsonb AS $$
DECLARE
  v_scenario record;
  v_assessment record;
  v_responses jsonb;
  v_ability_theta jsonb;
  v_comp_responses jsonb := '[]'::jsonb;
  v_new_response jsonb;
  v_new_theta float;
  v_r jsonb;
  v_opt jsonb;
  v_is_correct boolean;
  v_found_option boolean;
BEGIN
  -- Read scenario with security definer to access irt parameters and authoritative options
  SELECT id, prompt, competency, irt_a, irt_b, irt_c, international_benchmark, options
    INTO v_scenario
  FROM public.scenarios
  WHERE id = p_scenario_id;

  IF v_scenario.id IS NULL THEN
    RAISE EXCEPTION 'Scenario not found: %', p_scenario_id;
  END IF;

  -- Lock assessment row to serialize concurrent answer submissions
  SELECT id, student_id, status, responses, ability_theta
    INTO v_assessment
  FROM public.assessments
  WHERE id = p_assessment
  FOR UPDATE;

  IF v_assessment.id IS NULL THEN
    RAISE EXCEPTION 'Assessment not found: %', p_assessment;
  END IF;

  -- Verify assessment status is active
  IF v_assessment.status != 'in_progress' THEN
    RAISE EXCEPTION 'Assessment is not active (current status: %)', v_assessment.status;
  END IF;

  -- IDOR Protection: Verify caller ownership
  -- 1. Authenticated user must own the assessment
  IF auth.uid() IS NOT NULL AND auth.uid() != v_assessment.student_id THEN
    RAISE EXCEPTION 'Access denied: You do not own this assessment';
  END IF;

  -- 2. Anonymous caller cannot mutate assessments belonging to registered users
  IF auth.uid() IS NULL AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = v_assessment.student_id) THEN
    RAISE EXCEPTION 'Access denied: Authentication required for this assessment';
  END IF;

  v_responses := COALESCE(v_assessment.responses, '[]'::jsonb);
  v_ability_theta := COALESCE(v_assessment.ability_theta, '{}'::jsonb);

  -- Prevent duplicate submissions for the same scenario in one assessment session
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_responses) r
    WHERE (r->>'scenario_id')::uuid = v_scenario.id
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'competency', v_scenario.competency,
      'theta', (v_ability_theta->>v_scenario.competency)::float,
      'ability_theta', v_ability_theta,
      'response_count', jsonb_array_length(v_responses),
      'duplicate_ignored', true
    );
  END IF;

  -- Authoritatively derive correctness from scenario options if available
  v_is_correct := p_correct;
  IF v_scenario.options IS NOT NULL AND jsonb_typeof(v_scenario.options) = 'array' AND jsonb_array_length(v_scenario.options) > 0 THEN
    v_is_correct := false;
    v_found_option := false;
    FOR v_opt IN SELECT * FROM jsonb_array_elements(v_scenario.options) LOOP
      IF v_opt->>'text' = p_selected_text THEN
        v_is_correct := COALESCE((v_opt->>'correct')::boolean, (v_opt->>'is_correct')::boolean, false);
        v_found_option := true;
        EXIT;
      END IF;
    END LOOP;
    IF NOT v_found_option THEN
      RAISE EXCEPTION 'Invalid selection: Option not found in scenario options';
    END IF;
  END IF;

  -- Construct new response record with real parameters recorded
  v_new_response := jsonb_build_object(
    'scenario_id', v_scenario.id,
    'prompt', v_scenario.prompt,
    'competency', v_scenario.competency,
    'benchmarkStandard', COALESCE(v_scenario.international_benchmark, 'International Benchmark'),
    'userSelectedOption', p_selected_text,
    'correct', v_is_correct,
    'option', p_option,
    'irt_a', COALESCE(v_scenario.irt_a, 1.0),
    'irt_b', COALESCE(v_scenario.irt_b, 0.0),
    'irt_c', COALESCE(v_scenario.irt_c, 0.25),
    'timestamp', to_char(clock_timestamp(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );

  v_responses := v_responses || jsonb_build_array(v_new_response);

  -- Re-estimate theta for this competency across all historical responses in this session
  FOR v_r IN SELECT * FROM jsonb_array_elements(v_responses) LOOP
    IF v_r->>'competency' = v_scenario.competency THEN
      v_comp_responses := v_comp_responses || jsonb_build_array(jsonb_build_object(
        'a', COALESCE((v_r->>'irt_a')::float, 1.0),
        'b', COALESCE((v_r->>'irt_b')::float, 0.0),
        'c', COALESCE((v_r->>'irt_c')::float, 0.25),
        'correct', (v_r->>'correct')::boolean
      ));
    END IF;
  END LOOP;

  v_new_theta := public.estimate_theta_eap(v_comp_responses);
  v_ability_theta := jsonb_set(v_ability_theta, array[v_scenario.competency], to_jsonb(v_new_theta));

  UPDATE public.assessments
  SET responses = v_responses,
      ability_theta = v_ability_theta
  WHERE id = p_assessment;

  RETURN jsonb_build_object(
    'success', true,
    'competency', v_scenario.competency,
    'theta', v_new_theta,
    'ability_theta', v_ability_theta,
    'response_count', jsonb_array_length(v_responses),
    'new_response', v_new_response
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.record_assessment_response(uuid, uuid, text, boolean, jsonb) TO authenticated, anon;

-- 3. Unified linear scaled scoring in score_competency RPC
CREATE OR REPLACE FUNCTION public.score_competency(
  p_theta float, p_competency text, p_region text default 'global'
) RETURNS TABLE (percentile float, scaled_score int) AS $$
DECLARE
  v_mean float;
  v_std float;
  v_z float;
  v_perc float;
  v_scaled int;
BEGIN
  SELECT mean, std_dev INTO v_mean, v_std
  FROM public.norms
  WHERE competency = p_competency
    AND region = p_region
  ORDER BY version DESC
  LIMIT 1;

  IF v_mean IS NULL THEN
    v_mean := 0.0; v_std := 1.0;
  END IF;

  v_z := (p_theta - v_mean) / v_std;
  -- Standard normal CDF approximation (Abramowitz & Stegun logistic approximation)
  v_perc := 1.0 / (1.0 + exp(-1.702 * v_z));
  
  -- Unified linear scale: 500 mean, 133.33 SD, bounded in [100, 900]
  v_scaled := greatest(100, least(900, round(500.0 + 133.33 * v_z)))::int;

  RETURN QUERY SELECT 
    greatest(1.0, least(99.0, round(v_perc * 100.0)))::float AS percentile,
    v_scaled AS scaled_score;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.score_competency(float, text, text) TO authenticated, anon;

-- 4. Backfill completed assessments with >= 5 responses that lack authoritative scores/percentiles
DO $$
DECLARE
  v_ass record;
  v_responses jsonb;
  v_ability_theta jsonb;
  v_comp_thetas float[];
  v_comp_thetas_sum float;
  v_comp_count int;
  v_avg_theta float;
  v_global_score int;
  v_global_pct float;
  v_norm_mean float := 0.0;
  v_norm_std float := 1.0;
  v_z float;
  v_scaled_scores jsonb;
  v_comp text;
  v_comp_theta float;
  v_comp_responses jsonb;
  v_r jsonb;
  i int;
BEGIN
  FOR v_ass IN
    SELECT id, responses, ability_theta, percentiles
    FROM public.assessments
    WHERE status = 'completed'
      AND (global_score IS NULL OR percentiles IS NULL OR percentiles->>'global' IS NULL)
      AND jsonb_array_length(COALESCE(responses, '[]'::jsonb)) >= 5
  LOOP
    v_responses := v_ass.responses;
    v_ability_theta := COALESCE(v_ass.ability_theta, '{}'::jsonb);
    v_scaled_scores := '{}'::jsonb;
    v_comp_thetas := array[]::float[];

    FOR v_comp IN SELECT DISTINCT r->>'competency' FROM jsonb_array_elements(v_responses) r WHERE r->>'competency' IS NOT NULL LOOP
      IF (v_ability_theta->>v_comp) IS NOT NULL THEN
        v_comp_theta := (v_ability_theta->>v_comp)::float;
      ELSE
        v_comp_responses := '[]'::jsonb;
        FOR v_r IN SELECT * FROM jsonb_array_elements(v_responses) LOOP
          IF v_r->>'competency' = v_comp THEN
            v_comp_responses := v_comp_responses || jsonb_build_array(jsonb_build_object(
              'a', COALESCE((v_r->>'irt_a')::float, (v_r->>'a')::float, 1.0),
              'b', COALESCE((v_r->>'irt_b')::float, (v_r->>'b')::float, 0.0),
              'c', COALESCE((v_r->>'irt_c')::float, (v_r->>'c')::float, 0.25),
              'correct', COALESCE((v_r->>'correct')::boolean, false)
            ));
          END IF;
        END LOOP;
        v_comp_theta := public.estimate_theta_eap(v_comp_responses);
        v_ability_theta := jsonb_set(v_ability_theta, array[v_comp], to_jsonb(v_comp_theta));
      END IF;

      v_comp_thetas := array_append(v_comp_thetas, v_comp_theta);
      v_scaled_scores := jsonb_set(
        v_scaled_scores,
        array[v_comp],
        to_jsonb(greatest(100, least(900, round(500.0 + 133.33 * v_comp_theta)))::int)
      );
    END LOOP;

    v_comp_count := array_length(v_comp_thetas, 1);
    IF v_comp_count IS NOT NULL AND v_comp_count > 0 THEN
      v_comp_thetas_sum := 0.0;
      FOR i IN 1..v_comp_count LOOP
        v_comp_thetas_sum := v_comp_thetas_sum + v_comp_thetas[i];
      END LOOP;
      v_avg_theta := v_comp_thetas_sum / v_comp_count;

      v_global_score := greatest(100, least(900, round(500.0 + 133.33 * v_avg_theta)))::int;
      v_z := (v_avg_theta - v_norm_mean) / v_norm_std;
      v_global_pct := greatest(1.0, least(99.0, round(100.0 / (1.0 + exp(-1.702 * v_z)))))::float;

      UPDATE public.assessments
      SET global_score = v_global_score,
          ability_theta = v_ability_theta,
          scaled_scores = v_scaled_scores,
          percentiles = COALESCE(v_ass.percentiles, '{}'::jsonb) || jsonb_build_object('global', v_global_pct, 'Global', v_global_pct)
      WHERE id = v_ass.id;
    END IF;
  END LOOP;
END;
$$;
