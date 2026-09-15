/**
 * International STEM Benchmarking Engine
 * Calibrated against Singapore (SASMO/PSLE/O-Levels), China (Olympiad/Gaokao Foundation),
 * USA (AMC/NGSS/AP), Europe (Bebras/Kangaroo/PISA), and India (JEE/CBSE/Olympiad).
 */

export type StemCompetencyKey = 
  | 'scientificInquiry'
  | 'computationalThinking'
  | 'engineeringDesign'
  | 'mathematicalReasoning'
  | 'systemsThinking';

export type EnglishCompetencyKey =
  | 'understanding'
  | 'locatingInformation'
  | 'synthesis'
  | 'evaluatingReflecting';

export type CompetencyKey = StemCompetencyKey | EnglishCompetencyKey;

export const STEM_COMPETENCIES: StemCompetencyKey[] = [
  'scientificInquiry',
  'computationalThinking',
  'engineeringDesign',
  'mathematicalReasoning',
  'systemsThinking',
];

export const ENGLISH_COMPETENCIES: EnglishCompetencyKey[] = [
  'understanding',
  'locatingInformation',
  'synthesis',
  'evaluatingReflecting',
];

export const COMPETENCY_LABELS: Record<CompetencyKey, string> = {
  scientificInquiry: 'Scientific Inquiry',
  computationalThinking: 'Computational Thinking',
  engineeringDesign: 'Engineering Design',
  mathematicalReasoning: 'Mathematical Reasoning',
  systemsThinking: 'Systems Thinking',
  understanding: 'Reading Comprehension',
  locatingInformation: 'Locating Information',
  synthesis: 'Synthesis & Integration',
  evaluatingReflecting: 'Evaluating & Reflecting',
};

export type BenchmarkRegion = 'Global' | 'Singapore' | 'China' | 'USA' | 'Europe' | 'India';

export interface RegionalNorm {
  mean: number;
  stdDev: number;
  description: string;
}

// Latent ability norms (theta ~ N(mean, stdDev)) for each region across international cohorts
export const REGIONAL_NORMS: Record<BenchmarkRegion, Record<CompetencyKey, RegionalNorm>> = {
  Global: {
    scientificInquiry: { mean: 0.0, stdDev: 1.0, description: 'Global PISA/TIMSS median baseline' },
    computationalThinking: { mean: 0.0, stdDev: 1.0, description: 'International average computational literacy' },
    engineeringDesign: { mean: 0.0, stdDev: 1.0, description: 'Standard applied engineering intuition' },
    mathematicalReasoning: { mean: 0.0, stdDev: 1.0, description: 'Global mathematics benchmark mean' },
    systemsThinking: { mean: 0.0, stdDev: 1.0, description: 'Global multi-variable causal modeling' },
    understanding: { mean: 0.0, stdDev: 1.0, description: 'Global PISA reading literacy median' },
    locatingInformation: { mean: 0.0, stdDev: 1.0, description: 'Global factual extraction baseline' },
    synthesis: { mean: 0.0, stdDev: 1.0, description: 'Global multi-text integration baseline' },
    evaluatingReflecting: { mean: 0.0, stdDev: 1.0, description: 'Global critical evaluation standard' },
  },
  Singapore: {
    scientificInquiry: { mean: 0.65, stdDev: 0.85, description: 'MOE Primary Science / O-Level inquiry standards' },
    computationalThinking: { mean: 0.80, stdDev: 0.80, description: 'Singapore SASMO & National Olympiad in Informatics foundation' },
    engineeringDesign: { mean: 0.60, stdDev: 0.85, description: 'Applied STEM & constraint optimization' },
    mathematicalReasoning: { mean: 0.95, stdDev: 0.75, description: 'Singapore Math CPA (Concrete-Pictorial-Abstract) bar modeling' },
    systemsThinking: { mean: 0.70, stdDev: 0.80, description: 'Ecology & physical systems equilibrium curriculum' },
    understanding: { mean: 0.75, stdDev: 0.80, description: 'Singapore MOE O-Level English comprehension rigor' },
    locatingInformation: { mean: 0.80, stdDev: 0.75, description: 'Singapore high-density factual retrieval' },
    synthesis: { mean: 0.70, stdDev: 0.80, description: 'Singapore General Paper multi-source synthesis' },
    evaluatingReflecting: { mean: 0.65, stdDev: 0.85, description: 'Critical evaluation of author stance and bias' },
  },
  China: {
    scientificInquiry: { mean: 0.60, stdDev: 0.85, description: 'National science syllabus & laboratory deduction' },
    computationalThinking: { mean: 0.90, stdDev: 0.75, description: 'National Olympiad in Informatics (NOIP/CCOI) algorithmic depth' },
    engineeringDesign: { mean: 0.55, stdDev: 0.85, description: 'Structural problem solving & state optimization' },
    mathematicalReasoning: { mean: 1.05, stdDev: 0.70, description: 'Chinese Mathematical Olympiad (CMO) & Gaokao analytical rigor' },
    systemsThinking: { mean: 0.65, stdDev: 0.80, description: 'Multi-variable algebraic dynamics' },
    understanding: { mean: 0.50, stdDev: 0.85, description: 'Gaokao English reading comprehension standard' },
    locatingInformation: { mean: 0.65, stdDev: 0.80, description: 'Technical and grammatical scanning precision' },
    synthesis: { mean: 0.45, stdDev: 0.90, description: 'Cross-text inference in bilingual curriculum' },
    evaluatingReflecting: { mean: 0.40, stdDev: 0.95, description: 'Critical text evaluation & authorial intent' },
  },
  USA: {
    scientificInquiry: { mean: 0.55, stdDev: 0.95, description: 'NGSS (Next Generation Science Standards) 3D inquiry' },
    computationalThinking: { mean: 0.50, stdDev: 1.00, description: 'AP Computer Science & USACO entry benchmarks' },
    engineeringDesign: { mean: 0.70, stdDev: 0.90, description: 'FIRST Robotics & Maker/Engineering iterative prototyping' },
    mathematicalReasoning: { mean: 0.40, stdDev: 1.05, description: 'MAA AMC 8/10/12 competition standards' },
    systemsThinking: { mean: 0.50, stdDev: 0.95, description: 'Complex systems & ecological web analysis' },
    understanding: { mean: 0.65, stdDev: 0.90, description: 'SAT / ACT reading comprehension national median' },
    locatingInformation: { mean: 0.60, stdDev: 0.95, description: 'Information retrieval across diverse media' },
    synthesis: { mean: 0.65, stdDev: 0.90, description: 'AP English Language synthesis & argument modeling' },
    evaluatingReflecting: { mean: 0.70, stdDev: 0.85, description: 'Rhetorical analysis and perspective critique' },
  },
  Europe: {
    scientificInquiry: { mean: 0.60, stdDev: 0.90, description: 'PISA Top-Decile (Finland/Estonia) scientific literacy' },
    computationalThinking: { mean: 0.65, stdDev: 0.85, description: 'Bebras International Computational Challenge' },
    engineeringDesign: { mean: 0.50, stdDev: 0.90, description: 'Technical apprenticeship & applied mechanics' },
    mathematicalReasoning: { mean: 0.55, stdDev: 0.90, description: 'Kangourou sans Frontières (Kangaroo Math) reasoning' },
    systemsThinking: { mean: 0.65, stdDev: 0.85, description: 'Closed-loop environmental & thermodynamic systems' },
    understanding: { mean: 0.60, stdDev: 0.90, description: 'CEFR C1/C2 / Cambridge English advanced literacy' },
    locatingInformation: { mean: 0.60, stdDev: 0.90, description: 'Multilingual document reading & scanning' },
    synthesis: { mean: 0.60, stdDev: 0.90, description: 'Comparative literature and multi-source synthesis' },
    evaluatingReflecting: { mean: 0.65, stdDev: 0.85, description: 'Critical media literacy and bias deconstruction' },
  },
  India: {
    scientificInquiry: { mean: 0.35, stdDev: 1.05, description: 'NCERT / CBSE Exemplar & INJSO stage 1' },
    computationalThinking: { mean: 0.40, stdDev: 1.10, description: 'ZIO (Zonal Informatics Olympiad) & CS foundation' },
    engineeringDesign: { mean: 0.30, stdDev: 1.05, description: 'Applied engineering design & trade-off heuristics' },
    mathematicalReasoning: { mean: 0.65, stdDev: 0.95, description: 'IOQM / JEE Advanced foundation mathematics' },
    systemsThinking: { mean: 0.35, stdDev: 1.05, description: 'Systems balance & feedback loop tracing' },
    understanding: { mean: 0.45, stdDev: 1.05, description: 'CBSE / ICSE English Core literature comprehension' },
    locatingInformation: { mean: 0.50, stdDev: 1.00, description: 'Unseen passage factual extraction' },
    synthesis: { mean: 0.35, stdDev: 1.10, description: 'Integrated essay writing & argument synthesis' },
    evaluatingReflecting: { mean: 0.35, stdDev: 1.10, description: 'Critical commentary on perspective and tone' },
  }
};

