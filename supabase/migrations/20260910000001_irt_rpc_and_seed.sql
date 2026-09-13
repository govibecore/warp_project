-- 1. RPC for Adaptive Engine (next_scenario)
create or replace function public.next_scenario(
  p_student uuid,
  p_theta jsonb,            -- current ability per competency (e.g. {"scientificInquiry": 0.5})
  p_seen uuid[]             -- already-answered scenario ids
) returns setof public.scenarios as $$
  select s.* from public.scenarios s
  where s.is_active = true
    and s.id <> all(coalesce(p_seen, '{}'::uuid[]))
    and s.developmental_band = (
      select case
        when current_class between 3 and 4 then '3-4'
        when current_class between 5 and 6 then '5-6'
        when current_class between 7 and 8 then '7-8'
        when current_class between 9 and 10 then '9-10'
        else '11-12' end
      from public.students where id = p_student
    )
  order by abs(s.irt_b - coalesce((p_theta->>s.competency)::float, 0)) asc
  limit 1;
$$ language sql stable security definer;

-- 2. RPC for Norms (score_competency)
create or replace function public.score_competency(
  p_theta float, p_competency text, p_region text default 'global'
) returns table (percentile float, scaled_score int) as $$
declare
  v_mean float;
  v_std float;
  v_z float;
  v_perc float;
begin
  select mean, std_dev into v_mean, v_std
  from public.norms
  where competency = p_competency
    and region = p_region
  order by version desc
  limit 1;

  if v_mean is null then
    v_mean := 0; v_std := 1;
  end if;

  v_z := (p_theta - v_mean) / v_std;
  -- Logistic approximation to standard normal CDF for percentile mapping
  v_perc := 1.0 / (1.0 + exp(-1.702 * v_z));
  
  return query select 
    (v_perc * 100)::float as percentile,
    (100 + v_perc * 800)::int as scaled_score;
end;
$$ language plpgsql stable;

-- 3. Seed Norms
insert into public.norms (region, class_level, difficulty, competency, mean, std_dev, version, is_provisional)
values 
  ('global', 8, 'standard', 'scientificInquiry', 0.0, 1.0, '2026-Q3', true),
  ('global', 8, 'standard', 'computationalThinking', 0.0, 1.0, '2026-Q3', true),
  ('global', 8, 'standard', 'engineeringDesign', 0.0, 1.0, '2026-Q3', true),
  ('global', 8, 'standard', 'mathematicalReasoning', 0.0, 1.0, '2026-Q3', true),
  ('global', 8, 'standard', 'systemsThinking', 0.0, 1.0, '2026-Q3', true)
on conflict do nothing;

