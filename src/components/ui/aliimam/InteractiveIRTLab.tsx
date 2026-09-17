import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CornerMarks } from "./Vectors";

interface PrecalibratedItem {
  id: string;
  name: string;
  domain: string;
  difficulty: number;
  discrimination: number;
  guessing: number;
  gradeBand: string;
  standard: string;
}

const BENCHMARK_ITEMS: PrecalibratedItem[] = [
  {
    id: "ITEM-ENG-08",
    name: "Orbital Mechanics & Vector Dynamics",
    domain: "Engineering Design",
    difficulty: 1.3,
    discrimination: 1.6,
    guessing: 0.18,
    gradeBand: "Class 10–12",
    standard: "NGSS HS-PS2-1",
  },
  {
    id: "ITEM-SYS-04",
    name: "Ecosystem Equilibrium & Dynamic Trophic Loops",
    domain: "Systems Thinking",
    difficulty: 0.1,
    discrimination: 1.4,
    guessing: 0.2,
    gradeBand: "Class 7–9",
    standard: "PISA 2025 SCI-SYS",
  },
  {
    id: "ITEM-MTH-02",
    name: "Thermodynamic Energy Flow & Ratio Scaling",
    domain: "Mathematical Reasoning",
    difficulty: -1.2,
    discrimination: 1.3,
    guessing: 0.22,
    gradeBand: "Class 4–6",
    standard: "India NCF 2023 MATH-3.2",
  },
];