/**
 * High precision Standard Normal Cumulative Distribution Function (Phi)
 * Abramowitz and Stegun approximation (formula 7.1.26)
 */
export function normalCDF(z: number): number {
  if (z < -7) return 0;
  if (z > 7) return 1;

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804014327; // 1 / sqrt(2*pi)

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const prob = c * Math.exp(-0.5 * absZ * absZ) * poly;

  return sign < 0 ? prob : 1.0 - prob;
}

/**
 * Calculates regional percentile for a given theta and regional norm
 */
export function calculateRegionalPercentile(theta: number, norm: RegionalNorm): number {
  const z = (theta - norm.mean) / norm.stdDev;
  const percentile = Math.round(normalCDF(z) * 100);
  return Math.max(1, Math.min(99, percentile));
}

/**
 * Converts latent theta to standardized 100 - 900 scale (calibrated around mean 500)
 */
export function thetaToScaledScore(theta: number): number {
  const scaled = Math.round(500 + 133.33 * theta);
  return Math.max(100, Math.min(900, scaled));
}

/**
 * Converts latent theta to 0 - 100 radar chart scale
 */
export function thetaToRadarIndex(theta: number): number {
  const score = Math.round(50 + 18 * theta);
  return Math.max(5, Math.min(99, score));
}

export interface InternationalBenchmarkResult {
  subject?: string;
  aggregateScaledScore: number;
  globalPercentile: number;
  regionalPercentiles: Record<BenchmarkRegion, number>;
  competencyBreakdown: Record<string, {
    theta: number;
    scaledScore: number;
    radarScore: number;
    globalPercentile: number;
    singaporePercentile: number;
    chinaPercentile: number;
    usaPercentile: number;
    europePercentile: number;
    indiaPercentile: number;
    singaporeGapSigma: number;
  }>;
  radarData: Array<{
    competency: string;
    student: number;
    singaporeTop10: number;
    globalMedian: number;
  }>;
  cognitiveArchetype: {
    title: string;
    tagline: string;
    description: string;
    primaryStrength: string;
    criticalBlindspot: string;
  };
  realityCheck: {
    verdict: string;
    honestSummary: string;
    internationalGapSummary: string;
    gradeInflationWarning: string;
  };
  studentChallengeSprint: {
    week1: { title: string; focus: string; mission: string };
    week2: { title: string; focus: string; mission: string };
    week3: { title: string; focus: string; mission: string };
    week4: { title: string; focus: string; mission: string };
  };
  parentActionBlueprint: {
    immediateHomeRoutines: string[];
    recommendedCurricula: Array<{ name: string; urlDescription: string; purpose: string }>;
    quarterlyMilestones: string[];
    indianHomeRoutines?: string[];
    indianRecommendedCurricula?: Array<{ name: string; category?: string; urlDescription: string; purpose: string }>;
    ptmDiscussionGuide?: string[];
    streamOrientation?: { topStream: string; description: string; subjectFocus: string };
  };
  indiaNationalPercentile: number;
  boardGradeBand: {
    grade: string;
    band: string;
    descriptor: string;
    percentileEquivalent: string;
    schoolMarksCorrelation: string;
  };
  parakhHolisticPillars: {
    conceptualKnowledge: { score: number; level: string; label: string; description: string };
    applicationAndProblemSolving: { score: number; level: string; label: string; description: string };
    higherOrderThinkingSkills: { score: number; level: string; label: string; description: string };
    overallSummary: string;
  };
  indianCompetitiveFoundation: {
    tier: string;
    badge: string;
    description: string;
    recommendation: string;
  };
  unescoIndicators: {
    tier1Foundation: { score: number; level: string; description: string };
    tier2Application: { score: number; level: string; description: string };
    tier3Innovation: { score: number; level: string; description: string };
    summary: string;
  };
  ieeeMdlStage: {
    stage: 'Acclimation' | 'Competency' | 'Proficiency' | 'Mastery';
    domainKnowledgeDepth: string;
    strategicProcessing: string;
    personalInterestSustenance: string;
    progressionSummary: string;
  };
  nsfComparisons: {
    candidateEquivalentTimss: number;
    singaporeBenchmarkScore: number;
    eastAsiaTopTierScore: number;
    oecdTopDecileScore: number;
    usNationalAverageScore: number;
    nationalPercentileDelta: string;
    nsb2026Insight: string;
  };
  frontierPillars: {
    aiDataLiteracy: { index: number; tier: string; details: string };
    roboticsAutomation: { index: number; tier: string; details: string };
    xrSimulation: { index: number; tier: string; details: string };
    smartSustainableSystems: { index: number; tier: string; details: string };
  };
}

/**
 * Computes the complete international benchmark diagnosis
 */
