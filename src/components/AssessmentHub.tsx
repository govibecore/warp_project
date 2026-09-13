import { motion } from 'motion/react';
import { ArrowRight, Microscope, BookOpen } from 'lucide-react';
import type { Subject } from '../domain/types';

interface AssessmentHubProps {
  onSelectSubject: (subject: Subject) => void;
}

export function AssessmentHub({ onSelectSubject }: AssessmentHubProps) {
  return (
    <main className="flex min-h-full w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8" data-testid="hub-shell">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-auto z-10 flex w-full max-w-3xl flex-col gap-6 py-2"
      >
        <div className="text-center mb-6">
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight">
            Choose Your Assessment
          </h1>
          <p className="text-sm leading-relaxed text-foreground-secondary max-w-xl mx-auto">
            Select the domain you wish to benchmark today. Each track adapts to your skill level and generates a separate diagnostic report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STEM Track */}
          <button
            type="button"
            onClick={() => onSelectSubject('STEM')}
            className="group card card-interactive flex flex-col text-left border border-border corner-marks transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4 inline-flex p-3 bg-primary/10 text-primary border border-primary/20 rounded-none">
                <Microscope className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                STEM Benchmark
              </h2>
              <p className="mb-6 text-sm text-foreground-secondary leading-relaxed flex-1">
                Evaluate your computational thinking, scientific inquiry, and mathematical reasoning through interactive scenarios.
              </p>
              <div className="flex items-center text-sm font-bold text-primary">
                Select Track <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* English Track */}
          <button
            type="button"
            onClick={() => onSelectSubject('English')}
            className="group card card-interactive flex flex-col text-left border border-border corner-marks transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4 inline-flex p-3 bg-primary/10 text-primary border border-primary/20 rounded-none">
                <BookOpen className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                English Literacy
              </h2>
              <p className="mb-6 text-sm text-foreground-secondary leading-relaxed flex-1">
                Measure your reading comprehension, ability to locate information, and capacity to evaluate complex texts.
              </p>
              <div className="flex items-center text-sm font-bold text-primary">
                Select Track <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </main>
  );
}
