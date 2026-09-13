-- Migration: 20260913000003_seed_english_literacy_scenarios.sql
-- 1. Expand competency check constraint to include evaluatingReflecting
ALTER TABLE public.scenarios DROP CONSTRAINT IF EXISTS scenarios_competency_check;
ALTER TABLE public.scenarios ADD CONSTRAINT scenarios_competency_check CHECK (competency in (
  'scientificInquiry','computationalThinking','engineeringDesign','mathematicalReasoning','systemsThinking',
  'understanding','locatingInformation','synthesis','evaluatingReflecting'
));

-- 2. Update next_scenario RPC to flexibly match both 'English' and 'English Literacy'
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

  -- Return the optimal next item, matching subject (handling both 'English' and 'English Literacy')
  RETURN QUERY
    SELECT
      s.id, s.scenario_code, s.subject, s.competency, s.developmental_band,
      s.difficulty, s.prompt, s.context_image, s.options,
      s.learning_objective, s.hint, s.is_active, s.usage_count, s.created_at
    FROM public.scenarios s
    WHERE s.is_active = true
      AND (
        s.subject = v_subject
        OR (v_subject IN ('English', 'English Literacy') AND s.subject IN ('English', 'English Literacy'))
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

-- 3. Comprehensive Seed Bank for English Literacy across all developmental bands (3-4, 5-6, 7-8, 9-10, 11-12)
INSERT INTO public.scenarios (scenario_code, subject, competency, developmental_band, difficulty, prompt, options, irt_a, irt_b, irt_c)
VALUES
  -- ── Band 3-4 (Elementary / Primary) ──────────────────────────
  ('ENG-34-UND-01', 'English', 'understanding', '3-4', 'standard',
   'Read the passage: "Leo the puppy buried his favorite rubber bone under the old oak tree so his sister Maya would not chew it." Why did Leo bury the bone?',
   '[{"text": "He wanted to keep it safe from Maya.", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "He forgot where the tree was.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "He did not like playing with rubber toys.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Maya told him to bury it.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.1, -1.2, 0.25),

  ('ENG-34-LOC-01', 'English', 'locatingInformation', '3-4', 'standard',
   'Notice Board: "School Library Hours: Monday to Thursday: 8:00 AM – 3:30 PM. Friday: Closed for cataloging." On which day is the library closed for cataloging?',
   '[{"text": "Friday", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "Monday", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Thursday", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Saturday", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.3, -1.0, 0.25),

  ('ENG-34-SYN-01', 'English', 'synthesis', '3-4', 'standard',
   'Text A: "Seeds require water and sunlight to sprout." Text B: "Mia placed her pot in a dark cupboard and watered it daily, but nothing grew." What was missing for Mia''s seeds?',
   '[{"text": "Adequate sunlight", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "Fresh water", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Fertile soil", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "A larger pot", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.0, -0.8, 0.25),

  ('ENG-34-EVL-01', 'English', 'evaluatingReflecting', '3-4', 'advanced',
   '"Drink SparkleJuice! It gives you instant superhero wings!" What is the main intention of this advertisement?',
   '[{"text": "To convince children to buy the drink using playful exaggeration", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "To warn people about flying hazards", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "To teach children how bird wings function", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "To describe the exact vitamin ingredients of the juice", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.2, -0.5, 0.25),

  ('ENG-34-UND-02', 'English', 'understanding', '3-4', 'standard',
   'Read: "Although it was raining heavily, Sarah put on her yellow raincoat and walked happily toward the puddle." How did Sarah feel about the rain?',
   '[{"text": "She was excited and eager to play outside.", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "She was frightened of getting wet.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "She was upset that her shoes were ruined.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "She wanted to stay inside all afternoon.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.0, -1.1, 0.25),

  ('ENG-34-LOC-02', 'English', 'locatingInformation', '3-4', 'standard',
   'Recipe: "Fruit Salad: 2 sliced bananas, 1 cup blueberries, 1 tablespoon honey. Chill in refrigerator for 20 minutes before serving." How long should the salad chill?',
   '[{"text": "20 minutes", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "2 hours", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "10 minutes", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Overnight", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.2, -1.3, 0.25),

  -- ── Band 5-6 (Upper Primary / Middle School Prep) ─────────────
  ('ENG-56-UND-01', 'English', 'understanding', '5-6', 'standard',
   '"The desert fox remains underground throughout the scorching daylight hours, emerging only when twilight cools the sand dunes." What adaptation is described?',
   '[{"text": "Nocturnal behavior to conserve moisture and avoid extreme heat", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "Hunting prey that only sleeps at night", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Poor eyesight in dim evening light", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Migrating toward cooler coastal regions during summer", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.1, -0.6, 0.25),

  ('ENG-56-LOC-01', 'English', 'locatingInformation', '5-6', 'standard',
   'Exhibition Guide: "Robotics Pavilion: Hall B (Level 2). Renewable Energy: Hall A (Level 1). Biomimicry Workshop: Hall D (Level 3)." Where can a visitor attend the Biomimicry Workshop?',
   '[{"text": "Hall D on Level 3", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "Hall B on Level 2", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Hall A on Level 1", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "The main auditorium", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.2, -0.7, 0.25),

  ('ENG-56-SYN-01', 'English', 'synthesis', '5-6', 'standard',
   'Article 1: "Mangroves trap sediment and dissipate ocean storm waves." Article 2: "Villages situated behind intact coastal mangrove forests suffered 70% less flood damage during Cyclone Vayu." What synthesis connects these two articles?',
   '[{"text": "Mangrove conservation directly shields coastal communities from extreme wave impact.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "Mangroves grow exclusively during cyclonic seasons.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Cyclones prevent sedimentation along coastal estuaries.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Villages should replace mangrove belts with concrete sea walls.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.3, -0.2, 0.25),

  ('ENG-56-EVL-01', 'English', 'evaluatingReflecting', '5-6', 'advanced',
   '"No true athlete would ever consume soda instead of HydrateMax." Which persuasive technique is the author using here?',
   '[{"text": "An appeal to group identity and peer exclusion", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "Objective statistical data from medical trials", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "Chronological historical explanation", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "Impartial scientific comparison of electrolyte levels", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.2, 0.1, 0.25),

  ('ENG-56-UND-02', 'English', 'understanding', '5-6', 'standard',
   '"The inventor’s workspace was a tempest of crumpled blueprints, half-wired circuit boards, and lukewarm tea." What mood does this description convey?',
   '[{"text": "Frenzied, disorganized creative dedication", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "Sterile and regimented corporate precision", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Hopelessness and impending failure", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Relaxed leisure and casual recreation", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.1, -0.4, 0.25),

  ('ENG-56-SYN-02', 'English', 'synthesis', '5-6', 'olympiad',
   'Passage: "Ancient travelers in the Sahara relied on date palms as natural beacons. Where date palms flourished, subterranean aquifers were inevitably close to the surface." What can be inferred about an expedition spotting a cluster of date palms?',
   '[{"text": "Underground freshwater is accessible nearby.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "The area is experiencing heavy surface rainfall.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "A permanent settlement has established stone wells.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "The soil is too saline for any other vegetation.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.4, 0.3, 0.25),

  -- ── Band 7-8 (Lower Secondary / Cambridge Checkpoint) ─────────
  ('ENG-78-UND-01', 'English', 'understanding', '7-8', 'standard',
   '"While the council heralded the new bypass as an economic boon, residents in the historic quarter lamented the severance of centuries-old footpaths." What is the primary conflict?',
   '[{"text": "Modern vehicular efficiency versus preserved communal heritage and pedestrian access", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "The financial cost of paving stones versus asphalt", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "A dispute over the council’s election timetable", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Disagreement between motorists on speed limits", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.2, 0.0, 0.25),

  ('ENG-78-LOC-01', 'English', 'locatingInformation', '7-8', 'standard',
   'Extract from Space Mission Protocol: "During primary booster separation (T+142s), telemetry confirmation is routed to Substation Alpha; telemetry failsafe transfers to Orbital Relay 3 only if primary signal latency exceeds 450 milliseconds." Under what precise condition does telemetry transfer to Orbital Relay 3?',
   '[{"text": "Only when primary booster telemetry latency exceeds 450 ms", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "Immediately upon booster separation at T+142s", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Whenever Substation Alpha completes data verification", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "If the launch vehicle enters geostationary orbit early", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.3, -0.1, 0.25),

  ('ENG-78-SYN-01', 'English', 'synthesis', '7-8', 'advanced',
   'Text 1: "Urban heat islands amplify nighttime temperatures by up to 6°C due to dense concrete and asphalt heat retention." Text 2: "Cities that mandate living green roofs and reflective pavements record a 40% reduction in air conditioning energy demand." What holistic conclusion follows?',
   '[{"text": "Passive architectural interventions in urban surfaces can mitigate both the heat island effect and municipal power grids.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "Air conditioning units are the primary cause of urban heat retention.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Asphalt is required to sustain living green roof systems.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Nighttime temperatures have no measurable bearing on urban energy consumption.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.4, 0.4, 0.25),

  ('ENG-78-EVL-01', 'English', 'evaluatingReflecting', '7-8', 'advanced',
   '"The author repeatedly describes the ancient manuscript as ''whispering secrets from forgotten tombs''." What effect does this personification achieve?',
   '[{"text": "It endows the physical artifact with mysterious agency and historical intimacy.", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "It provides a literal acoustic measurement of deteriorating parchment.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "It proves the text was written by multiple anonymous scribes.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "It casts doubt on the archaeological provenance of the manuscript.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.3, 0.5, 0.25),

  ('ENG-78-UND-02', 'English', 'understanding', '7-8', 'olympiad',
   '"To dismiss the astronomer''s initial anomalies as instrumental noise was convenient, yet it delayed the discovery of the exoplanet by nearly two decades." What does the word "convenient" imply in this context?',
   '[{"text": "Intellectually complacent and self-serving avoidance of unexpected complexity", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "Logistically practical and scientifically rigorous procedure", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Inexpensive in terms of computational hardware costs", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Carefully timed to match international conference deadlines", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.5, 0.8, 0.25),

  -- ── Band 9-10 (Upper Secondary / IGCSE / ICSE / CBSE 10) ─────
  ('ENG-910-UND-01', 'English', 'understanding', '9-10', 'standard',
   '"The biographer does not romanticize the statesman''s triumphs; rather, she dissects his compromises with the forensic detachment of an anatomist." What characterizes the biographer''s style?',
   '[{"text": "Unsentimental, rigorous, and analytically critical examination", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "Hagiographic celebration of patriotic martyrdom", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Superficial sensationalism focused on court intrigue", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Nostalgic praise for obsolete diplomatic conventions", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.3, 0.6, 0.25),

  ('ENG-910-LOC-01', 'English', 'locatingInformation', '9-10', 'standard',
   'Regulatory Dossier: "Section 4.2: Additive X is prohibited in dairy packaging unless the migration coefficient into aqueous food simulants remains below 0.05 mg/dm² over a 10-day testing cycle at 40°C." What threshold must Additive X satisfy to be permissible?',
   '[{"text": "Migration coefficient strictly below 0.05 mg/dm² under standard 10-day, 40°C conditions", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "Zero trace migration at room temperature for 30 days", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "A concentration greater than 0.5 mg/dm² in lipid food simulants", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Thermal stability up to 100°C regardless of food contact", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.4, 0.3, 0.25),

  ('ENG-910-SYN-01', 'English', 'synthesis', '9-10', 'advanced',
   'Viewpoint Alpha: "Generative linguistic models expand cognitive bandwidth by automating boilerplate formulation." Viewpoint Beta: "Cognitive offloading to algorithmic text generators atrophies the neural pathways responsible for deep semantic synthesis." How do these viewpoints reconcile in an analytical synthesis?',
   '[{"text": "While algorithmic tools expedite mechanical output, unmediated deliberate composition remains indispensable for cultivating deep conceptual reasoning.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "Both viewpoints agree that textual syntax has no bearing on intellectual agility.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Viewpoint Alpha demonstrates that semantic synthesis is obsolete in the 21st century.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "Viewpoint Beta proves that linguistic models cannot generate grammatically cohesive sentences.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.5, 0.9, 0.25),

  ('ENG-910-EVL-01', 'English', 'evaluatingReflecting', '9-10', 'advanced',
   '"The columnist introduces his editorial with an idyllic portrait of self-sufficient village life before arguing against subsidized rural broadband." What rhetorical purpose does this opening portrait serve?',
   '[{"text": "It constructs a nostalgic pastoral ideal to frame external technological integration as disruptive or unnecessary.", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "It provides audited economic figures on agrarian infrastructure spending.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "It refutes claims that agricultural yields correlate with internet connectivity.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "It demonstrates personal expertise in fiber-optic telecommunications engineering.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.4, 0.7, 0.25),

  ('ENG-910-UND-02', 'English', 'understanding', '9-10', 'olympiad',
   '"The novel''s protagonist mistakes cynicism for maturity, viewing every act of altruism as a disguised transaction." What core tragic flaw does this passage diagnose?',
   '[{"text": "A warped worldview where defensive skepticism preempts genuine interpersonal connection", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "A failure to manage commercial household ledgers", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "An ambition to amass financial wealth through speculative trade", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "A literal inability to distinguish barter contracts from donations", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.5, 1.1, 0.25),

  -- ── Band 11-12 (Pre-University / IB Diploma / Cambridge A-Level) ─
  ('ENG-1112-UND-01', 'English', 'understanding', '11-12', 'standard',
   '"Post-structuralist historiography posits that archival documents do not merely reflect past reality, but encode the institutional power structures that authorized their preservation." What does this premise imply for historical inquiry?',
   '[{"text": "Researchers must interrogatively evaluate what omissions and biases were structurally produced by the institutions archiving the records.", "correct": true, "evidence": [{"competency": "understanding", "earnedWeight": 1}]}, {"text": "Archival preservation is an entirely objective and value-neutral technical discipline.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Historical texts written before the printing press contain no verifiable chronological data.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}, {"text": "Institutions actively destroyed all private correspondence to favor public proclamations.", "correct": false, "evidence": [{"competency": "understanding", "earnedWeight": 0}]}]'::jsonb,
   1.4, 1.0, 0.25),

  ('ENG-1112-LOC-01', 'English', 'locatingInformation', '11-12', 'standard',
   'Constitutional Precedent Summary: "In Matter of Jurisdiction [2024] UKSC 12, the majority held that extraterritorial discovery orders are justiciable under Article 6(1) only when the subject entity maintains a substantial corporate nexus within the forum state, explicitly distinguishing the jurisdictional test established in Al-Skeini." According to this ruling, when do extraterritorial discovery orders become justiciable under Article 6(1)?',
   '[{"text": "Strictly when the subject entity possesses a substantial corporate nexus within the forum state", "correct": true, "evidence": [{"competency": "locatingInformation", "earnedWeight": 1}]}, {"text": "Whenever diplomatic immunity is formally waived by the executive branch", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Under identical jurisdictional criteria as those formulated in Al-Skeini", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}, {"text": "Only in criminal prosecutions involving maritime salvage treaties", "correct": false, "evidence": [{"competency": "locatingInformation", "earnedWeight": 0}]}]'::jsonb,
   1.5, 0.9, 0.25),

  ('ENG-1112-SYN-01', 'English', 'synthesis', '11-12', 'advanced',
   'Epistemological Text X: "Empirical verificationism grounds truth assertions strictly in observational protocol sentences." Epistemological Text Y: "Quine''s holism demonstrates that our statements about the external world face the tribunal of sense experience not individually, but only as a corporate body." How does Text Y challenge Text X?',
   '[{"text": "By demonstrating that theoretical webs of belief cannot be parsed into isolated, independently verifiable observation statements.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "By proving that sensory observation plays no functional role in scientific paradigm shifts.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "By arguing that formal symbolic logic is inherently contradictory.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "By affirming that protocol sentences possess unassailable Cartesian certainty.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.6, 1.4, 0.25),

  ('ENG-1112-EVL-01', 'English', 'evaluatingReflecting', '11-12', 'advanced',
   '"The essayist employs an ironically understated, clinically sterile vocabulary to recount catastrophic wartime civilian displacement." What stylistic dissonance is generated, and to what end?',
   '[{"text": "The contrast between emotional devastation and bureaucratic coldness indicts the dehumanizing detachment of modern geopolitical conflict.", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "The dry vocabulary reveals that the author lacked first-hand testimony of the events described.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "The understated phrasing aims to minimize reader anxiety so the publication passes military censorship.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "It transforms the historical essay into an operational handbook for battlefield logistics.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.5, 1.3, 0.25),

  ('ENG-1112-SYN-02', 'English', 'synthesis', '11-12', 'olympiad',
   'Comparative Poetics: "While Romantic naturalism constructed the wilderness as an uncorrupted sublime cathedral, modern ecocritical theory deconstructs this binary, arguing that the myth of ''pure nature'' abdicates human ecological accountability in hybrid industrial anthropocenes." What conceptual shift is articulated?',
   '[{"text": "A transition from idealizing nature as an external, pristine sanctuary to recognizing humanity''s inescapable entanglement within anthropogenically altered ecosystems.", "correct": true, "evidence": [{"competency": "synthesis", "earnedWeight": 1}]}, {"text": "A rejection of industrial manufacturing in favor of pastoral pre-industrial agrarian lifestyles.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "The validation of Romantic sublime theology as the sole effective basis for modern climate legislation.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}, {"text": "A proof that literary criticism has no intersection with contemporary environmental science.", "correct": false, "evidence": [{"competency": "synthesis", "earnedWeight": 0}]}]'::jsonb,
   1.6, 1.7, 0.25),

  ('ENG-1112-EVL-02', 'English', 'evaluatingReflecting', '11-12', 'olympiad',
   '"When the narrative shifts abruptly from third-person omniscience into fractured first-person internal monologue, what psychometric disruption occurs for the reader?"',
   '[{"text": "The reader is stripped of panoramic certainty and forced to navigate the narrator''s subjective unreliability and epistemic disorientation.", "correct": true, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 1}]}, {"text": "The plot chronology is halted to insert an expository character biography.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "The linguistic register simplifies to accommodate younger reading demographics.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}, {"text": "The author signals that the preceding events were entirely a fabricated dream sequence.", "correct": false, "evidence": [{"competency": "evaluatingReflecting", "earnedWeight": 0}]}]'::jsonb,
   1.7, 1.8, 0.25);
