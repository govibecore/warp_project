// supabase/functions/ai-socratic-tutor/index.ts
// Server-side Socratic hint/tutor — NVIDIA keys in Supabase Vault only.

import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL_CASCADE = [
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
  { id: 'nvidia/nemotron-3.5-lightning:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', baseURL: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY' },
  { id: 'google/gemma-4-31b-it:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Enforce authentication via verified Supabase bearer token
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace(/^[Bb]earer\s+/, '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Valid authenticated session required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
    }

    const { messages: incomingMessages, scenarioContext, studentQuestion, classLevel = 8, mode = 'student' } = await req.json();

    // Enforce payload length guards to prevent context window and quota exhaustion
    if (studentQuestion && typeof studentQuestion === 'string' && studentQuestion.length > 2000) {
      return new Response(JSON.stringify({ error: 'Question exceeds maximum length limit of 2000 characters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const isParent = mode === 'parent';
    const isHint = mode === 'hint';

    const safePrompt = String(scenarioContext?.prompt || 'STEM Problem').slice(0, 1500);
    const safeCompetency = String(scenarioContext?.competency || 'Analytical Problem Solving').slice(0, 200);
    const safeSelected = String(scenarioContext?.userSelectedOption || 'Not specified').slice(0, 500);
    const safeCorrect = String(scenarioContext?.correctOption || 'Not specified').slice(0, 500);

    const STRICT_INSTRUCTIONS = `\n\nIMPORTANT: DO NOT output your internal thinking process, planning steps, or preface your response with phrases like "Here's a thinking process:". Respond DIRECTLY and ONLY with the final message to the user in your designated persona.`;

    let systemPrompt = '';
    if (isHint) {
      systemPrompt = `You are a Socratic hint generator for an international STEM assessment (Class ${classLevel}). Provide a single, powerful 1-2 sentence guiding question directing the student to the core invariant WITHOUT revealing the answer.` + STRICT_INSTRUCTIONS;
    } else if (isParent) {
      systemPrompt = `You are the WARP AI Educational Advisor powered by NVIDIA Nemotron.
Audience: Parent of a Class ${classLevel} student.
Context:
- Problem: "${safePrompt}"
- Competency: ${safeCompetency}
- Candidate Selected: "${safeSelected}"
- Correct Principle: "${safeCorrect}"
Provide empathetic, pragmatic educational advice bridging school exam marks (CBSE/ICSE) with international Olympiad standards (SASMO, AMC 8, PISA). Recommending curricula (NCERT Exemplar, MTG Foundation, RD Sharma), realistic study routines, and PTM questions.` + STRICT_INSTRUCTIONS;
    } else {
      systemPrompt = `You are the WARP Socratic STEM Tutor powered by NVIDIA Nemotron.
Audience: Class ${classLevel} student.
Context:
- Problem: "${safePrompt}"
- Competency: ${safeCompetency}
- Candidate Selected: "${safeSelected}"
- Correct Principle: "${safeCorrect}"
Guide the student using the Socratic method and first-principles reasoning. Never give the direct final answer outright. Deconstruct why distractor choices feel tempting, uncover physical/mathematical invariants, and apply Olympiad heuristics (boundary checks, Singapore CPA modeling). Format with crisp markdown, numbered steps, and LaTeX math.` + STRICT_INSTRUCTIONS;
    }

    let outgoingMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    const MAX_HISTORY_TURNS = 10;
    const MAX_CHAR_PER_MSG = 2500;

    if (Array.isArray(incomingMessages) && incomingMessages.length > 0) {
      const recentMessages = incomingMessages.slice(-MAX_HISTORY_TURNS);
      for (const m of recentMessages) {
        const rawContent = String(m.content || m.text || '').slice(0, MAX_CHAR_PER_MSG);
        outgoingMessages.push({
          role: m.role === 'tutor' || m.role === 'assistant' ? 'assistant' : 'user',
          content: rawContent,
        });
      }
    } else {
      const rawQuestion = String(studentQuestion || 'How do I think about this problem from first principles?').slice(0, MAX_CHAR_PER_MSG);
      outgoingMessages.push({ role: 'user', content: rawQuestion });
    }

    for (const model of MODEL_CASCADE) {
      const modelKey = Deno.env.get(model.keyEnv);
      if (!modelKey) continue;

      try {
        const response = await fetch(`${model.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${modelKey}`,
            'Content-Type': 'application/json',
            ...(model.keyEnv === 'OPENROUTER_API_KEY' ? {
              'HTTP-Referer': 'https://warp.education',
              'X-Title': 'WARP Socratic STEM Tutor',
            } : {}),
          },
          body: JSON.stringify({
            model: model.id,
            messages: outgoingMessages,
            temperature: isHint ? 0.2 : 0.35,
            max_tokens: isHint ? 150 : 600,
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim();
        
        if (content) {
          // Post-process to remove chain-of-thought blocks if they leak
          content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          
          // Fallback regex to strip "Here's a thinking process" blocks up to a likely divider, though the STRICT_INSTRUCTIONS should prevent this.
          // Since the exact divider isn't guaranteed, we rely primarily on the strict prompt above.
          // But we can check if it starts with "Here's a thinking process:" and has markdown lines.
          
          return new Response(JSON.stringify({ reply: content, model: model.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {
        continue;
      }
    }

    // High-fidelity fallback
    return new Response(JSON.stringify({
      reply: 'Consider what remains unchanged (the invariant) when the system variables change. Before applying any formula, test what happens at the boundary conditions ($N=0$ or extreme limits). What fundamental law governs this scenario?',
      model: 'first-principles-fallback',
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
