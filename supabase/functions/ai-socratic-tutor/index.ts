// supabase/functions/ai-socratic-tutor/index.ts
// Server-side Socratic hint/tutor — NVIDIA keys in Supabase Vault only.

import { serve } from "@std/http/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_CASCADE = [
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', baseURL: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY' },
  { id: 'mistralai/mistral-7b-instruct:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { scenarioContext, studentQuestion, classLevel, mode } = await req.json();

    const isHint = mode === 'hint';
    const systemPrompt = isHint
      ? `You are a Socratic hint generator for an international STEM assessment (Class ${classLevel || 8}). Provide a single, powerful 1-2 sentence guiding question that directs the student's attention to the core constraint or physical invariant WITHOUT revealing the answer.`
      : `You are the Axiom Socratic STEM Tutor powered by NVIDIA Nemotron. Guide Class ${classLevel || 8} students to understand deep STEM principles using the Socratic method. Never give the final answer — ask guiding questions. Keep answers concise (under 150 words).`;

    const userPrompt = isHint
      ? `Scenario: "${scenarioContext?.prompt}"\nCompetency: ${scenarioContext?.competency}`
      : `Problem: "${scenarioContext?.prompt}"\nCompetency: ${scenarioContext?.competency}\nStudent Selected: "${scenarioContext?.userSelectedOption || 'None'}"\nQuestion: "${studentQuestion}"`;

    for (const model of MODEL_CASCADE) {
      const apiKey = Deno.env.get(model.keyEnv);
      if (!apiKey) continue;

      try {
        const response = await fetch(`${model.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...(model.keyEnv === 'OPENROUTER_API_KEY' ? {
              'HTTP-Referer': 'https://warp.education',
              'X-Title': 'WARP STEM Benchmark',
            } : {}),
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: isHint ? 0.2 : 0.25,
            max_tokens: isHint ? 120 : 400,
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return new Response(JSON.stringify({ reply: content, model: model.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {
        continue;
      }
    }

    // Fallback
    return new Response(JSON.stringify({
      reply: 'Consider what remains unchanged (the invariant) when the system variables change. What fundamental law governs this scenario?',
      model: 'static-fallback',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
