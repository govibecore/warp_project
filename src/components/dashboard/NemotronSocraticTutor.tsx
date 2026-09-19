import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
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
  subject?: string;
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
  subject = 'STEM',
}: NemotronSocraticTutorProps) {
  const [mode, setMode] = useState<'student' | 'parent'>(initialMode);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(initialScenarioIndex);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isEnglish = subject.toLowerCase().includes('english');

  useEffect(() => {
    if (
      initialScenarioIndex !== undefined &&
      initialScenarioIndex >= 0 &&
      initialScenarioIndex < recentScenarios.length
    ) {
      setSelectedScenarioIndex(initialScenarioIndex);
    }
  }, [initialScenarioIndex, recentScenarios.length]);

  const studentWelcome = isEnglish
    ? `Hello! I am your WARP Socratic Reading Tutor powered by WARP AI.\nI specialize in rhetorical analysis, uncovering authorial intent, identifying syntactical anchors, and understanding why certain distractor options feel tempting.\n\nSelect any question from your benchmark above, or ask me how to analyze it!`
    : `Hello! I am your WARP Socratic STEM Tutor powered by WARP AI.\nI specialize in first-principles decomposition, Olympiad heuristics (Singapore SASMO, AMC 8, IMO/NSO), and uncovering why tricky distractor options feel so tempting.\n\nSelect any question from your benchmark above, or ask me how to analyze it from ground truth!`;

  const parentWelcome = isEnglish
    ? `Hello Parent! I am your AI Educational Advisor powered by WARP AI.\nI help bridge standard school reading comprehension with advanced analytical literacy standards.\nAsk me about your child's Class ${classLevel} learning gaps, tailored reading lists, or strategic questions for your next school PTM.`
    : `Hello Parent! I am your AI Educational Advisor powered by WARP AI.\nI help bridge standard school exam marks (CBSE/ICSE) with international analytical standards (PISA, Olympiads).\nAsk me about your child's Class ${classLevel} learning gaps, tailored 7-day study timetables, recommended books (NCERT Exemplar, MTG Foundation, RD Sharma), or strategic questions for your next school PTM.`;

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
            : `**Switched to Student Coach Mode:** Ready for first-principles Socratic guidance and problem solving.`,
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
      .map((m) => `### ${m.role === 'tutor' ? '🤖 WARP AI Tutor' : '👤 You'} (${m.timestamp || ''})\n\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([`# WARP Socratic Tutor Session - Class ${classLevel}\n\n${formatted}`], {
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
      `${isEnglish ? 'English' : 'STEM'} Benchmark Scenario #${selectedScenarioIndex + 1}`,
    competency: rawScenario?.competency || 'Analytical Reasoning',
    benchmarkStandard: rawScenario?.benchmarkStandard || (isEnglish ? 'Advanced Reading Comprehension' : 'Singapore SASMO & AMC 8 Tier'),
    userSelectedOption:
      rawScenario?.userSelectedOption || (rawScenario as any)?.option?.text,
    correctOption: rawScenario?.correctOption,
    correct: rawScenario?.correct,
    subject: (rawScenario as any)?.subject || subject || (isEnglish ? 'English Literacy' : 'STEM'),
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
          subject: activeScenario.subject,
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
          text: 'The WARP AI advisor encountered an unexpected connectivity issue. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Adaptive Prompts based on audience mode and whether candidate missed the scenario
  const isMissed = activeScenario.correct === false;

  const stemStudentPrompts = isMissed
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

  const englishStudentPrompts = isMissed
    ? [
        'Why was my choice a distractor trap?',
        'What rhetorical device did I miss?',
        'How do I analyze the author\'s intent here?',
        'Give me a similar reading challenge',
      ]
    : [
        'How does the syntax impact the tone?',
        'What is the thematic motif here?',
        'Why is this considered advanced literature?',
        'Give me a more complex reading excerpt',
      ];

  const studentPrompts = isEnglish ? englishStudentPrompts : stemStudentPrompts;

  const stemParentPrompts = [
    `Create a 7-day study timetable for Class ${classLevel}`,
    'Why did my child miss this question?',
    `How to prepare for Class ${classLevel} Olympiads (IMO/NSO)?`,
    'What should I ask at the next school PTM?',
    'How to eliminate silly calculation mistakes?',
  ];

  const englishParentPrompts = [
    `Create a 7-day reading schedule for Class ${classLevel}`,
    'Why did my child miss this question?',
    `Recommend classic literature for Class ${classLevel}`,
    'What should I ask at the next school PTM?',
    'How to improve analytical reading at home?',
  ];

  const parentPrompts = isEnglish ? englishParentPrompts : stemParentPrompts;

  const currentPrompts = mode === 'parent' ? parentPrompts : studentPrompts;

  return (
    <>
      {/* ── Floating Action Button (persistent when closed) ── */}
      {!isOpen && (
        <button
          onClick={() => {/* parent controls isOpen */}}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold transition-all hover:-translate-y-0.5 border border-primary"
          style={{ display: 'none' }} // FAB is triggered by parent via isOpen prop
        >
          <Sparkles className="size-4" />
          Ask AI
        </button>
      )}

      {/* ── Full-Screen Takeover ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="flex w-full max-w-2xl flex-col border border-border bg-surface mx-4"
              style={{ height: 'min(90vh, 800px)' }}
            >
              {/* ── Header ── */}
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center border border-border-hairline text-primary bg-surface-card">
                      <Bot className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {mode === 'parent' ? 'Parent Educational Advisor' : (isEnglish ? 'WARP Socratic Reading Tutor' : 'WARP Socratic STEM Tutor')}
                      </h3>
                      <p className="text-xs text-foreground-secondary">
                        {mode === 'parent'
                          ? `Bridging school marks & competitive Olympiads for Class ${classLevel}`
                          : (isEnglish ? 'First-principles literary guidance & critical reading' : 'First-principles guidance & Olympiad problem solving')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Audience toggle — compact */}
                    <div className="hidden sm:inline-flex items-center p-0.5 mr-2 bg-surface-card border border-border-hairline shrink-0">
                      <button
                        onClick={() => handleModeChange('student')}
                        className={`px-3 py-1 text-xs font-mono font-bold transition-colors ${
                          mode === 'student'
                            ? 'bg-accent-default text-ink-inverse'
                            : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-page'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        onClick={() => handleModeChange('parent')}
                        className={`px-3 py-1 text-xs font-mono font-bold transition-colors ${
                          mode === 'parent'
                            ? 'bg-accent-default text-ink-inverse'
                            : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-page'
                        }`}
                      >
                        Parent
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportChat}
                      title="Export conversation"
                      className="h-8 w-8 p-0 text-foreground-secondary hover:text-foreground"
                    >
                      <Download className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearChat}
                      title="Reset conversation"
                      className="h-8 w-8 p-0 text-foreground-secondary hover:text-foreground"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      title="Close"
                      className="h-8 w-8 p-0 text-foreground-secondary hover:text-foreground"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Context Problem Selector ── */}
              {recentScenarios.length > 0 && (
                <div className="border-b border-border px-6 py-2 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    {activeScenario.correct !== undefined && (
                      <span className="shrink-0">
                        {activeScenario.correct ? (
                          <CheckCircle2 className="size-3.5 text-success" />
                        ) : (
                          <AlertCircle className="size-3.5 text-warning" />
                        )}
                      </span>
                    )}
                    <span className="text-foreground-secondary truncate">
                      <strong className="text-foreground">{activeScenario.prompt.slice(0, 60)}...</strong>
                    </span>
                  </div>

                  {recentScenarios.length > 1 && (
                    <select
                      value={selectedScenarioIndex}
                      onChange={(e) => setSelectedScenarioIndex(Number(e.target.value))}
                      style={{ colorScheme: 'dark' }}
                      className="border border-border bg-surface px-2 py-1 text-xs text-foreground font-mono outline-none hover:border-primary/50 shrink-0 cursor-pointer"
                    >
                      {recentScenarios.map((s, idx) => {
                        const isCorr = s.correct === true;
                        return (
                          <option key={idx} value={idx} style={{ backgroundColor: '#12161f', color: '#f1f5f9' }}>
                            Q{idx + 1}: {s.competency ? s.competency.slice(0, 20) : `Scenario ${idx + 1}`} {s.correct !== undefined ? (isCorr ? '✓' : '⚠') : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}

              {/* ── Chat Messages ── */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} group`}
                  >
                    <div
                      className={`max-w-[85%] p-4 text-sm leading-relaxed border ${
                        m.role === 'user'
                          ? 'bg-surface-page text-foreground border-border-strong'
                          : 'bg-transparent text-foreground border-transparent'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <SocraticMarkdown content={m.text} />
                      )}

                      {/* Hover actions for tutor replies */}
                      {m.role === 'tutor' && (
                        <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSpeakText(m.text, i)}
                            className="p-1 hover:text-foreground text-foreground-muted transition-colors"
                            title={speakingIndex === i ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingIndex === i ? (
                              <VolumeX className="size-3.5 text-primary" />
                            ) : (
                              <Volume2 className="size-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyText(m.text, i)}
                            className="p-1 hover:text-foreground text-foreground-muted transition-colors"
                            title="Copy"
                          >
                            {copiedIndex === i ? (
                              <Check className="size-3.5 text-success" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2.5 p-3 bg-card border border-border text-sm text-foreground-secondary max-w-[85%]">
                    <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                    <span className="font-medium text-foreground">Synthesizing reasoning...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Prompts ── */}
              <div className="px-6 py-3 border-t border-border">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {currentPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => handleSend(qp)}
                      className="text-xs text-foreground-muted hover:text-primary hover:border-primary border border-border-hairline px-3 py-1.5 transition-colors disabled:opacity-50 font-medium text-left bg-surface-card hover:bg-surface-page"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Input ── */}
              <div className="border-t border-border p-4">
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
                        ? 'Ask about study plans, books, or next PTM...'
                        : (isEnglish ? 'Ask about rhetorical devices, author\'s intent...' : 'Ask why an option is a trap, or how to solve from first principles...')
                    }
                    disabled={loading}
                    className="flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="flex items-center justify-center px-4 py-2 gap-1.5 font-semibold bg-primary text-primary-foreground border border-primary hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-none"
                  >
                    <Send className="size-3.5" />
                    <span className="hidden sm:inline text-xs">Send</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