export function computeInternationalBenchmark(
  thetas: Record<string, number>,
  classLevel: number,
  subject: string = 'STEM'
): InternationalBenchmarkResult {
  const isEnglish = subject.toLowerCase().includes('english');
  const keys: CompetencyKey[] = isEnglish ? ENGLISH_COMPETENCIES : STEM_COMPETENCIES;

  const breakdown: any = {};
  let totalTheta = 0;
  let count = 0;

  for (const k of keys) {
    const th = thetas[k] ?? 0;
    totalTheta += th;
    count++;

    const sgNorm = REGIONAL_NORMS.Singapore[k];
    const cnNorm = REGIONAL_NORMS.China[k];
    const usNorm = REGIONAL_NORMS.USA[k];
    const euNorm = REGIONAL_NORMS.Europe[k];
    const inNorm = REGIONAL_NORMS.India[k];
    const glNorm = REGIONAL_NORMS.Global[k];

    const sgGap = Number(((th - sgNorm.mean) / sgNorm.stdDev).toFixed(2));

    breakdown[k] = {
      theta: Number(th.toFixed(2)),
      scaledScore: thetaToScaledScore(th),
      radarScore: thetaToRadarIndex(th),
      globalPercentile: calculateRegionalPercentile(th, glNorm),
      singaporePercentile: calculateRegionalPercentile(th, sgNorm),
      chinaPercentile: calculateRegionalPercentile(th, cnNorm),
      usaPercentile: calculateRegionalPercentile(th, usNorm),
      europePercentile: calculateRegionalPercentile(th, euNorm),
      indiaPercentile: calculateRegionalPercentile(th, inNorm),
      singaporeGapSigma: sgGap,
    };
  }

  const avgTheta = count > 0 ? totalTheta / count : 0;
  const aggregateScaledScore = thetaToScaledScore(avgTheta);
  const globalPercentile = calculateRegionalPercentile(avgTheta, { mean: 0.0, stdDev: 1.0, description: '' });

  const regionalPercentiles: Record<BenchmarkRegion, number> = {
    Global: globalPercentile,
    Singapore: calculateRegionalPercentile(avgTheta, { mean: 0.74, stdDev: 0.81, description: '' }),
    China: calculateRegionalPercentile(avgTheta, { mean: 0.75, stdDev: 0.79, description: '' }),
    USA: calculateRegionalPercentile(avgTheta, { mean: 0.53, stdDev: 0.97, description: '' }),
    Europe: calculateRegionalPercentile(avgTheta, { mean: 0.58, stdDev: 0.89, description: '' }),
    India: calculateRegionalPercentile(avgTheta, { mean: 0.41, stdDev: 1.06, description: '' }),
  };

  // Radar Data
  const radarData = keys.map(k => ({
    competency: COMPETENCY_LABELS[k],
    student: breakdown[k].radarScore,
    singaporeTop10: 88, // 90th percentile benchmark in Singapore
    globalMedian: 50,
  }));

  // Cognitive Archetype determination
  let cognitiveArchetype;

  if (isEnglish) {
    const und = thetas.understanding ?? 0;
    const loc = thetas.locatingInformation ?? 0;
    const syn = thetas.synthesis ?? 0;
    const evr = thetas.evaluatingReflecting ?? 0;

    if (syn >= 0.8 && evr >= 0.7) {
      cognitiveArchetype = {
        title: 'Critical Text Synthesizer',
        tagline: 'High-order argument synthesis and rhetorical deconstruction',
        description: 'Excels at evaluating complex argumentative structures, distinguishing rhetorical persuasion from empirical evidence, comparable to top-quartile PISA reading literacy and Cambridge O-Level cohorts.',
        primaryStrength: 'Cross-document synthesis, subtext inference, and premise validation.',
        criticalBlindspot: 'May overcomplicate direct factual retrieval items by hunting for hidden subtext.',
      };
    } else if (und >= 0.8 && loc >= 0.8) {
      cognitiveArchetype = {
        title: 'Analytical Close Reader',
        tagline: 'Surgical textual comprehension and rapid evidence extraction',
        description: 'Demonstrates outstanding precision in parsing syntactic structure, defining domain vocabulary from context, and locating supporting evidence.',
        primaryStrength: 'High accuracy in textual evidence citation and vocabulary in context.',
        criticalBlindspot: 'Can struggle when contrasting multiple conflicting perspectives with ambiguous author stances.',
      };
    } else if (und < 0.2 && loc < 0.2) {
      cognitiveArchetype = {
        title: 'Emerging Text Explorer',
        tagline: 'Relies on surface scanning and isolated vocabulary cues',
        description: 'Currently relies on superficial keyword matching rather than systematic paragraph parsing. Susceptible to distractors that reuse passage words in incorrect contexts.',
        primaryStrength: 'Fast initial impression of main themes.',
        criticalBlindspot: 'High vulnerability to distractor options engineered around superficial keyword overlap.',
      };
    } else {
      cognitiveArchetype = {
        title: 'Discursive Text Analyst',
        tagline: 'Balanced reading comprehension and contextual synthesis',
        description: 'Demonstrates a reliable baseline across reading comprehension and evidence extraction, with opportunities to build deeper critical rhetoric and cross-text synthesis skills.',
        primaryStrength: 'Core thematic comprehension and contextual inference',
        criticalBlindspot: 'May overlook nuanced counter-perspectives in multi-author argumentative texts.',
      };
    }
  } else {
    const math = thetas.mathematicalReasoning ?? 0;
    const comp = thetas.computationalThinking ?? 0;
    const sci = thetas.scientificInquiry ?? 0;
    const eng = thetas.engineeringDesign ?? 0;
    const sys = thetas.systemsThinking ?? 0;

    if (comp >= 0.8 && math >= 0.8) {
      cognitiveArchetype = {
        title: 'Algorithmic Architect',
        tagline: 'High-order formal deduction & computational abstraction',
        description: 'Excels at decomposing complex state spaces, invariant identification, and algorithmic recursion akin to top-quartile Singapore SASMO and Chinese Olympiad medalists.',
        primaryStrength: 'Mathematical invariance, algebraic manipulation, and recursive problem structuring.',
        criticalBlindspot: 'May prematurely abstract real-world engineering constraints or overlook empirical noise in physical experiments.',
      };
    } else if (sci >= 0.8 && sys >= 0.7) {
      cognitiveArchetype = {
        title: 'First-Principles Systems Scientist',
        tagline: 'Deep causal tracing and dynamic equilibrium modeling',
        description: 'Thinks like an experimental researcher. Unpacks non-linear feedback loops, controls confounding variables, and refuses to rely on superficial pattern matching.',
        primaryStrength: 'Hypothesis testing, variable isolation, and detecting feedback instability.',
        criticalBlindspot: 'Can be slowed down when pure high-speed algorithmic or algebraic speed is required without empirical context.',
      };
    } else if (eng >= 0.7 && comp >= 0.6) {
      cognitiveArchetype = {
        title: 'Iterative Systems Engineer',
        tagline: 'Constraint-driven optimization and pragmatic design',
        description: 'Naturally analyzes bottlenecks, safety factors, and trade-off frontiers. Approaches problems with an engineering design mindset seen in US FIRST robotics cohorts.',
        primaryStrength: 'Multi-objective optimization, cost-benefit trade-offs, and failure mode analysis.',
        criticalBlindspot: 'May settle for a "good-enough" empirical heuristic before proving the global theoretical optimum.',
      };
    } else if (math < 0.2 && comp < 0.2) {
      cognitiveArchetype = {
        title: 'Intuitive Pattern Explorer',
        tagline: 'Relies on surface associations and visual cues',
        description: 'Currently operates using surface intuition rather than formal mathematical models. Frequently falls for distractor options that "feel" intuitive but violate fundamental conservation laws.',
        primaryStrength: 'Fast initial hypothesis generation.',
        criticalBlindspot: 'Severe susceptibility to counter-intuitive physics traps and non-linear scaling surprises.',
      };
    } else {
      cognitiveArchetype = {
        title: 'Versatile STEM Investigator',
        tagline: 'Balanced analytical and empirical reasoning',
        description: 'Demonstrates a solid baseline across analytical calculation and empirical inquiry, with room to develop rigorous first-principles proof methods.',
        primaryStrength: 'Adaptability across varied STEM domains',
        criticalBlindspot: 'Vulnerable to subtle multi-variable edge cases when problems deviate from standard textbook templates.',
      };
    }
  }

  // Reality Check: Candid evaluation
  let verdict = 'Competitive with Global Average; Behind Asian Elite Benchmark';
  if (regionalPercentiles.Singapore >= 75) {
    verdict = 'Globally Elite (Top Quartile vs Singapore & China Peers)';
  } else if (regionalPercentiles.Singapore >= 50) {
    verdict = 'Solid International Foundation (At Par with Singapore/Europe Median)';
  } else {
    verdict = 'Significant Global Deficit in Deep Conceptual Transfer';
  }

  const sgRank = regionalPercentiles.Singapore;
  const cnRank = regionalPercentiles.China;
  const glRank = regionalPercentiles.Global;

  let realityCheck;
  if (isEnglish) {
    const undGap = breakdown.understanding?.singaporeGapSigma ?? 0;
    const synGap = breakdown.synthesis?.singaporeGapSigma ?? 0;
    realityCheck = {
      verdict,
      honestSummary: `The candidate scored in the ${glRank}th percentile globally in English literacy, but drops to the ${sgRank}th percentile against Singapore peers and ${cnRank}th percentile against international bilingual standards in Class ${classLevel}. While conventional school grades often reward memorization of textbook answers, this international benchmark evaluated non-routine conceptual synthesis and critical reading.`,
      internationalGapSummary: `Against Singapore MOE English and Cambridge International standards, the candidate demonstrates an average gap of ${Math.abs(undGap)}σ in textual comprehension and ${Math.abs(synGap)}σ in cross-text synthesis. Peers in top-tier cohorts at Class ${classLevel} consistently utilize active margin annotation, evidence tracing, and rhetorical analysis.`,
      gradeInflationWarning: `Caution: Standard school report cards (90%+ marks) often create a false sense of security. School exams assess recall of practiced grammar and prescribed book questions; international benchmarks assess whether the student can critique and synthesize unfamiliar, challenging passages under timed conditions. Immediate recalibration toward non-routine challenge is essential.`,
    };
  } else {
    realityCheck = {
      verdict,
      honestSummary: `The candidate scored in the ${glRank}th percentile globally, but drops to the ${sgRank}th percentile against Singapore peers and ${cnRank}th percentile against Chinese peers in Class ${classLevel}. While conventional school grades often reward memorization of standard formulas, this international benchmark evaluated non-routine conceptual transfer.`,
      internationalGapSummary: `Against Singapore SASMO/PSLE and China Olympiad standards, the candidate demonstrates an average gap of ${Math.abs(breakdown.mathematicalReasoning?.singaporeGapSigma ?? 0)}σ in formal mathematical modeling and ${Math.abs(breakdown.computationalThinking?.singaporeGapSigma ?? 0)}σ in computational logic. Peers in Singapore and China at Class ${classLevel} consistently utilize visual bar modeling, invariant analysis, and systematic state tracking.`,
      gradeInflationWarning: `Caution: Standard school report cards (90%+ marks) often create a false sense of security. School exams assess recall of practiced problem types; international benchmarks assess whether the student can apply first principles to completely unfamiliar scenarios. Immediate recalibration toward non-routine challenge is essential.`,
    };
  }

  // Grade-calibrated challenge sprint
  const studentChallengeSprint = getStudentSprint(classLevel, cognitiveArchetype.title, isEnglish);
  const parentActionBlueprint = getParentBlueprint(classLevel, breakdown, isEnglish);

  const indiaNationalPercentile = regionalPercentiles.India;

  // Compute CBSE/ICSE Board Grade Band
  let boardGradeBand: {
    grade: string;
    band: string;
    descriptor: string;
    percentileEquivalent: string;
    schoolMarksCorrelation: string;
  };

  if (aggregateScaledScore >= 720 || indiaNationalPercentile >= 90) {
    boardGradeBand = {
      grade: 'A1',
      band: 'Outstanding Conceptual Mastery',
      descriptor: 'Top 10% national tier; capable of solving high-order Olympiad and JEE/NEET foundation questions with independent first-principles reasoning.',
      percentileEquivalent: 'Top 10% Nationally (90th–99th Percentile)',
      schoolMarksCorrelation: 'Equivalent to 95–100% in CBSE/ICSE with high competitive Olympiad aptitude',
    };
  } else if (aggregateScaledScore >= 620 || indiaNationalPercentile >= 75) {
    boardGradeBand = {
      grade: 'A2',
      band: 'Excellent / High Foundation',
      descriptor: 'Solid conceptual clarity across foundational syllabus; ready to tackle non-routine multi-step challenges with structured guidance.',
      percentileEquivalent: 'Top 25% Nationally (75th–89th Percentile)',
      schoolMarksCorrelation: 'Equivalent to 85–94% in CBSE/ICSE; strong textbook grasp, developing Olympiad speed',
    };
  } else if (aggregateScaledScore >= 520 || indiaNationalPercentile >= 55) {
    boardGradeBand = {
      grade: 'B1',
      band: 'Proficient Foundation',
      descriptor: 'Reliable recall and routine formula application; occasionally susceptible to non-standard distractor options and multi-step word problems.',
      percentileEquivalent: 'National Median to Top 45% (55th–74th Percentile)',
      schoolMarksCorrelation: 'Equivalent to 75–84% in CBSE/ICSE; good classroom performance, needs Olympiad exposure',
    };
  } else if (aggregateScaledScore >= 420 || indiaNationalPercentile >= 40) {
    boardGradeBand = {
      grade: 'B2',
      band: 'Developing Competency',
      descriptor: 'Understands core syllabus concepts but relies heavily on practiced textbook questions; needs deliberate practice on unfamiliar variations.',
      percentileEquivalent: 'Mid-Tier Nationally (40th–54th Percentile)',
      schoolMarksCorrelation: 'Equivalent to 65–74% in CBSE/ICSE; prone to formula confusion under time pressure',
    };
  } else {
    boardGradeBand = {
      grade: 'C1',
      band: 'Foundational Support Needed',
      descriptor: 'Conceptual gaps in core definitions; requires rebuilding basics through concrete examples and visual diagrams before competitive drills.',
      percentileEquivalent: 'Foundational Tier (Below 40th Percentile)',
      schoolMarksCorrelation: 'Requires targeted revision of NCERT foundational chapters',
    };
  }

  // PARAKH (NEP 2020) 3-Pillar Progress Card
  const parakhP1Score = Math.max(15, Math.min(99, Math.round(55 + avgTheta * 16)));
  const parakhP2Score = Math.max(10, Math.min(99, Math.round(48 + avgTheta * 18)));
  const parakhP3Score = Math.max(10, Math.min(99, Math.round(40 + avgTheta * 20)));

  const getParakhTier = (sc: number) => (sc >= 75 ? 'Advanced Mastery' : sc >= 55 ? 'Proficient Application' : 'Developing Baseline');

  const parakhHolisticPillars = {
    conceptualKnowledge: {
      score: parakhP1Score,
      level: getParakhTier(parakhP1Score),
      label: 'Core Conceptual Knowledge & Recall',
      description: isEnglish
        ? 'Direct evidence extraction, core grammar syntax, and literal reading comprehension.'
        : 'Mastery of fundamental definitions, scientific laws, and standard arithmetic/algebraic procedures (CBSE/ICSE syllabus alignment).',
    },
    applicationAndProblemSolving: {
      score: parakhP2Score,
      level: getParakhTier(parakhP2Score),
      label: 'Application & Numerical Problem Solving',
      description: isEnglish
        ? 'Cross-paragraph thematic inference, rhetorical technique identification, and structured comparative analysis.'
        : 'Translating real-world word problems into mathematical equations and physical models without relying on rote memorization.',
    },
    higherOrderThinkingSkills: {
      score: parakhP3Score,
      level: getParakhTier(parakhP3Score),
      label: 'Higher-Order Thinking Skills (HOTS)',
      description: isEnglish
        ? 'Critical evaluation of authorial bias, subtext deconstruction, and robust immunity against deceptive distractor choices.'
        : 'Critical inquiry, isolating invariants, spotting edge cases, and immunity to subtle distractor traps engineered around common misconceptions.',
    },
    overallSummary: `PARAKH (NEP 2020) 360° Profile: ${getParakhTier(parakhP1Score)} in Core Knowledge, ${getParakhTier(parakhP2Score)} in Application, and ${getParakhTier(parakhP3Score)} in HOTS.`,
  };

  // Indian Competitive Foundation (Olympiads / JEE-NEET)
  let competitiveTier: string;
  let competitiveBadge: string;
  let competitiveDescription: string;
  let competitiveRecommendation: string;

  if (indiaNationalPercentile >= 85) {
    competitiveTier = 'National Olympiad & Advanced Foundation Tier';
    competitiveBadge = 'Podium Contender';
    competitiveDescription = 'Demonstrates the analytical depth required for top ranks in SOF IMO/NSO, SilverZone, and early JEE/NEET Advanced foundation problem solving.';
    competitiveRecommendation = 'Advance to NCERT Exemplar Achievers section and Level-2 Olympiad papers (Class 8/9 bridge level).';
  } else if (indiaNationalPercentile >= 65) {
    competitiveTier = 'Zonal & State Olympiad Contender Tier';
    competitiveBadge = 'High Potential';
    competitiveDescription = 'Well above average in school curriculum; with consistent weekly practice on non-routine questions, capable of securing top 5% zonal ranks.';
    competitiveRecommendation = 'Focus on eliminating calculation rush errors and practice multi-variable constraint problems.';
  } else {
    competitiveTier = 'Strong Board Foundation & School Exam Tier';
    competitiveBadge = 'Foundational Track';
    competitiveDescription = 'Solid foundation for CBSE/ICSE school exams; requires gradual exposure to competitive problem patterns to build higher-order agility.';
    competitiveRecommendation = 'Strengthen NCERT core concepts first, then attempt Level-1 Olympiad worksheets.';
  }

  const indianCompetitiveFoundation = {
    tier: competitiveTier,
    badge: competitiveBadge,
    description: competitiveDescription,
    recommendation: competitiveRecommendation,
  };

  // UNESCO 3-Tier Indicator Framework
  const tier1Score = Math.max(10, Math.min(99, Math.round(50 + avgTheta * 18)));
  const tier2Score = Math.max(10, Math.min(99, Math.round(45 + avgTheta * 20)));
  const tier3Score = Math.max(5, Math.min(99, Math.round(35 + avgTheta * 22)));

  const getTierLevel = (sc: number) => (sc >= 80 ? 'Advanced Mastery' : sc >= 55 ? 'Proficient Application' : 'Developing Baseline');

  const unescoIndicators = {
    tier1Foundation: {
      score: tier1Score,
      level: getTierLevel(tier1Score),
      description: isEnglish 
        ? 'Foundational textual comprehension; direct evidence retrieval and literal meaning extraction.'
        : 'Foundational scientific and mathematical conceptual grasp; recall and direct single-variable operations.',
    },
    tier2Application: {
      score: tier2Score,
      level: getTierLevel(tier2Score),
      description: isEnglish
        ? 'Cross-paragraph thematic inference, rhetorical technique identification, and structured comparative analysis.'
        : 'Multi-variable causal analysis, hypothesis testing, and principled cross-domain application under routine conditions.',
    },
    tier3Innovation: {
      score: tier3Score,
      level: getTierLevel(tier3Score),
      description: isEnglish
        ? 'Critical text synthesis, authorial bias deconstruction, and robust immunity against deceptive distractor interpretations.'
        : 'Demonstrated innovation ability: novel problem solving, trade-off optimization, and resilience against counter-intuitive traps.',
    },
    summary: `UNESCO 3-Tier diagnostic profile: ${getTierLevel(tier1Score)} in Foundation (Tier 1), ${getTierLevel(tier2Score)} in Application (Tier 2), and ${getTierLevel(tier3Score)} in Innovation (Tier 3).`,
  };

  // IEEE Model of Domain Learning (MDL - Vance et al. 2016)
  let mdlStage: 'Acclimation' | 'Competency' | 'Proficiency' | 'Mastery' = 'Acclimation';
  let domainKnowledgeDepth = isEnglish 
    ? 'Fragmented textual schema; reliant on literal recall and keyword matching.'
    : 'Fragmented and superficial; reliant on surface problem cues and textbook formulas.';
  let strategicProcessing = isEnglish
    ? 'General scanning and surface interpretation; susceptible to misdirection from superficial vocabulary matches.'
    : 'General heuristics and trial-and-error; vulnerable to distractor misconceptions.';
  let personalInterestSustenance = 'Situational interest triggered by novelty; requires structured guidance to persist through non-routine impasses.';

  if (avgTheta >= 1.4) {
    mdlStage = 'Mastery';
    domainKnowledgeDepth = isEnglish 
      ? 'Deep, cohesive literary and rhetorical schema with effortless cross-genre synthesis.'
      : 'Deep, cohesive theoretical schema with effortless first-principles derivation across all 5 STEM domains.';
    strategicProcessing = 'Highly autonomous metacognition, invariant recognition, and self-correcting error autopsies.';
    personalInterestSustenance = 'Deep intrinsic domain commitment aligned with sustained research and analytical inquiry.';
  } else if (avgTheta >= 0.7) {
    mdlStage = 'Proficiency';
    domainKnowledgeDepth = isEnglish
      ? 'Broad textual framework capable of handling cross-disciplinary non-fiction synthesis.'
      : 'Broad, well-integrated conceptual framework capable of handling cross-disciplinary STEM synthesis.';
    strategicProcessing = 'Domain-specific analytical strategies with systematic boundary condition and evidence checking.';
    personalInterestSustenance = 'Strong individual interest and self-efficacy when tackling non-routine challenges.';
  } else if (avgTheta >= 0.0) {
    mdlStage = 'Competency';
    domainKnowledgeDepth = isEnglish
      ? 'Structured comprehension with procedural fluency in standard multi-paragraph texts.'
      : 'Structured foundational knowledge with procedural fluency in standard multi-step scenarios.';
    strategicProcessing = 'Principled problem solving on familiar archetypes, with emerging evidence verification.';
    personalInterestSustenance = 'Developing self-confidence; benefits from guided sprints and deliberate practice on non-routine items.';
  }

  const ieeeMdlStage = {
    stage: mdlStage,
    domainKnowledgeDepth,
    strategicProcessing,
    personalInterestSustenance,
    progressionSummary: `Class ${classLevel} candidate is situated in the IEEE MDL '${mdlStage}' progression tier. Progression toward next tier requires deliberate practice on non-routine multi-variable transfer rather than formula drill.`,
  };

  // International Benchmarking Comparisons
  let nsfComparisons;
  if (isEnglish) {
    const candidatePisa = Math.max(200, Math.min(800, Math.round(500 + avgTheta * 100)));
    const oecdPisaReading = 480;
    const sgPisaReading = 543;
    const deltaVsOecd = candidatePisa - oecdPisaReading;
    nsfComparisons = {
      candidateEquivalentTimss: candidatePisa,
      singaporeBenchmarkScore: sgPisaReading,
      eastAsiaTopTierScore: 535,
      oecdTopDecileScore: 520,
      usNationalAverageScore: oecdPisaReading,
      nationalPercentileDelta: `${deltaVsOecd >= 0 ? '+' : ''}${deltaVsOecd} pts vs OECD PISA Reading Literacy Average (480)`,
      nsb2026Insight: `According to OECD PISA 2022 international reading literacy findings, Singapore leads global reading performance (543), while the OECD median is 480. The candidate's equivalent score of ${candidatePisa} places them ${deltaVsOecd >= 0 ? `${deltaVsOecd} points ahead of` : `${Math.abs(deltaVsOecd)} points behind`} the OECD median and ${sgPisaReading - candidatePisa} points adrift of the world-leading Singapore benchmark.`,
    };
  } else {
    const candidateTimss = Math.max(200, Math.min(800, Math.round(500 + avgTheta * 100)));
    const usTimssMath = 488;
    const sgTimss = 605;
    const deltaVsUs = candidateTimss - usTimssMath;
    nsfComparisons = {
      candidateEquivalentTimss: candidateTimss,
      singaporeBenchmarkScore: sgTimss,
      eastAsiaTopTierScore: 585,
      oecdTopDecileScore: 525,
      usNationalAverageScore: usTimssMath,
      nationalPercentileDelta: `${deltaVsUs >= 0 ? '+' : ''}${deltaVsUs} pts vs US National 8th Grade Math Median (488)`,
      nsb2026Insight: `According to the National Science Board (NSB-2026-1), Singapore leads global math/science performance (605/606), while the US post-pandemic math score suffered a historic 27-point decline to 488. The candidate's equivalent score of ${candidateTimss} places them ${deltaVsUs >= 0 ? `${deltaVsUs} points ahead of` : `${Math.abs(deltaVsUs)} points behind`} the US national average and ${sgTimss - candidateTimss} points adrift of the world-leading Singapore benchmark.`,
    };
  }

  // 4 Frontier Pillars
  const p1 = Math.max(5, Math.min(99, Math.round(50 + avgTheta * 20)));
  const p2 = Math.max(5, Math.min(99, Math.round(50 + (avgTheta + 0.1) * 20)));
  const p3 = Math.max(5, Math.min(99, Math.round(50 + (avgTheta - 0.1) * 20)));
  const p4 = Math.max(5, Math.min(99, Math.round(50 + avgTheta * 20)));

  const getPillarTier = (idx: number) => (idx >= 75 ? 'Frontier Ready' : idx >= 50 ? 'Developing Competency' : 'Emerging Foundation');

  const frontierPillars = {
    aiDataLiteracy: {
      index: p1,
      tier: getPillarTier(p1),
      details: isEnglish ? 'Textual semantics, argument decomposition, and information synthesis.' : 'Algorithmic reasoning, probability models, pattern recognition, and data-driven inference.',
    },
    roboticsAutomation: {
      index: p2,
      tier: getPillarTier(p2),
      details: isEnglish ? 'Information scanning and dense textual retrieval.' : 'Mechanical kinematics, sensor feedback control loops, actuator dynamics, and state machines.',
    },
    xrSimulation: {
      index: p3,
      tier: getPillarTier(p3),
      details: isEnglish ? 'Contextual inference and spatial narrative comprehension.' : 'Spatial geometry, virtual stress testing, dynamic physical modeling, and wave simulations.',
    },
    smartSustainableSystems: {
      index: p4,
      tier: getPillarTier(p4),
      details: isEnglish ? 'Rhetorical evaluation and author perspective analysis.' : 'Clean energy grids, ecological nutrient cycles, closed-loop resource management, and climate resilience.',
    },
  };

  return {
    subject,
    aggregateScaledScore,
    globalPercentile,
    regionalPercentiles,
    competencyBreakdown: breakdown,
    radarData,
    cognitiveArchetype,
    realityCheck,
    studentChallengeSprint,
    parentActionBlueprint,
    indiaNationalPercentile,
    boardGradeBand,
    parakhHolisticPillars,
    indianCompetitiveFoundation,
    unescoIndicators,
    ieeeMdlStage,
    nsfComparisons,
    frontierPillars,
  };
}

