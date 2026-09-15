import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  HelpCircle,
  Loader2,
  Users,
  GraduationCap,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { askNemotronSocraticTutor } from '../../lib/nvidiaService';
import { SocraticMarkdown } from './SocraticMarkdown';

interface ScenarioItem {
  id?: string;
  prompt: string;
  competency: string;
  benchmarkStandard?: string;
  userSelectedOption?: string;
  correctOption?: string;
  correct?: boolean;
  option?: any;
}

interface NemotronSocraticTutorProps {
  isOpen: boolean;
  onClose: () => void;
  classLevel: number;
  initialScenarioIndex?: number;
  initialMode?: 'student' | 'parent';
  recentScenarios?: ScenarioItem[];
}

interface Message {
  role: 'tutor' | 'user';
  text: string;
  timestamp?: string;
}

export function NemotronSocraticTutor({
  isOpen,
  onClose,
  classLevel,
  initialScenarioIndex = 0,
  initialMode = 'student',
  recentScenarios = [],
}: NemotronSocraticTutorProps) {
  const [mode, setMode] = useState<'student' | 'parent'>(initialMode);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(initialScenarioIndex);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      initialScenarioIndex !== undefined &&
      initialScenarioIndex >= 0 &&
      initialScenarioIndex < recentScenarios.length
    ) {
      setSelectedScenarioIndex(initialScenarioIndex);
    }
  }, [initialScenarioIndex, recentScenarios.length]);

  const studentWelcome = `Hello! I am your WARP Socratic STEM Tutor powered by NVIDIA Nemotron.
I specialize in first-principles decomposition, Olympiad heuristics (Singapore SASMO, AMC 8, IMO/NSO), and uncovering why tricky distractor options feel so tempting.

Select any question from your benchmark above, or ask me how to analyze it from ground truth!`;

  const parentWelcome = `Hello Parent! I am your AI Educational Advisor powered by NVIDIA Nemotron.
I help bridge standard school exam marks (CBSE/ICSE) with international analytical standards (PISA, Olympiads).
Ask me about your child's Class ${classLevel} learning gaps, tailored 7-day study timetables, recommended books (NCERT Exemplar, MTG Foundation, RD Sharma), or strategic questions for your next school PTM.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      text: initialMode === 'parent' ? parentWelcome : studentWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Handle TTS Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const handleModeChange = (newMode: 'student' | 'parent') => {
    if (newMode === mode) return;
    setMode(newMode);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingIndex(null);

    setMessages((prev) => [
      ...prev,
      {
        role: 'tutor',
        text:
          newMode === 'parent'
            ? `**Switched to Parent Counselor Mode:** Ready to provide curriculum guidance, study routines, and diagnostic advice for Class ${classLevel}.`
            : `**Switched to Student Coach Mode:** Ready for first-principles Socratic guidance and Olympiad problem solving.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleClearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    setMessages([
      {
        role: 'tutor',
        text: mode === 'parent' ? parentWelcome : studentWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleExportChat = () => {
    const formatted = messages
      .map((m) => `### ${m.role === 'tutor' ? '🤖 NVIDIA Nemotron Tutor' : '👤 You'} (${m.timestamp || ''})\n\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([`# WARP Socratic STEM Tutor Session — Class ${classLevel}\n\n${formatted}`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warp-socratic-tutor-class-${classLevel}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean out markdown characters and formulas for clean natural audio speech
    const cleanSpeech = text
      .replace(/[#*`_~[\]()]/g, ' ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const rawScenario = recentScenarios[selectedScenarioIndex];
  const activeScenario = {
    prompt:
      rawScenario?.prompt ||
      (rawScenario as any)?.option?.text ||
      `STEM Benchmark Scenario #${selectedScenarioIndex + 1}`,
    competency: rawScenario?.competency || 'Analytical Reasoning',
    benchmarkStandard: rawScenario?.benchmarkStandard || 'Singapore SASMO & AMC 8 Tier',
    userSelectedOption:
      rawScenario?.userSelectedOption || (rawScenario as any)?.option?.text,
    correctOption: rawScenario?.correctOption,
    correct: rawScenario?.correct,
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend, timestamp: timeStr }];
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
        classLevel,
        {
          history: newMessages,
          mode,
        }
      );

      setMessages([
        ...newMessages,
        {
          role: 'tutor',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'tutor',
          text: 'The Nemotron advisor encountered an unexpected connectivity issue. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Adaptive Prompts based on audience mode and whether candidate missed the scenario
  const isMissed = activeScenario.correct === false;

  const studentPrompts = isMissed
    ? [
        'Why was my choice a distractor trap?',
        'How do I solve this using first principles?',
        'What physical invariant did I violate?',
        'Give me a similar practice challenge',
      ]
    : [
        'How would this appear in an Olympiad (IMO/SASMO)?',
        'What boundary conditions should I verify?',
        'What formula or physical law governs this?',
        'Give me an advanced challenge variation',
      ];

  const parentPrompts = [
    `Create a 7-day study timetable for Class ${classLevel}`,
    'Why did my child miss this question?',
    `How to prepare for Class ${classLevel} Olympiads (IMO/NSO)?`,
    'What should I ask at the next school PTM?',
    'How to eliminate silly calculation mistakes?',
  ];

  const currentPrompts = mode === 'parent' ? parentPrompts : studentPrompts;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, x: 340 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 340 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="border-b border-border p-4 px-6 bg-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-display text-foreground">
                        {mode === 'parent' ? 'Parent Educational Advisor' : 'WARP Socratic STEM Tutor'}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-none bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                        <Sparkles className="size-2.5" /> NVIDIA Nemotron-70B
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-secondary">
                      {mode === 'parent'
                        ? `Bridging school marks & competitive Olympiads for Class ${classLevel}`
                        : 'First-principles guidance & Olympiad problem solving'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportChat}
                    title="Export conversation as Markdown"
                    className="h-8 w-8 p-0 rounded-none text-foreground-secondary hover:text-foreground"
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    title="Reset conversation"
                    className="h-8 w-8 p-0 rounded-none text-foreground-secondary hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    title="Close tutor drawer"
                    className="h-8 w-8 p-0 rounded-none text-foreground-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Audience Mode Switcher */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-foreground-muted font-mono mr-1">
                    Audience:
                  </span>
                  <button
                    onClick={() => handleModeChange('student')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none border transition-colors ${
                      mode === 'student'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface border-border text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <GraduationCap className="size-3.5" /> Student Coach
                  </button>
                  <button
                    onClick={() => handleModeChange('parent')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none border transition-colors ${
                      mode === 'parent'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface border-border text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <Users className="size-3.5" /> Parent Counselor
                  </button>
                </div>

                <span className="text-[10px] font-mono text-foreground-muted hidden sm:inline">
                  Class {classLevel} Tier
                </span>
              </div>
            </div>

            {/* ── Context Problem Selector & Diagnostic Bar ── */}
            {recentScenarios.length > 0 && (
              <div className="border-b border-border bg-accent/15 px-6 py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  {activeScenario.correct !== undefined && (
                    <span className="shrink-0">
                      {activeScenario.correct ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </span>
                  )}
                  <span className="text-foreground-secondary truncate font-medium">
                    Context: <strong className="text-foreground">{activeScenario.prompt.slice(0, 50)}...</strong>
                  </span>
                </div>

                {recentScenarios.length > 1 && (
                  <select
                    value={selectedScenarioIndex}
                    onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
                    style={{ colorScheme: 'dark' }}
                    className="rounded-none border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground font-mono outline-none hover:border-primary/50 shrink-0 cursor-pointer"
                  >
                    {recentScenarios.map((s, idx) => {
                      const isCorr = s.correct === true;
                      return (
                        <option key={idx} value={idx} style={{ backgroundColor: '#12161f', color: '#f1f5f9' }}>
                          Q{idx + 1}: {s.competency ? s.competency.slice(0, 20) : `Scenario ${idx + 1}`} {s.correct !== undefined ? (isCorr ? '✓' : '⚠️') : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* ── Chat Message Body ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-none p-4 text-xs leading-relaxed transition-all ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                        : 'bg-card text-foreground border border-border shadow-xs'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <SocraticMarkdown content={m.text} />
                    )}

                    {/* Message Actions (Tutor replies) */}
                    {m.role === 'tutor' && (
                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[10px] text-foreground-muted">
                        <span className="font-mono">{m.timestamp || ''}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSpeakText(m.text, i)}
                            className="p-1 hover:text-foreground text-foreground-secondary transition-colors"
                            title={speakingIndex === i ? 'Stop reading' : 'Read aloud with AI voice'}
                          >
                            {speakingIndex === i ? (
                              <VolumeX className="size-3.5 text-primary animate-pulse" />
                            ) : (
                              <Volume2 className="size-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyText(m.text, i)}
                            className="p-1 hover:text-foreground text-foreground-secondary transition-colors"
                            title="Copy response to clipboard"
                          >
                            {copiedIndex === i ? (
                              <Check className="size-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5 p-3 rounded-none bg-card border border-border text-xs text-foreground-secondary max-w-[85%]">
                  <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">NVIDIA Nemotron is synthesizing reasoning...</p>
                    <p className="text-[11px] text-foreground-muted font-mono">
                      Decomposing invariants & Olympiad problem heuristics
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Socratic Prompt Chips ── */}
            <div className="border-t border-border/70 bg-accent/10 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted mb-1.5 flex items-center gap-1 font-mono">
                <HelpCircle className="size-3" />
                {mode === 'parent' ? 'Suggested Parent Inquiries' : 'First-Principles Prompts'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => handleSend(qp)}
                    className="rounded-none border border-border bg-card px-2.5 py-1 text-[11px] text-foreground-secondary hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50 text-left font-medium"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Input Bar ── */}
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
                  placeholder={
                    mode === 'parent'
                      ? 'Ask about 7-day study plans, CBSE vs Olympiads, recommended books...'
                      : 'Ask Nemotron why an option is a trap, or how to solve from first principles...'
                  }
                  disabled={loading}
                  className="flex-1 rounded-none border border-border bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || loading}
                  className="rounded-none px-3.5 gap-1.5 font-semibold"
                >
                  <Send className="size-3.5" />
                  <span className="hidden sm:inline text-xs">Send</span>
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