-- 4. Seed Resources
insert into public.resources (key, title, url, category, difficulty, competency)
values
  ('khan-algebra', 'Intro to Algebra', 'https://khanacademy.org/algebra', 'practice', 'beginner', 'mathematicalReasoning'),
  ('phet-circuits', 'PhET Circuit Construction', 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html', 'project', 'intermediate', 'scientificInquiry'),
  ('scratch-intro', 'Scratch Programming', 'https://scratch.mit.edu', 'course', 'beginner', 'computationalThinking')
on conflict do nothing;

-- 5. Seed Scenarios (IRT parameters: a=discrimination, b=difficulty, c=guessing)
insert into public.scenarios (scenario_code, competency, developmental_band, difficulty, prompt, options, irt_a, irt_b, irt_c)
values
  ('SCI-8-01', 'scientificInquiry', '7-8', 'standard', 'A student observes that a pendulum swings faster when the string is shortened. Which hypothesis is most directly supported?', 
   '[{"text": "Pendulums with heavier bobs swing slower.", "correct": false}, {"text": "String length is inversely proportional to swing frequency.", "correct": true}, {"text": "Air resistance affects short strings less.", "correct": false}, {"text": "The angle of release determines the speed.", "correct": false}]'::jsonb, 
   1.2, -0.5, 0.25),
   
  ('SCI-8-02', 'scientificInquiry', '7-8', 'standard', 'In an experiment testing fertilizer on plant growth, what is the independent variable?', 
   '[{"text": "Plant height", "correct": false}, {"text": "Sunlight exposure", "correct": false}, {"text": "Amount of fertilizer", "correct": true}, {"text": "Soil type", "correct": false}]'::jsonb, 
   0.8, -1.0, 0.25),
   
  ('SCI-8-03', 'scientificInquiry', '7-8', 'standard', 'Which of the following would NOT be a reliable way to measure the rate of photosynthesis?', 
   '[{"text": "Oxygen production rate", "correct": false}, {"text": "Carbon dioxide consumption", "correct": false}, {"text": "Chlorophyll color intensity", "correct": true}, {"text": "Biomass accumulation", "correct": false}]'::jsonb, 
   1.5, 0.5, 0.25),
   
  ('CT-8-01', 'computationalThinking', '7-8', 'standard', 'A program needs to print numbers 1 to 100. Which control structure is most appropriate?', 
   '[{"text": "If-else statement", "correct": false}, {"text": "For loop", "correct": true}, {"text": "Switch statement", "correct": false}, {"text": "Recursive function", "correct": false}]'::jsonb, 
   1.0, -0.8, 0.25),
   
  ('CT-8-02', 'computationalThinking', '7-8', 'standard', 'What is the binary representation of the decimal number 13?', 
   '[{"text": "1011", "correct": false}, {"text": "1101", "correct": true}, {"text": "1110", "correct": false}, {"text": "1001", "correct": false}]'::jsonb, 
   1.4, 0.2, 0.25),
   
  ('CT-8-03', 'computationalThinking', '7-8', 'standard', 'Which algorithmic approach solves a problem by breaking it down into smaller subproblems of the same type?', 
   '[{"text": "Greedy approach", "correct": false}, {"text": "Divide and conquer", "correct": true}, {"text": "Brute force", "correct": false}, {"text": "Dynamic programming", "correct": false}]'::jsonb, 
   1.8, 1.2, 0.25),
   
  ('ED-8-01', 'engineeringDesign', '7-8', 'standard', 'When building a bridge, triangles are often used in the truss structure because they:', 
   '[{"text": "Use less material than squares", "correct": false}, {"text": "Are visually appealing", "correct": false}, {"text": "Distribute weight evenly and prevent shear", "correct": true}, {"text": "Are easier to weld together", "correct": false}]'::jsonb, 
   1.1, -0.3, 0.25),
   
  ('ED-8-02', 'engineeringDesign', '7-8', 'standard', 'What is the primary purpose of a prototype in the engineering design process?', 
   '[{"text": "To sell the product to investors", "correct": false}, {"text": "To test the functionality of a design concept", "correct": true}, {"text": "To finalize the manufacturing blueprint", "correct": false}, {"text": "To patent the idea quickly", "correct": false}]'::jsonb, 
   0.9, -1.2, 0.25),
   
  ('MR-8-01', 'mathematicalReasoning', '7-8', 'standard', 'If 3x + 7 = 22, what is the value of x?', 
   '[{"text": "5", "correct": true}, {"text": "6", "correct": false}, {"text": "15", "correct": false}, {"text": "4", "correct": false}]'::jsonb, 
   1.5, -0.5, 0.2),
   
  ('MR-8-02', 'mathematicalReasoning', '7-8', 'standard', 'A train travels 120 km in 1.5 hours. What is its average speed?', 
   '[{"text": "60 km/h", "correct": false}, {"text": "80 km/h", "correct": true}, {"text": "90 km/h", "correct": false}, {"text": "100 km/h", "correct": false}]'::jsonb, 
   1.2, 0.0, 0.2),
   
  ('ST-8-01', 'systemsThinking', '7-8', 'standard', 'In a predator-prey system, a sudden decline in the predator population will initially cause the prey population to:', 
   '[{"text": "Decrease rapidly", "correct": false}, {"text": "Increase rapidly", "correct": true}, {"text": "Remain unchanged", "correct": false}, {"text": "Migrate to a new area", "correct": false}]'::jsonb, 
   1.0, -0.7, 0.25),
   
  ('ST-8-02', 'systemsThinking', '7-8', 'standard', 'Which is an example of a positive feedback loop?', 
   '[{"text": "Sweating to cool down body temperature", "correct": false}, {"text": "A thermostat turning off a heater", "correct": false}, {"text": "Melting ice reducing albedo, causing more warming", "correct": true}, {"text": "Predators eating prey to control population", "correct": false}]'::jsonb, 
   1.6, 0.8, 0.25)
on conflict do nothing;
