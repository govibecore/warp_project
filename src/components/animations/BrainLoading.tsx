import { WarpLottie } from '../ui/warp-lottie';
import radarData from '../../assets/lottie/Radar.json';

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
      <div className="relative size-32 flex items-center justify-center">
        <WarpLottie animationData={radarData} className="w-full h-full opacity-80" />
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
