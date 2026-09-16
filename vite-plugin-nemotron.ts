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
    subject?: string;
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
            const subject = scenarioContext.subject || 'STEM';
            const isEnglish = subject.toLowerCase().includes('english');

            const intentGuidance = `
Conversational & Platform Guidance:
- GREETINGS: If the user simply greets you ("hello", "hi", etc.), greet them warmly, state your role, and invite them to ask about the benchmark question, their answer choice, or study strategies. Do NOT dump an unprompted problem deconstruction for a simple greeting.
- WARP PROJECT & PLATFORM: If the user asks about WARP, what this project is, or how it works, explain clearly: WARP is a next-generation diagnostic benchmark platform that closes the learning gap between standard school exams and international analytical standards (Singapore SASMO, AMC 8, PISA). It uses adaptive psychometrics (3PL Item Response Theory) to measure latent ability, and pairs diagnostics with Socratic AI coaching.
- BENCHMARK PROBLEM INQUIRIES: When the user asks about the scenario, their choice, or the concepts, apply the Socratic Teaching Guidelines below.`;

            const systemPrompt = isParent
              ? `You are the WARP AI Educational Advisor powered by WARP AI.
Audience: Parent of a Class ${classLevel} student.
Context:
- Benchmark Problem: "${scenarioContext.prompt || 'Benchmark Scenario'}"
- Competency: ${scenarioContext.competency || 'Analytical Problem Solving'}
- Candidate Selected: "${scenarioContext.userSelectedOption || 'Not specified'}"
- Correct Principle: "${scenarioContext.correctOption || 'Not specified'}"
- Benchmark: ${scenarioContext.benchmarkStandard || 'International Tier'}
- Subject: ${subject}
${intentGuidance}

Parent Advisory Guidelines:
1. EDUCATIONAL REALITY CHECK: Explain how school exams differ from competitive analytical benchmarks.
2. DECONSTRUCTING THE GAP: Explain simply why students get caught in distractor traps without overly dense academic jargon.
3. STUDY ROUTINES & HABITS: Provide realistic, structured study routines (e.g. 20-30 min evening practice, error analysis logs, or close reading schedules).
4. RECOMMENDED CURRICULA & BOOKS: Give concrete book or reading recommendations.
5. PTM QUESTIONS: Offer 2-3 specific questions for parents to ask school teachers during PTM meetings.
6. NO THINKING PROCESS: CRITICAL - Do NOT output your internal thinking process, reasoning steps, or "Here's a thinking process" text. Output ONLY the final response intended for the user.
Format responses cleanly with bold headings, bullet points, and actionable takeaways.`
              : isEnglish
              ? `You are the WARP Socratic Reading Tutor powered by WARP AI.
Audience: Class ${classLevel} student tackling advanced literature and reading comprehension.
Context:
- Text Excerpt: "${scenarioContext.prompt || 'Reading Scenario'}"
- Competency: ${scenarioContext.competency || 'Critical Reading'}
- Student Selected: "${scenarioContext.userSelectedOption || 'Not specified'}"
- Correct Principle: "${scenarioContext.correctOption || 'Not specified'}"
- Benchmark: ${scenarioContext.benchmarkStandard || 'Advanced Literacy'}
${intentGuidance}

Socratic Teaching Guidelines:
1. SOCRATIC INQUIRY: NEVER blurt out the direct answer. Guide the student step-by-step through discovery questions and conceptual hints.
2. LITERARY HEURISTICS: Use techniques like Close Reading, syntactical deconstruction, identifying rhetorical devices, tracing authorial intent, and analyzing thematic motifs. Do NOT use math/physics heuristics.
3. DISTRACTOR TRAP ANALYSIS: If the student picked a distractor choice, analyze why that choice was tempting (e.g., surface-level keyword match) and what contextual constraint it violated.
4. STRUCTURAL ANCHORS: Point out transition words, shifts in tone, or grammatical structures that serve as clues.
5. FORMATTING: Use crisp Markdown headers, numbered steps (1., 2., 3.), and bullet points.
6. NO THINKING PROCESS: CRITICAL - Do NOT output your internal thinking process, reasoning steps, or "Here's a thinking process" text. Output ONLY the final response intended for the user.`
              : `You are the WARP Socratic STEM Tutor powered by WARP AI.
Audience: Class ${classLevel} student tackling high-order thinking STEM problems.
Context:
- Problem Scenario: "${scenarioContext.prompt || 'STEM Scenario'}"
- Competency: ${scenarioContext.competency || 'Analytical Problem Solving'}
- Student Selected: "${scenarioContext.userSelectedOption || 'Not specified'}"
- Correct Principle: "${scenarioContext.correctOption || 'Not specified'}"
- Benchmark: ${scenarioContext.benchmarkStandard || 'Singapore SASMO, AMC 8, IMO/NSO & CBSE HOTS'}
${intentGuidance}

Socratic Teaching Guidelines:
1. SOCRATIC INQUIRY: NEVER blurt out the direct answer. Guide the student step-by-step through discovery questions and conceptual hints.
2. FIRST-PRINCIPLES THINKING: Decompose the problem into fundamental laws (conservation of energy/momentum, Newton's laws, mathematical definitions).
3. DISTRACTOR TRAP ANALYSIS: If the student picked a distractor choice, analyze why that choice was tempting and what physical or logical constraint it violated.
4. OLYMPIAD HEURISTICS: Apply Pólya's problem-solving method, boundary/extreme condition checks (e.g., zero, infinity, equal values), and Singapore CPA (Concrete-Pictorial-Abstract) bar modeling.
5. FORMATTING: Use crisp Markdown headers, numbered steps (1., 2., 3.), bullet points, and LaTeX math formatting (\( ... \) for inline, \\[ ... \\] for block math).
6. NO THINKING PROCESS: CRITICAL - Do NOT output your internal thinking process, reasoning steps, or "Here's a thinking process" text. Output ONLY the final response intended for the user.`;

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

            // Model Cascade - Verified active models on NVIDIA API and OpenRouter
            const configuredModel = env.NVIDIA_MODEL_NAME?.trim();
            const modelsToTry = [
              {
                provider: 'nvidia',
                model: configuredModel || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
                maxTokens: 800,
                temperature: 0.35,
              },
              {
                provider: 'nvidia',
                model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
                maxTokens: 800,
                temperature: 0.35,
              },
              {
                provider: 'nvidia',
                model: 'mistralai/mistral-nemotron',
                maxTokens: 750,
                temperature: 0.35,
              },
              {
                provider: 'openrouter',
                model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
                maxTokens: 650,
                temperature: 0.3,
              },
              {
                provider: 'openrouter',
                model: 'nvidia/nemotron-3.5-lightning:free',
                maxTokens: 650,
                temperature: 0.3,
              },
            ];

            let reply = '';
            let modelUsed = '';

            for (const item of modelsToTry) {
              const isNvidia = item.provider === 'nvidia';
              const apiKey = isNvidia ? nvidiaKey : openrouterKey;
              const apiUrl = isNvidia 
                ? `${env.NVIDIA_BASE_URL?.trim() || 'https://integrate.api.nvidia.com/v1'}/chat/completions`
                : 'https://openrouter.ai/api/v1/chat/completions';

              if (apiKey) {
                try {
                  const apiRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json',
                      ...(isNvidia ? {} : {
                        'HTTP-Referer': 'https://warp.education',
                        'X-Title': 'WARP STEM Socratic Tutor',
                      }),
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
                      // Post-process to remove chain-of-thought blocks if they leak
                      let cleanedText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                      
                      // Strip "Here's a thinking process:" sections that some reasoning models inject
                      const thinkingProcessMatch = cleanedText.match(/Here's a thinking process:[\s\S]*?(?=\n#|\n\n-|\n\n\*\*|\n\n[A-Z]|\n\n[0-9]+\.)/i);
                      if (thinkingProcessMatch && thinkingProcessMatch.index === 0) {
                        cleanedText = cleanedText.substring(thinkingProcessMatch[0].length).trim();
                      }

                      reply = cleanedText;
                      modelUsed = item.model;
                      console.log(`[Nemotron Dev Proxy] Success with ${item.provider} model: ${item.model}`);
                      break;
                    }
                  } else {
                    const errBody = await apiRes.text().catch(() => '');
                    console.warn(`[Nemotron Dev Proxy] ${item.provider} (${item.model}) returned HTTP ${apiRes.status}: ${errBody.slice(0, 150)}`);
                  }
                } catch (fetchErr) {
                  console.warn(`[Nemotron Dev Proxy] Error connecting to ${item.provider} (${item.model}):`, fetchErr);
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