function getStudentSprint(classLevel: number, _archetype: string, isEnglish: boolean = false) {
  if (isEnglish) {
    return {
      week1: {
        title: 'Active Margin Annotation & Premise Tracking',
        focus: 'Distinguishing Thesis from Supporting Examples',
        mission: 'Read 3 long-form editorial essays. In each paragraph, underline the core premise and mark the supporting evidence. Never passively skim.',
      },
      week2: {
        title: 'Evidence Mining & Contextual Vocabulary',
        focus: 'Locating Information Under Time Pressure',
        mission: 'Practice 5 unseen dense informational texts. Pinpoint the exact sentence proving each answer choice without relying on memory.',
      },
      week3: {
        title: 'Synthesis Across Conflicting Viewpoints',
        focus: 'Comparative Analysis & Subtext',
        mission: 'Compare two editorial articles with opposing stances on the same issue. Create a two-column synthesis table highlighting underlying assumptions.',
      },
      week4: {
        title: 'Error Autopsy & Distractor Deconstruction',
        focus: 'Metacognitive Error Analysis',
        mission: 'Review all incorrect answers on your reading diagnostic. Analyze why the distractor was tempting and what flawed assumption led to selecting it.',
      },
    };
  }

  if (classLevel <= 5) {
    return {
      week1: {
        title: 'Master the Singapore Bar Model',
        focus: 'Visualizing Word Problems Without Variables',
        mission: 'Solve 10 multi-step comparison and before-and-after word problems using physical or drawn Singapore bar models. Never guess.',
      },
      week2: {
        title: 'Variable Isolation Detective',
        focus: 'Scientific Control Testing',
        mission: 'Explore the PhET "Balancing Act" and "Pendulum" simulations. Keep one variable strictly constant while varying another and predict the outcome.',
      },
      week3: {
        title: 'Bebras Algorithmic Riddles',
        focus: 'Pattern Recognition and Sorting',
        mission: 'Complete 5 elementary Bebras computational puzzle tasks. Trace the exact step-by-step path a robot would take without skipping steps.',
      },
      week4: {
        title: 'The "What-If" Challenge',
        focus: 'Systems Causality',
        mission: 'Pick any everyday device (toaster, bicycle, clock). Diagram what happens when one component breaks or doubles in speed.',
      },
    };
  } else if (classLevel <= 8) {
    return {
      week1: {
        title: 'Invariance & Parity Proofs',
        focus: 'Mathematical Reasoning Beyond Formulas',
        mission: 'Tackle 5 AMC 8 / SASMO problems using parity (odd/even), invariants, and extreme cases instead of guessing or brute-force arithmetic.',
      },
      week2: {
        title: 'Computational State Machines',
        focus: 'Algorithmic Tracing',
        mission: 'Write pseudo-code for binary search and recursive division of intervals. Prove why binary search eliminates half the possibilities each step.',
      },
      week3: {
        title: 'PhET Circuit & Energy Dynamics',
        focus: 'Non-linear feedback & Ohm/Kirchhoff laws',
        mission: 'Build parallel and series circuits with variable internal resistance. Explain why real batteries drop terminal voltage under heavy current load.',
      },
      week4: {
        title: 'Error Autopsy Journal',
        focus: 'Cognitive Metacognition',
        mission: 'Revisit all 4 questions you missed on this benchmark. Write a half-page explanation of why the trap answer seemed so seductive and what fundamental rule it violated.',
      },
    };
  } else {
    // Classes 9-12
    return {
      week1: {
        title: 'Dimensional Analysis & Limiting Cases',
        focus: 'Physics & Engineering Heuristics',
        mission: 'For every equation in physics or chemistry, verify units and evaluate limits as m->0, m->infinity, and t->infinity before performing algebraic work.',
      },
      week2: {
        title: 'Dynamic Programming & State Space Pruning',
        focus: 'USACO / Olympiad Computer Science',
        mission: 'Implement dynamic programming for the knapsack and longest path problems. Formulate the state transition equation and time complexity bound.',
      },
      week3: {
        title: 'Counter-Intuitive Systems Equilibrium',
        focus: 'Negative vs Positive Feedback Loops',
        mission: 'Analyze Le Chatelier equilibrium shifts and enzyme kinetics (Michaelis-Menten). Calculate how system shifts buffer against external shocks.',
      },
      week4: {
        title: 'First-Principles Proofs without Formula Sheets',
        focus: 'Deep Mathematical Rigor',
        mission: 'Derive the quadratic formula, the lens equation, and gravitational potential energy from scratch. Do not rely on memorized short-cuts.',
      },
    };
  }
}