export function InteractiveIRTLab({ className }: { className?: string }) {
  const [selectedItem, setSelectedItem] = useState<PrecalibratedItem>(BENCHMARK_ITEMS[1]);
  const [theta, setTheta] = useState<number>(0.4); // Current student ability estimate (-3 to +3)

  // 3PL Item Response Theory Model: P(theta) = c + (1 - c) / (1 + exp(-a * (theta - b)))
  const { probability, information, standardError, points, infoPoints } = useMemo(() => {
    const a = selectedItem.discrimination;
    const b = selectedItem.difficulty;
    const c = selectedItem.guessing;

    const computeP = (t: number) => {
      const exponent = -a * (t - b);
      return c + (1 - c) / (1 + Math.exp(exponent));
    };

    const currentP = computeP(theta);
    const q = 1 - currentP;
    // Fisher Information I(theta) = [a^2 * (P - c)^2 * Q] / [(1 - c)^2 * P]
    const info = (Math.pow(a, 2) * Math.pow(currentP - c, 2) * q) / (Math.pow(1 - c, 2) * currentP);
    // Standard Error across a 30-item sequence at this density
    const se = 1 / Math.sqrt(Math.max(0.01, info * 14));

    // Generate 31 coordinate points for SVG curve (theta from -3.0 to +3.0)
    const curvePts: string[] = [];
    const infoPts: string[] = [];
    for (let t = -3.0; t <= 3.01; t += 0.2) {
      const p = computeP(t);
      const qVal = 1 - p;
      const iVal = (Math.pow(a, 2) * Math.pow(p - c, 2) * qVal) / (Math.pow(1 - c, 2) * p);

      // Map theta [-3, 3] to SVG X [20, 380]
      const x = 20 + ((t + 3) / 6) * 360;
      // Map probability [0, 1] to SVG Y [170, 20]
      const y = 170 - p * 150;
      // Map info [0, 1.5] to SVG Y [170, 40]
      const infoY = 170 - Math.min(1.5, iVal) * 80;

      curvePts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      infoPts.push(`${x.toFixed(1)},${infoY.toFixed(1)}`);
    }

    return {
      probability: currentP,
      information: info,
      standardError: se,
      points: curvePts.join(" "),
      infoPoints: infoPts.join(" "),
    };
  }, [theta, selectedItem]);

  // Current probe point on SVG canvas
  const studentX = 20 + ((theta + 3) / 6) * 360;
  const studentY = 170 - probability * 150;

  return (
    <div
      className={cn(
        "relative border border-border bg-card p-5 sm:p-6 space-y-6 text-foreground shadow-none",
        className
      )}
    >
      <CornerMarks />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-primary" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-wider font-semibold">
              [INTERACTIVE CAT LAB] · 3PL ITEM RESPONSE THEORY
            </span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-medium tracking-tight text-foreground mt-1">
            Real-Time Adaptive Branching & Fisher Information Engine
          </h3>
        </div>

        {/* Live psychometric metrics chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs text-foreground-secondary">
          <div className="px-2 py-1 bg-surface border border-border">
            <span>P(Correct): </span>
            <span className="font-bold text-foreground tabular">
              {(probability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="px-2 py-1 bg-surface border border-border">
            <span>Fisher I(θ): </span>
            <span className="font-bold text-foreground tabular">
              {information.toFixed(2)}
            </span>
          </div>
          <div className="px-2 py-1 bg-surface border border-border">
            <span>SE(θ): </span>
            <span className="font-bold text-primary tabular">
              ±{standardError.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Item selector pills (sharp) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-foreground-secondary uppercase tracking-wider">
            Select Calibrated Diagnostic Item:
          </label>
          <span className="font-mono text-[10px] text-foreground-muted">
            IRT Parameters: a={selectedItem.discrimination} · b={selectedItem.difficulty > 0 ? `+${selectedItem.difficulty}` : selectedItem.difficulty} · c={selectedItem.guessing}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {BENCHMARK_ITEMS.map((item) => {
            const isSelected = item.id === selectedItem.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "p-2.5 text-left border transition-colors cursor-pointer",
                  isSelected
                    ? "border-primary bg-surface"
                    : "border-border bg-background hover:bg-surface hover:border-border-strong"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-primary">{item.id}</span>
                  <span className="font-mono text-[9px] text-foreground-muted">{item.gradeBand}</span>
                </div>
                <div className="font-sans text-xs font-medium text-foreground truncate mt-0.5">
                  {item.name}
                </div>
                <div className="font-mono text-[9px] text-foreground-secondary mt-0.5">
                  Diff: {item.difficulty > 0 ? `+${item.difficulty}` : item.difficulty} · {item.standard}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative bg-surface border border-border p-3 overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-mono text-foreground-muted mb-2 px-1">
          <span>CURVE: P(θ) Characteristic (Cyan) · I(θ) Fisher Information (Dotted)</span>
          <span>LATENT CONTINUUM: θ ∈ [-3.0, +3.0]</span>
        </div>

        <svg
          viewBox="0 0 400 190"
          className="w-full h-44 sm:h-52 overflow-visible font-mono text-[9px] fill-foreground-muted select-none"
        >
          {/* Subtle mathematical grid */}
          <line x1="20" y1="170" x2="380" y2="170" stroke="var(--border)" strokeWidth="1" />
          <line x1="20" y1="95" x2="380" y2="95" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="20" x2="380" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="10" x2="200" y2="175" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Scale labels */}
          <text x="2" y="24">1.0</text>
          <text x="2" y="99">0.5</text>
          <text x="2" y="174">0.0</text>
          <text x="16" y="185">-3.0</text>
          <text x="100" y="185">-1.5</text>
          <text x="194" y="185">0.0θ</text>
          <text x="286" y="185">+1.5</text>
          <text x="368" y="185">+3.0</text>

          {/* Fisher Information Curve (Dotted Grey) */}
          <polyline
            fill="none"
            stroke="var(--foreground-muted)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points={infoPoints}
            opacity="0.6"
          />

          {/* 3PL Item Characteristic Curve (Fjord Cyan) */}
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            points={points}
          />

          {/* Current Student Probe Lines & Intersect */}
          <line
            x1={studentX}
            y1="10"
            x2={studentX}
            y2="170"
            stroke="var(--foreground-secondary)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1="20"
            y1={studentY}
            x2="380"
            y2={studentY}
            stroke="var(--foreground-secondary)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Student Probe Reticle */}
          <rect
            x={studentX - 4}
            y={studentY - 4}
            width="8"
            height="8"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="1.5"
          />
          <text
            x={studentX + 8 > 320 ? studentX - 60 : studentX + 8}
            y={studentY - 8 < 25 ? studentY + 16 : studentY - 8}
            fill="var(--foreground)"
            fontWeight="600"
          >
            θ={theta > 0 ? `+${theta.toFixed(1)}` : theta.toFixed(1)} (P={(probability * 100).toFixed(0)}%)
          </text>
        </svg>
      </div>

      {/* Interactive Ability Slider */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">[PROBE SLIDER]</span>
            <span className="text-foreground">Simulate Student Latent Ability (θ):</span>
          </div>
          <div className="font-bold text-foreground text-sm tabular">
            θ = {theta > 0 ? `+${theta.toFixed(2)}` : theta.toFixed(2)}
            <span className="text-foreground-secondary font-normal ml-2">
              (Percentile ≈ {Math.min(99.9, Math.max(0.1, (1 / (1 + Math.exp(-1.7 * theta))) * 100)).toFixed(1)}%)
            </span>
          </div>
        </div>

        <input
          type="range"
          min="-3"
          max="3"
          step="0.05"
          value={theta}
          onChange={(e) => setTheta(parseFloat(e.target.value))}
          className="w-full accent-primary cursor-pointer h-2 bg-border appearance-none rounded-none"
        />

        <div className="flex justify-between font-mono text-[10px] text-foreground-muted">
          <span>Foundational (-3.0θ · P1)</span>
          <span>Cohort Mean (0.0θ · P50)</span>
          <span>Advanced Mastery (+3.0θ · P99.9)</span>
        </div>
      </div>

      {/* Explanatory callout footnote */}
      <div className="p-3 bg-surface border border-border text-xs text-foreground-secondary space-y-1">
        <div className="font-mono text-[10px] text-primary uppercase font-medium">
          Psychometric Diagnostic Mechanism:
        </div>
        <p className="leading-relaxed">
          In fixed 100-item tests, 70% of questions are either too easy or too hard for any given student, wasting test time and inflating measurement error. WARP's adaptive CAT algorithm dynamically targets items where Fisher Information <span className="font-mono font-semibold text-foreground">I(θ)</span> peaks, achieving standard error <span className="font-mono font-semibold text-foreground">SE &lt; 0.18</span> in just 30 questions.
        </p>
      </div>
    </div>
  );
}
