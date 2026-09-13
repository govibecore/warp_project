import { motion } from 'motion/react';
import { ArrowRight, Clock, Target, BrainCircuit, Lock } from 'lucide-react';
import { Button } from './ui/button';

import { useAxiomSession } from '../context/AxiomSessionContext';

interface AssessmentTutorialProps {
  onStart: () => void;
}

export function AssessmentTutorial({ onStart }: AssessmentTutorialProps) {
  const { session, openHub } = useAxiomSession();
  const subject = session.plan?.subject || 'STEM';
  const displayTitle = subject === 'STEM' ? 'International STEM Benchmark' : `${subject} Benchmark`;

  return (
    <main className="flex min-h-full w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8" data-testid="tutorial-shell">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-auto z-10 flex w-full max-w-2xl flex-col gap-6 py-2"
      >
        <div className="text-center mb-4">
          <div className="mb-4 inline-flex p-3 bg-surface border border-border rounded-none">
            <Target className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-sm leading-relaxed text-foreground-secondary max-w-lg mx-auto">
            You are about to begin a rigorous, adaptive assessment designed to measure your competency in {subject} globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {/* Box 1: Adaptive Mechanics */}
          <div className="card flex flex-col gap-3 p-5 shadow-sm border border-border corner-marks">
            <div className="flex items-center gap-3 text-primary">
              <BrainCircuit className="size-5 shrink-0" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Adaptive Engine</h2>
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              This assessment adapts to you in real time. Questions will get harder or easier based on how you answer, ensuring we pinpoint your exact level.
            </p>
          </div>

          {/* Box 2: Time Expectation */}
          <div className="card flex flex-col gap-3 p-5 shadow-sm border border-border corner-marks">
            <div className="flex items-center gap-3 text-primary">
              <Clock className="size-5 shrink-0" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Time Assigned</h2>
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Expect to spend 45–60 minutes. There is no rigid countdown timer—we value accuracy and deep thinking over speed.
            </p>
          </div>
        </div>

        {/* Big Warning Box */}
        <div className="card border border-primary/30 bg-primary-subtle p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="mb-1 font-bold text-sm uppercase tracking-wider text-primary">Lock Your Answers Carefully</h2>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                Because the questions adapt to your responses, <strong>you cannot go back to change an answer</strong> once it is locked in. Please review your choices carefully before proceeding to the next scenario.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={openHub}
            size="lg"
            className="w-full sm:w-auto"
            data-testid="switch-track-btn"
          >
            Switch Track
          </Button>
          <Button type="button" onClick={onStart} size="lg" className="w-full sm:w-auto px-12">
            Begin Assessment <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
