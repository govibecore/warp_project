import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { askNemotronSocraticTutor } from '../../lib/nvidiaService';

interface NemotronSocraticTutorProps {
  isOpen: boolean;
  onClose: () => void;
  classLevel: number;
  recentScenarios?: Array<{
    id?: string;
    prompt: string;
    competency: string;
    benchmarkStandard?: string;
    userSelectedOption?: string;
    correctOption?: string;
  }>;
}

interface Message {
  role: 'tutor' | 'user';
  text: string;
}

export function NemotronSocraticTutor({
  isOpen,
  onClose,
  classLevel,
  recentScenarios = [],
}: NemotronSocraticTutorProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      text: `Hello! I am your WARP Socratic STEM Tutor powered by NVIDIA Nemotron. 
Ask me about any problem you encountered, why a distractor option felt so tempting, or how a Singapore SASMO medalist uses visual bar modeling to solve it.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const rawScenario = recentScenarios[selectedScenarioIndex];
  const activeScenario = {
    prompt: rawScenario?.prompt || (rawScenario as any)?.option?.text || `STEM Benchmark Scenario #${selectedScenarioIndex + 1}`,
    competency: rawScenario?.competency || 'General Competency',
    benchmarkStandard: rawScenario?.benchmarkStandard || 'Singapore SASMO & US AMC 8',
    userSelectedOption: rawScenario?.userSelectedOption || (rawScenario as any)?.option?.text,
    correctOption: rawScenario?.correctOption,
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const reply = await askNemotronSocraticTutor(
        {
          prompt: activeScenario.prompt,
          competency: activeScenario.competency,
          benchmarkStandard: activeScenario.benchmarkStandard,
          userSelectedOption: activeScenario.userSelectedOption,
          correctOption: activeScenario.correctOption,
        },
        textToSend,
        classLevel
      );

      setMessages([...newMessages, { role: 'tutor', text: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'tutor',
          text: 'The Nemotron tutor encountered an unexpected issue. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Why was my choice a distractor trap?',
    'How do I solve this using Singapore bar modeling?',
    'What physical invariant or conservation law governs this?',
    'Give me a similar non-routine practice challenge',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 px-6 bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Bot className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-display text-foreground">
                      WARP Socratic Tutor
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-none bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="size-2.5" /> NVIDIA Nemotron-70B
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary">
                    First-principles reasoning & Singapore heuristic modeling
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="size-4" />
              </Button>
            </div>

            {/* Context Problem Selector */}
            {recentScenarios.length > 0 && (
              <div className="border-b border-border bg-accent/20 px-6 py-2.5 flex items-center justify-between text-xs">
                <span className="text-foreground-secondary truncate max-w-xs font-medium">
                  Context: <span className="text-foreground">{(activeScenario.prompt || 'STEM Scenario').slice(0, 45)}...</span>
                </span>
                {recentScenarios.length > 1 && (
                  <select
                    value={selectedScenarioIndex}
                    onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
                    className="rounded-none border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none"
                  >
                    {recentScenarios.map((s, idx) => (
                      <option key={idx} value={idx}>
                        Q{idx + 1}: {s.competency || (s.prompt ? s.prompt.slice(0, 20) : `Scenario ${idx + 1}`)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Chat message body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-none p-3.5 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-accent/40 text-foreground border border-border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Nemotron is formulating Socratic guidance...</span>
                </div>
              )}
            </div>

            {/* Quick Socratic Prompt Chips */}
            <div className="border-t border-border/60 bg-accent/10 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-1.5 flex items-center gap-1">
                <HelpCircle className="size-3" /> Quick Questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => handleSend(qp)}
                    className="rounded-none border border-border bg-surface px-2.5 py-1 text-[10px] text-foreground-secondary hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="border-t border-border p-4 bg-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nemotron about this STEM scenario..."
                  disabled={loading}
                  className="flex-1 rounded-none border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none"
                />
                <Button type="submit" size="sm" disabled={!input.trim() || loading}>
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
