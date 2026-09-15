import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface SocraticTutorPayload {
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  studentQuestion?: string;
  scenarioContext?: {
    prompt?: string;
    competency?: string;
    benchmarkStandard?: string;
    userSelectedOption?: string;
    correctOption?: string;
  };
  classLevel?: number;
  mode?: 'student' | 'parent';
}

export function nemotronSocraticTutorPlugin(): Plugin {
  return {
    name: 'vite-plugin-nemotron-socratic-tutor',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/socratic-tutor', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const env = loadEnv('development', process.cwd(), '');
        const openrouterKey = env.OPENROUTER_API_KEY?.trim();
        const nvidiaKey = env.NVIDIA_API_KEY?.trim();

        let bodyRaw = '';
        req.on('data', (chunk) => {
          bodyRaw += chunk;
        });

        req.on('end', async () => {
          try {
            const payload: SocraticTutorPayload = bodyRaw ? JSON.parse(bodyRaw) : {};
            const {
              messages = [],
              studentQuestion = '',
              scenarioContext = {},
              classLevel = 8,
              mode = 'student',
            } = payload;

            const isParent = mode === 'parent';

            const systemPrompt = isParent
              ? `You are the WARP AI Educational Advisor powered by NVIDIA Nemotron.
Audience: Parent of a Class ${classLevel} student.
Context:
- Benchmark Problem: "${scenarioContext.prompt || 'STEM Scenario'}"
- Competency: ${scenarioContext.competency || 'Analytical Problem Solving'}
- Candidate Selected: "${scenarioContext.userSelectedOption || 'Not specified'}"
- Correct Principle: "${scenarioContext.correctOption || 'Not specified'}"
- Benchmark: ${scenarioContext.benchmarkStandard || 'CBSE/ICSE & International Olympiad Tier'}

Parent Advisory Guidelines:
1. EDUCATIONAL REALITY CHECK: Explain how school exam scoring (CBSE/ICSE) differs from competitive benchmarks (IMO, NSO, JEE Foundation, Singapore SASMO).
2. DECONSTRUCTING THE GAP: Explain simply why students get caught in distractor traps without overly dense academic jargon.
3. STUDY ROUTINES & HABITS: Provide realistic, structured study routines (e.g. 20-30 min evening practice, error analysis logs).
4. RECOMMENDED CURRICULA & BOOKS: Give concrete book recommendations (NCERT Exemplar, MTG Foundation, RD Sharma HOTS, Singapore Bar Modeling).
5. PTM QUESTIONS: Offer 2-3 specific questions for parents to ask school teachers during PTM meetings.
Format responses cleanly with bold headings, bullet points, and actionable takeaways.`
              : `You are the WARP Socratic STEM Tutor powered by NVIDIA Nemotron.
Audience: Class ${classLevel} student tackling high-order thinking STEM problems.
Context:
- Problem Scenario: "${scenarioContext.prompt || 'STEM Scenario'}"
- Competency: ${scenarioContext.competency || 'Analytical Problem Solving'}
- Student Selected: "${scenarioContext.userSelectedOption || 'Not specified'}"
- Correct Principle: "${scenarioContext.correctOption || 'Not specified'}"
- Benchmark: ${scenarioContext.benchmarkStandard || 'Singapore SASMO, AMC 8, IMO/NSO & CBSE HOTS'}

Socratic Teaching Guidelines:
1. SOCRATIC INQUIRY: NEVER blurt out the direct answer. Guide the student step-by-step through discovery questions and conceptual hints.
2. FIRST-PRINCIPLES THINKING: Decompose the problem into fundamental laws (conservation of energy/momentum, Newton's laws, mathematical definitions).
3. DISTRACTOR TRAP ANALYSIS: If the student picked a distractor choice, analyze why that choice was tempting and what physical or logical constraint it violated.
4. OLYMPIAD HEURISTICS: Apply Pólya's problem-solving method, boundary/extreme condition checks (e.g., zero, infinity, equal values), and Singapore CPA (Concrete-Pictorial-Abstract) bar modeling.
5. FORMATTING: Use crisp Markdown headers, numbered steps (1., 2., 3.), bullet points, and LaTeX math formatting (\( ... \) for inline, \\[ ... \\] for block math).`;

            // Build message list preserving multi-turn history
            let outgoingMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

            if (messages.length > 0) {
              const hasSystem = messages.some((m) => m.role === 'system');
              if (!hasSystem) {
                outgoingMessages.push({ role: 'system', content: systemPrompt });
              }
              for (const m of messages) {
                outgoingMessages.push({
                  role: m.role as any,
                  content: m.content,
                });
              }
            } else if (studentQuestion) {
              outgoingMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: studentQuestion },
              ];
            } else {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No question or messages provided' }));
              return;
            }

            // Model Cascade
            const modelsToTry = [
              {
                provider: 'openrouter',
                model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
                maxTokens: 750,
                temperature: 0.35,
              },
              {
                provider: 'openrouter',
                model: 'nvidia/nemotron-3.5-lightning:free',
                maxTokens: 650,
                temperature: 0.3,
              },
              {
                provider: 'openrouter',
                model: 'google/gemma-4-31b-it:free',
                maxTokens: 700,
                temperature: 0.35,
              },
            ];

            let reply = '';
            let modelUsed = '';

            for (const item of modelsToTry) {
              if (item.provider === 'openrouter' && openrouterKey) {
                try {
                  const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${openrouterKey}`,
                      'Content-Type': 'application/json',
                      'HTTP-Referer': 'https://warp.education',
                      'X-Title': 'WARP STEM Socratic Tutor',
                    },
                    body: JSON.stringify({
                      model: item.model,
                      messages: outgoingMessages,
                      max_tokens: item.maxTokens,
                      temperature: item.temperature,
                    }),
                  });

                  if (apiRes.ok) {
                    const data = await apiRes.json();
                    const text = data.choices?.[0]?.message?.content?.trim();
                    if (text) {
                      reply = text;
                      modelUsed = item.model;
                      break;
                    }
                  }
                } catch (fetchErr) {
                  console.warn(`[Nemotron Dev Proxy] Error with ${item.model}:`, fetchErr);
                }
              }
            }

            if (reply) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, reply, model: modelUsed }));
            } else {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'All Nemotron model providers failed or returned empty response',
              }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}
