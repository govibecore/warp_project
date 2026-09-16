INSERT INTO public.scenarios (
  scenario_code, subject, competency, developmental_band, difficulty,
  prompt, options, learning_objective, hint,
  irt_a, irt_b, irt_c, is_active, usage_count, international_benchmark, question_type, metadata
) VALUES
('STEM-CS-ALG-01', 'STEM', 'algorithmic_thinking', '7-8', 'advanced', 'Write a JavaScript function `fib(n)` that returns the nth Fibonacci number efficiently.', '[]'::jsonb, 'Algorithmic efficiency and recursion.', 'Consider using memoization or an iterative approach to avoid O(2^n) time complexity.', 1.5, 0.5, 0, true, 0, 'USACO Bronze', 'code_block', '{"language": "javascript", "expectedPattern": "function fib"}'),
('STEM-PHY-01', 'STEM', 'physics_analysis', '9-10', 'advanced', 'A 5kg block rests on a frictionless table. A force of 20N is applied. What is the acceleration? Enter the formula and result.', '[]'::jsonb, 'Newton''s Second Law', 'F = m*a', 1.2, 0.2, 0, true, 0, 'AP Physics 1', 'math_input', '{"expectedResult": "4 m/s^2"}')
ON CONFLICT (scenario_code) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  question_type = EXCLUDED.question_type,
  metadata = EXCLUDED.metadata;
