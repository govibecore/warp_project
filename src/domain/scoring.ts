import { getNorm, NORM_VERSION } from '../data/norms';
import { COMPETENCIES, type Competency, type CompetencyProjection, type ItemResponse, type Norm, type ResultSnapshot } from './types';

export interface Projection {
  zScore: number;
  score: number;
}

export function projectScore(rawPercent: number, norm: Norm): Projection {
  const zScore = (rawPercent - norm.mean) / norm.standardDeviation;
  return { zScore, score: clamp(Math.round(500 + 133.33 * zScore), 100, 900) };
}

export function calculateResult(responses: readonly ItemResponse[], classLevel: number, completedAt: string): ResultSnapshot {
  const totals = Object.fromEntries(COMPETENCIES.map((competency) => [competency, { earned: 0, available: 0 }])) as Record<Competency, { earned: number; available: number }>;

  for (const response of responses) {
    for (const contribution of response.evidence) {
      if (totals[contribution.competency]) {
        totals[contribution.competency].earned += contribution.earnedWeight;
        totals[contribution.competency].available += contribution.availableWeight;
      }
    }
  }

  const activeCompetencies = COMPETENCIES.filter((competency) => totals[competency].available > 0);
  const hasData = activeCompetencies.length > 0;
  const targetCompetencies = hasData ? activeCompetencies : COMPETENCIES;

  const competencies = {} as Record<Competency, CompetencyProjection>;
  for (const competency of targetCompetencies) {
    const total = totals[competency];
    const rawPercent = total.available > 0 ? (100 * total.earned) / total.available : 0;
    const norm = getNorm(classLevel, competency);
    competencies[competency] = total.available > 0
      ? { rawPercent, norm, ...projectScore(rawPercent, norm) }
      : { rawPercent: 0, norm, zScore: 0, score: 0 };
  }

  // Populate any unassessed competencies with 0 score (no artificial 500 padding)
  for (const competency of COMPETENCIES) {
    if (!competencies[competency]) {
      const norm = getNorm(classLevel, competency);
      competencies[competency] = { rawPercent: 0, norm, zScore: 0, score: 0 };
    }
  }

  let sumScores = 0;
  if (hasData) {
    for (const c of activeCompetencies) {
      sumScores += competencies[c as Competency].score;
    }
  }
  const overallScore = hasData ? Math.round(sumScores / activeCompetencies.length) : 0;

  const regions: import('./types').Region[] = ['India', 'China', 'USA', 'Singapore', 'Europe', 'Global'];
  const regionalPercentiles = {} as Record<import('./types').Region, number>;
  
  for (const region of regions) {
    if (!hasData) {
      regionalPercentiles[region] = 0;
      continue;
    }
    // Recalculate overall Z-score against that region's norms for active subject competencies
    const regionNorms = activeCompetencies.map(c => getNorm(classLevel, c as Competency, region));
    let meanSum = 0;
    let stdDevSum = 0;
    for (const n of regionNorms) {
      meanSum += n.mean;
      stdDevSum += n.standardDeviation;
    }
    const avgRegionMean = meanSum / regionNorms.length;
    const avgRegionStdDev = stdDevSum / regionNorms.length;
    
    let rawSum = 0;
    for (const c of activeCompetencies) {
      rawSum += competencies[c as Competency].rawPercent;
    }
    const studentRawAvg = rawSum / activeCompetencies.length;
    const regionZScore = (studentRawAvg - avgRegionMean) / (avgRegionStdDev || 1);
    regionalPercentiles[region] = clamp(Math.round(normalCdf(regionZScore) * 100), 1, 99);
  }

  return Object.freeze({
    assessmentVersion: 1,
    completedAt,
    classLevel,
    normVersion: NORM_VERSION,
    responses: Object.freeze([...responses]),
    competencies: Object.freeze(competencies),
    overallScore,
    regionalPercentiles: Object.freeze(regionalPercentiles),
  });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalCdf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
  return 0.5 * (1 + sign * erf);
}
