import { motion } from 'motion/react';

interface BrainLoadingProps {
  label?: string;
  sublabel?: string;
}

export function BrainLoading({
  label = 'Synthesizing Psychometric Diagnostics…',
  sublabel = 'Analyzing latent ability parameters across Singapore, US, and China standards',
}: BrainLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="relative size-28 flex items-center justify-center">
        {/* Outer glowing pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-none border-2 border-primary/30 bg-primary/5 blur-xs"
        />
        <motion.div
          animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute inset-0 rounded-none border border-primary/20 bg-primary/5 blur-sm"
        />

        {/* Orbiting particles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-2.5 rounded-none bg-primary shadow-[0_0_8px_var(--primary,#3b82f6)]" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-2 rounded-none bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </motion.div>

        {/* Central Brain SVG with Synapse Pulses */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-16 text-primary z-10 drop-shadow-md"
        >
          {/* Left Hemisphere */}
          <path
            d="M30 14C23.3726 14 18 19.3726 18 26C18 27.8 18.4 29.5 19.1 31C16.7 32.5 15 35 15 38C15 41.5 17.2 44.4 20.3 45.4C20.8 48.6 23.6 51 27 51C28 51 29 50.8 30 50.4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          {/* Right Hemisphere */}
          <path
            d="M34 14C40.6274 14 46 19.3726 46 26C46 27.8 45.6 29.5 44.9 31C47.3 32.5 49 35 49 38C49 41.5 46.8 44.4 43.7 45.4C43.2 48.6 40.4 51 37 51C36 51 35 50.8 34 50.4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          {/* Central neural divider line */}
          <path
            d="M32 18V48"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="2 2"
            className="opacity-60"
          />
          {/* Internal synaptic nodes */}
          <circle cx="26" cy="28" r="2" fill="currentColor" className="animate-ping opacity-75" />
          <circle cx="38" cy="28" r="2" fill="currentColor" className="animate-ping opacity-75 [animation-delay:0.5s]" />
          <circle cx="28" cy="40" r="2" fill="currentColor" className="animate-ping opacity-75 [animation-delay:1s]" />
          <circle cx="36" cy="40" r="2" fill="currentColor" className="animate-ping opacity-75 [animation-delay:1.5s]" />
        </svg>
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="font-display text-base font-bold text-foreground tracking-tight">
          {label}
        </h3>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          {sublabel}
        </p>
      </div>
    </div>
  );
}