function getParentBlueprint(classLevel: number, _breakdown: any, isEnglish: boolean = false) {
  if (isEnglish) {
    return {
      immediateHomeRoutines: [
        'Enforce Active Summaries: Ask your child to summarize any article they read in exactly 3 sentences: Premise, Key Evidence, and Final Conclusion.',
        'Adopt the Distractor Deconstruction Rule: After multiple-choice reading, ask: "Explain why each of the wrong choices was deliberately crafted to trap readers."',
        'Maintain a Non-Routine Vocabulary Journal: Keep a weekly notebook of Tier-2 and Tier-3 academic vocabulary encountered in serious reading.',
        'Expose to Authentic Long-Form Journalism: Subscribe to or read age-appropriate publications (e.g. The Economist, Smithsonian, BBC, National Geographic) rather than simplified textbook excerpts.',
      ],
      recommendedCurricula: [
        { name: 'PISA Reading Literacy Framework', urlDescription: 'oecd.org/pisa/reading', purpose: 'Gold-standard international benchmark for reading comprehension and evaluation.' },
        { name: 'Cambridge Lower Secondary & O-Level English', urlDescription: 'cambridgeinternational.org', purpose: 'Rigorous English comprehension, synthesis, and discursive analysis.' },
        { name: 'ReadTheory / Lexile Framework', urlDescription: 'readtheory.org', purpose: 'Adaptive reading comprehension with nuanced distractor rationale.' },
        { name: 'The Great Books Foundation', urlDescription: 'greatbooks.org', purpose: 'Shared Inquiry method for critical textual analysis and discussion.' },
      ],
      quarterlyMilestones: [
        'Month 1: Diagnostic Clean-up — Remediate textual comprehension and vocabulary vulnerabilities identified in this report.',
        'Month 2: Fluency & Synthesis — Read 10 challenging non-fiction articles and complete annotated comparative tables.',
        'Month 3: Timed Benchmark Re-assessment — Retake the WARP Adaptive Assessment to measure growth in critical reading percentiles.',
      ],
    };
  }

  const isElementary = classLevel <= 5;
  const isMiddle = classLevel >= 6 && classLevel <= 8;

  const immediateHomeRoutines = [
    'Enforce a "No Calculator" rule for non-routine homework (mental estimation and fractional intuition are crucial for Class 3-8 international parity).',
    'Adopt the 2-Minute Explanation Rule: Whenever your child gets an answer right, ask: "Explain to me why the other three choices are mathematically impossible."',
    'Maintain an Error Journal: Have the student document the root cause of every mistake (Conceptual Gap vs Calculation Slip vs Misread Constraint).',
    'Expose to Authentic Timed Contests: Register for SASMO, AMC 8/10, or Bebras to calibrate against authentic international cohorts rather than local school averages.',
  ];

  const recommendedCurricula = isElementary
    ? [
        {
          name: 'Singapore Math (Marshall Cavendish / Dimensions Math)',
          urlDescription: 'Concrete-Pictorial-Abstract bar modeling curriculum',
          purpose: 'Trains the mind to visualize complex relationships before introducing abstract algebra.',
        },
        {
          name: 'Bebras International Computational Challenge',
          urlDescription: 'Interactive computational thinking puzzles',
          purpose: 'Develops logic, recursion, and pattern abstraction without requiring coding syntax.',
        },
        {
          name: 'PhET Interactive Simulations (University of Colorado)',
          urlDescription: 'Interactive science and mathematics simulations',
          purpose: 'Allows students to physically experiment with variables, balance, and forces.',
        },
        {
          name: 'Kangaroo Math (Kangourou sans Frontières)',
          urlDescription: 'European puzzle-based mathematics competition',
          purpose: 'Encourages joyful lateral thinking and geometric spatial visualization.',
        },
      ]
    : isMiddle
    ? [
        {
          name: 'Art of Problem Solving (AoPS) - Introduction Series',
          urlDescription: 'Prealgebra, Intro to Counting & Probability, Intro to Geometry',
          purpose: 'The benchmark gold-standard for USA AMC 8/10 and international competition preparation.',
        },
        {
          name: 'SASMO (Singapore and Asian Schools Math Olympiad) Past Papers',
          urlDescription: 'Curated international Olympiad papers with detailed heuristic solutions',
          purpose: 'Bridges school mathematics with international problem-solving rigor.',
        },
        {
          name: 'Project Euler (Problems 1–50)',
          urlDescription: 'Mathematical and computational coding challenges',
          purpose: 'Integrates mathematical number theory with computational algorithmic efficiency.',
        },
        {
          name: 'PhET Physics & Circuit Simulations',
          urlDescription: 'Simulations of Faraday law, capacitors, wave interference',
          purpose: 'Eliminates physics misconceptions by visual experimentation with non-observable quantities.',
        },
      ]
    : [
        {
          name: 'AoPS Volume 1 & Volume 2: The Basics and Beyond',
          urlDescription: 'Comprehensive competitive problem solving for AMC 10/12, AIME, and IOQM',
          purpose: 'Builds foundational proof mastery and multi-topic mathematical synthesis.',
        },
        {
          name: 'USACO Training Gateway (USA Computing Olympiad)',
          urlDescription: 'Algorithmic computer science training from Bronze to Gold',
          purpose: 'Develops asymptotic runtime analysis, graph algorithms, and dynamic programming.',
        },
        {
          name: 'Irodov / Krotov / Feynman Lectures on Physics',
          urlDescription: 'First-principles physical problem solving',
          purpose: 'Destroys formula-plugging habits and instills profound intuition for physical laws.',
        },
        {
          name: 'Brilliant.org Applied STEM Tracks',
          urlDescription: 'Courses in Quantum Computing, Neural Networks, and Systems Engineering',
          purpose: 'Bridges theoretical high school science with cutting-edge 21st-century applied engineering.',
        },
      ];

  const quarterlyMilestones = [
    'Month 1: Diagnostic Clean-up — Isolate and remediate top 2 conceptual vulnerabilities identified in this report.',
    'Month 2: Fluency & Heuristic Building — Complete 30 non-routine international problems (SASMO / AMC / Bebras) under un-timed exploratory conditions.',
    'Month 3: Timed Benchmark Re-assessment — Retake the WARP Adaptive Assessment to measure delta in latent ability theta and international percentile rank.',
  ];

  const indianRecommendedCurricula = isEnglish
    ? [
        {
          name: 'NCERT English Honeydew & It So Happened (Class 8)',
          category: 'Core Curriculum & Literature Comprehension',
          urlDescription: 'ncert.nic.in / Textual analysis & themes',
          purpose: 'Foundational reading comprehension, vocabulary in context, and answering with textual evidence.',
        },
        {
          name: 'Wren & Martin High School English Grammar & Composition',
          category: 'Syntactic & Grammar Rigor',
          urlDescription: 'Classical grammar rules and sentence synthesis',
          purpose: 'Deconstructs sentence structures, active/passive nuances, and precise clause relationships.',
        },
        {
          name: 'The Hindu Young World / Editorial Analysis',
          category: 'Contemporary Non-Fiction & Opinion Pieces',
          urlDescription: 'Daily analytical reading and vocabulary expansion',
          purpose: 'Exposes student to diverse editorial viewpoints, distinguishing opinion from factual reporting.',
        },
        {
          name: 'MTG International English Olympiad (IEO) Workbooks',
          category: 'Competitive Analytical Reading',
          urlDescription: 'mtg.in / SOF IEO Achievers section',
          purpose: 'Timed passage inference, idioms, and multi-paragraph coherence tests.',
        },
      ]
    : [
        {
          name: 'NCERT Exemplar Problems (Class 8 Mathematics & Science)',
          category: 'Government Standard HOTS Benchmark',
          urlDescription: 'ncert.nic.in / Exemplar Problems Portal',
          purpose: 'Contains authentic Higher Order Thinking Skills (HOTS) questions that bridge school syllabus with competitive exam logic.',
        },
        {
          name: 'RD Sharma / RS Aggarwal Mathematics (Class 8)',
          category: 'Step-by-Step Foundational Rigor',
          urlDescription: 'Standard Indian reference books for systematic practice',
          purpose: 'Builds procedural calculation stamina across linear equations, rational numbers, quadrilaterals, and mensuration.',
        },
        {
          name: 'Foundation Science (Lakhmir Singh & Manjit Kaur / HC Verma Foundation)',
          category: 'Concept-First Science Clarity',
          urlDescription: 'Physics, Chemistry & Biology with real-world applications',
          purpose: 'Eliminates formula memorization by grounding concepts in observable experiments (force, friction, pressure, sound, light).',
        },
        {
          name: 'MTG National Science & Math Olympiad (SOF NSO & IMO) Workbooks',
          category: 'Competitive Olympiad Calibration',
          urlDescription: 'mtg.in / Past 5-year papers & Achievers Section',
          purpose: 'Trains the student in eliminating distractors and solving multi-concept questions under timed conditions.',
        },
        {
          name: 'Khan Academy India (CBSE Class 8)',
          category: 'Self-Paced Mastery & Simulations',
          urlDescription: 'khanacademy.org / Free CBSE-mapped practice',
          purpose: 'Provides instant mastery feedback and targeted video explanations when a child is stuck on a specific chapter.',
        },
      ];

  const indianHomeRoutines = [
    '45-Minute Daily Evening Study Session: 15 mins reviewing core theory from NCERT, 20 mins solving 3–5 challenging non-routine problems, and 10 mins self-correcting mistakes.',
    'The "Why" Rule (Overcoming Ratta): When reviewing your child\'s homework, do not just check if the answer is right. Ask: "Can you explain the formula in your own words, and why this method works?"',
    'Weekly Error Autopsy (Sunday 30 mins): Have your child maintain a dedicated "Mistake Notebook". Categorize each error: (1) Calculation slip, (2) Misread question, or (3) Conceptual gap.',
    'Timed No-Calculator Drills (Twice Weekly): Indian board and competitive exams require rapid mental arithmetic and algebraic manipulation without calculator reliance.',
  ];

  const ptmDiscussionGuide = [
    'Question 1: "Is my child applying first principles to unfamiliar questions, or are they relying primarily on memorized textbook exercise steps?"',
    'Question 2: "How does my child perform on Higher Order Thinking Skills (HOTS) and application questions compared to straightforward recall questions?"',
    'Question 3: "Are marks lost due to calculation rush or misreading the question, and what strategies does the school suggest to build exam calmness?"',
    'Question 4: "Does the school offer Olympiad / competitive problem-solving clubs or supplementary challenge sheets for students ready for extra rigor?"',
  ];

  const streamOrientation = isEnglish
    ? {
        topStream: 'Law, Humanities, Economics & Communications Track',
        description: 'Strong potential in legal reasoning, public policy, civil services (UPSC), and corporate communications.',
        subjectFocus: 'Focus on argumentative writing, comparative politics, and economics with applied statistics.',
      }
    : {
        topStream: 'Engineering / Computing / Pure Science Track (PCM & CS)',
        description: 'Demonstrates analytical and logical reasoning traits well-suited for engineering disciplines, computer science, and data sciences.',
        subjectFocus: 'Prioritize building deep foundational strength in Algebra, Mechanics, and Algorithmic Logic through Class 8-10.',
      };

  return {
    immediateHomeRoutines,
    recommendedCurricula,
    quarterlyMilestones,
    indianHomeRoutines,
    indianRecommendedCurricula,
    ptmDiscussionGuide,
    streamOrientation,
  };
}
