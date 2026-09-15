import { cn } from "@/lib/utils";

interface GaugeProps {
  max: number;
  value: number;
  min: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
  showValue?: boolean;
}

export function Gauge({
  max = 100,
  min = 0,
  value = 50,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  showValue = true,
}: GaugeProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn("relative h-40 w-40 flex-col items-center justify-center", className)}
      style={
        {
          "--stroke-percent": currentPercent,
          "--gauge-primary-color": gaugePrimaryColor,
          "--gauge-secondary-color": gaugeSecondaryColor,
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="h-full w-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-[--gauge-secondary-color] opacity-20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - currentPercent * percentPx}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-[--gauge-primary-color] opacity-100 transition-all duration-1000 ease-in-out"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50px 50px",
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      )}
    </div>
  );
}
