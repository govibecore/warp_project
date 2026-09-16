// supabase/functions/ai-socratic-tutor/index.ts
// Server-side Socratic hint/tutor - NVIDIA keys in Supabase Vault only.

import { serve } from "@std/http/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL_CASCADE = [
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning', baseURL: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY' },
  { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', baseURL: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY' },
  { id: 'mistralai/mistral-nemotron', baseURL: 'https://integrate.api.nvidia.com/v1', keyEnv: 'NVIDIA_API_KEY' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
  { id: 'nvidia/nemotron-3.5-lightning:free', baseURL: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
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
    const isAnonKey = token.startsWith('sb_publishable_') || token === Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey')?.startsWith('sb_publishable_');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!isAnonKey && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Valid authenticated session or API key required' }), {
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
    const subject = scenarioContext?.subject || 'STEM';
    const isEnglish = subject.toLowerCase().includes('english');

    const safePrompt = String(scenarioContext?.prompt || 'Problem').slice(0, 1500);
    const safeCompetency = String(scenarioContext?.competency || 'Analytical Problem Solving').slice(0, 200);
    const safeSelected = String(scenarioContext?.userSelectedOption || 'Not specified').slice(0, 500);
    const safeCorrect = String(scenarioContext?.correctOption || 'Not specified').slice(0, 500);

    const intentGuidance = `
Conversational & Platform Guidance:
- GREETINGS: If the user simply greets you ("hello", "hi", etc.), greet them warmly, state your role, and invite them to ask about the benchmark question, their answer choice, or study strategies. Do NOT dump an unprompted problem deconstruction for a simple greeting.
- WARP PROJECT & PLATFORM: If the user asks about WARP, what this project is, or how it works, explain clearly: WARP is a next-generation diagnostic benchmark platform that closes the learning gap between standard school exams and international analytical standards (Singapore SASMO, AMC 8, PISA). It uses adaptive psychometrics (3PL Item Response Theory) to measure latent ability, and pairs diagnostics with Socratic AI coaching.
- BENCHMARK PROBLEM INQUIRIES: When the user asks about the scenario, their choice, or the concepts, apply the Socratic Teaching Guidelines below.`;

    const STRICT_INSTRUCTIONS = `\n\nIMPORTANT: DO NOT output your internal thinking process, planning steps, or preface your response with phrases like "Here's a thinking process:". Respond DIRECTLY and ONLY with the final message to the user in your designated persona.`;

    let systemPrompt = '';
    if (isHint) {
      systemPrompt = isEnglish
        ? `You are a Socratic hint generator for an international English Literacy assessment (Class ${classLevel}). Provide a single, powerful 1-2 sentence guiding question directing the student to the rhetorical or syntactical anchor WITHOUT revealing the answer.` + STRICT_INSTRUCTIONS
        : `You are a Socratic hint generator for an international STEM assessment (Class ${classLevel}). Provide a single, powerful 1-2 sentence guiding question directing the student to the core invariant WITHOUT revealing the answer.` + STRICT_INSTRUCTIONS;
    } else if (isParent) {
      systemPrompt = `You are the WARP AI Educational Advisor powered by WARP AI.
Audience: Parent of a Class ${classLevel} student.
Context:
- Problem: "${safePrompt}"
- Competency: ${safeCompetency}
- Candidate Selected: "${safeSelected}"
- Correct Principle: "${safeCorrect}"
- Subject: ${subject}
${intentGuidance}
Provide empathetic, pragmatic educational advice. For STEM, bridge school marks with Olympiads (SASMO, AMC 8). For English, bridge basic recall with advanced analytical literacy. Recommend realistic study routines, reading schedules, books, and PTM questions.` + STRICT_INSTRUCTIONS;
    } else if (isEnglish) {
      systemPrompt = `You are the WARP Socratic Reading Tutor powered by WARP AI.
Audience: Class ${classLevel} student.
Context:
- Text Excerpt: "${safePrompt}"
- Competency: ${safeCompetency}
- Candidate Selected: "${safeSelected}"
- Correct Principle: "${safeCorrect}"
${intentGuidance}
Guide the student using the Socratic method and critical reading techniques. Never give the direct final answer outright. Deconstruct why distractor choices feel tempting, uncover rhetorical anchors, analyze authorial tone, and identify syntactical clues. Do NOT use math/physics heuristics. Format with crisp markdown, numbered steps, and bullet points.` + STRICT_INSTRUCTIONS;
    } else {
      systemPrompt = `You are the WARP Socratic STEM Tutor powered by WARP AI.
Audience: Class ${classLevel} student.
Context:
- Problem: "${safePrompt}"
- Competency: ${safeCompetency}
- Candidate Selected: "${safeSelected}"
- Correct Principle: "${safeCorrect}"
${intentGuidance}
Guide the student using the Socratic method and first-principles reasoning. Never give the direct final answer outright. Deconstruct why distractor choices feel tempting, uncover physical/mathematical invariants, and apply Olympiad heuristics (boundary checks, Singapore CPA modeling). Format with crisp markdown, numbered steps, and LaTeX math.` + STRICT_INSTRUCTIONS;
    }

    const outgoingMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
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
          
          const thinkingProcessMatch = content.match(/Here's a thinking process:[\s\S]*?(?=\n#|\n\n-|\n\n\*\*|\n\n[A-Z]|\n\n[0-9]+\.)/i);
          if (thinkingProcessMatch && thinkingProcessMatch.index === 0) {
            content = content.substring(thinkingProcessMatch[0].length).trim();
          }
          
          return new Response(JSON.stringify({ reply: content, model: model.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {
        continue;
      }
    }

    // High-fidelity context-aware fallback engine
    const rawQ = String(studentQuestion || '').toLowerCase().trim();
    let fallbackReply = '';
    
    if (/^(hello|hi|hey|greetings|good\s*(morning|afternoon|evening))\b/i.test(rawQ) && rawQ.split(/\s+/).length <= 4) {
      fallbackReply = isEnglish
        ? `Hello! I am your WARP Socratic Reading Tutor. I'm here to help you deconstruct texts, analyze authorial intent, and spot distractor traps. What would you like to explore about this passage?`
        : `Hello! I am your WARP Socratic STEM Tutor. I'm here to guide you through first-principles reasoning and system invariants. What concept would you like to explore?`;
    } else if (rawQ.includes('warp') || rawQ.includes('project') || rawQ.includes('platform') || rawQ.includes('what is this') || rawQ.includes('who are you')) {
      fallbackReply = `### ⚡ Welcome to the WARP Assessment Platform\n\n**WARP** is an adaptive cognitive diagnostic benchmark designed to close learning gaps between classroom tests and international competitive benchmarks (Singapore SASMO, AMC 8, PISA). It uses 3PL Item Response Theory (IRT) to adapt in real time to student ability, paired with Socratic AI coaching that teaches first-principles problem solving rather than rote answers.`;
    } else if (isHint) {
      fallbackReply = isEnglish
        ? 'What transition word or syntactical anchor in the text directly qualifies the scope of this statement?'
        : 'Consider what remains unchanged (the invariant) when the system variables change. What fundamental law governs this boundary condition?';
    } else if (isParent) {
      fallbackReply = isEnglish
        ? `In international reading benchmarks, questions test deep syntactical comprehension rather than surface keyword matching. Encourage your child to identify the author's tone and paragraph transitions during daily reading.`
        : `In competitive STEM benchmarks (Singapore SASMO, AMC 8), problems test boundary conditions and physical invariants rather than formula recall. Have your child draw the system before calculating.`;
    } else if (isEnglish) {
      fallbackReply = `Look closely at the excerpt's structure: identify the main independent clause, note any transitional qualifiers (e.g., 'however', 'must contain'), and ask what contextual constraint contradicts choices like "${safeSelected}".`;
    } else {
      fallbackReply = `Consider what remains unchanged (the invariant) when the system variables change. Before applying any formula, test what happens at the boundary conditions ($N=0$ or extreme limits). What fundamental conservation law governs this scenario?`;
    }

    return new Response(JSON.stringify({
      reply: fallbackReply,
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
