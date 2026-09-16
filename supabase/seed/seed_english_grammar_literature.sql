INSERT INTO public.scenarios (
  scenario_code, subject, competency, developmental_band, difficulty,
  prompt, options, learning_objective, hint,
  irt_a, irt_b, irt_c, is_active, usage_count, international_benchmark, question_type, metadata
) VALUES
('ENG-LIT-01', 'English Literacy', 'literature_analysis', '9-10', 'advanced', 'In Shakespeare''s Macbeth, what is the primary thematic significance of the "blood" motif? Provide a short paragraph analyzing it.', '[]'::jsonb, 'Thematic analysis in classic literature', 'Think about guilt and its permanent psychological stain.', 1.3, 0.6, 0, true, 0, 'IGCSE English Literature', 'code_block', '{"language": "text", "expectedKeywords": ["guilt", "conscience", "stain"]}'),
('ENG-GRAM-01', 'English Literacy', 'grammar_syntax', '7-8', 'standard', 'Identify and correct the dangling modifier in the following sentence: "Walking down the street, the trees were beautiful." Type the corrected sentence.', '[]'::jsonb, 'Grammar and Syntax correction', 'Who is walking down the street? The trees cannot walk.', 1.1, -0.2, 0, true, 0, 'Common Core ELA', 'code_block', '{"language": "text", "expectedKeywords": ["As I was walking", "While walking"]}')
ON CONFLICT (scenario_code) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  question_type = EXCLUDED.question_type,
  metadata = EXCLUDED.metadata;
