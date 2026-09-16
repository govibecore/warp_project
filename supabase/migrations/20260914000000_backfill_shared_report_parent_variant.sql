-- Backfill parent_variant for seed report row that has a share_token
-- but was inserted with parent_variant = null.
-- This ensures existing share links render content via SharedReport component.

UPDATE public.reports
SET parent_variant = '{
  "overallAssessment": "Diagnostic Executive Evaluation for Parents (Class 8)\nNational Standing: 72nd Percentile across Indian Schools (CBSE/ICSE Grade: A - Distinction) | Global Scaled Score: 680/900\n\nYour child demonstrates strong foundational analytical ability, ranking in the top quartile nationally. However, the international benchmark gap - particularly against Singapore SASMO and AMC 8 standards - reveals a pattern of relying on textbook procedures rather than first-principles reasoning.\n\nCore Takeaway for Parents:\nIn standard classroom examinations, this approach often yields 90%+ marks. In national Olympiads (SOF IMO/NSO) and international competitions (such as AMC 8/10 or SASMO), it breaks down because questions are explicitly engineered to disarm routine algorithms. Follow the actionable blueprint below to cultivate deep, competitive mathematical and scientific reasoning.",
  "realityCheckSummary": "Your child performs at the 76th percentile globally - a strong foundation. The critical gap is between passive formula recall and active first-principles modeling, which is exactly what SASMO, AMC 8, and PISA assess.",
  "internationalGapSummary": "Against Singapore SASMO peers (70th percentile equivalent), your child trails by approximately 0.4 sigma - equivalent to 6 months of focused heuristic training. This gap is fully recoverable with structured practice on non-routine problem sets.",
  "gradeInflationWarning": "Indian school examination marks (90–95%) are systematically inflated relative to international standards. A 680/900 global scaled score is honest, competitive, and actionable - it represents real analytical potential that targeted preparation can convert into Olympiad-level performance.",
  "keyStrengths": [
    "Demonstrated baseline resilience across challenging competitive and international problem sets.",
    "High growth velocity when provided with structured heuristic frameworks.",
    "Strong comparative standing in the top quartile nationally (72nd percentile India, 76th percentile globally)."
  ],
  "growthAreas": [
    "Heuristic gap: tendency to rush to calculation without rigorous first-principles verification.",
    "Susceptibility to non-standard distractors engineered around common textbook misconceptions.",
    "Underdeveloped visual bar modeling habits compared to Singapore cohorts."
  ],
  "actionPlan": [
    {
      "title": "Implement First-Principles Diagramming Routine",
      "description": "Require your child to draw diagrams and define invariants before writing equations.",
      "estimatedDuration": "45 mins/week"
    },
    {
      "title": "Weekly Error Autopsy",
      "description": "Review wrong answers together: why was the trap answer tempting? What fundamental rule was broken?",
      "estimatedDuration": "30 mins/Sunday"
    },
    {
      "title": "Register for Authentic Competitions",
      "description": "Enter SOF Olympiads (IMO/NSO), SASMO, AMC 8/10, or Bebras for authentic calibration.",
      "estimatedDuration": "1–2 months"
    }
  ],
  "recommendedCurricula": [
    {
      "name": "NCERT Exemplar Problems (Class 8–9)",
      "urlDescription": "ncert.nic.in",
      "purpose": "Non-routine problems beyond standard textbook. Forces genuine reasoning."
    },
    {
      "name": "MTG Foundation Course",
      "urlDescription": "mtg.in",
      "purpose": "Olympiad-calibrated workbooks aligned to SASMO and IMO difficulty levels."
    }
  ],
  "immediateHomeRoutines": [
    "10 minutes of mental math daily (no calculator for non-routine problems)",
    "2-Minute Explanation Rule: after correct answers, ask child to explain why other choices are impossible",
    "Weekly review of one non-routine Olympiad problem together"
  ],
  "ptmDiscussionGuide": [
    "Ask teacher: Does my child attempt problems they haven''t seen before, or only familiar templates?",
    "Ask teacher: How does my child perform on extended/open-ended questions vs. standard recall questions?",
    "Request sample Olympiad-style questions to use as a home diagnostic."
  ],
  "benchmark": {
    "globalScore": 680,
    "globalPercentile": 76,
    "aggregateScaledScore": 680,
    "indiaNationalPercentile": 72,
    "regionalPercentiles": {
      "Global": 76,
      "Singapore": 70,
      "India": 72
    },
    "realityCheck": {
      "verdict": "Strong Foundation - International Gap Present",
      "honestSummary": "Your child performs at the 76th percentile globally - a strong foundation. The critical gap is between passive formula recall and active first-principles modeling.",
      "internationalGapSummary": "Against Singapore SASMO peers (70th percentile equivalent), your child trails by approximately 0.4 sigma - equivalent to 6 months of focused heuristic training.",
      "gradeInflationWarning": "Indian school examination marks are systematically inflated relative to international standards. A 680/900 global scaled score is honest, competitive, and actionable."
    },
    "boardGradeBand": {
      "grade": "A",
      "band": "Distinction"
    }
  },
  "classLevel": 8,
  "subject": "STEM"
}'::jsonb
WHERE share_token = 'warp_09730fa81kums0'
  AND parent_variant IS NULL;
