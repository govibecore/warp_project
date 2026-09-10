import { getNorm, NORM_VERSION } from '../data/norms';
import { COMPETENCIES, type Competency, type CompetencyProjection, type ItemResponse, type Norm, type ResultSnapshot } from './types';

export interface Projection {
  zScore: number;
  score: number;
}

export function projectScore(rawPercent: number, norm: Norm): Projection {
  const zScore = (rawPercent - norm.mean) / norm.standardDeviation;
  return { zScore, score: clamp(Math.round(480 + 100 * zScore), 100, 900) };
}

export function calculateResult(responses: readonly ItemResponse[], classLevel: number, completedAt: string): ResultSnapshot {
  const totals = Object.fromEntries(COMPETENCIES.map((competency) => [competency, { earned: 0, available: 0 }])) as Record<Competency, { earned: number; available: number }>;

  for (const response of responses) {
    for (const contribution of response.evidence) {
      totals[contribution.competency].earned += contribution.earnedWeight;
      totals[contribution.competency].available += contribution.availableWeight;
    }
  }

  const competencies = {} as Record<Competency, CompetencyProjection>;
  for (const competency of COMPETENCIES) {
    const total = totals[competency];
    if (total.available <= 0) {
      throw new Error(`Cannot create a projected benchmark: ${competency} has no evidence.`);
    }
    const rawPercent = (100 * total.earned) / total.available;
    const norm = getNorm(classLevel, competency);
    competencies[competency] = { rawPercent, norm, ...projectScore(rawPercent, norm) };
  }

  const overallScore = Math.round(COMPETENCIES.reduce((sum, competency) => sum + competencies[competency].score, 0) / COMPETENCIES.length);
  const regions: import('./types').Region[] = ['India', 'China', 'USA', 'Singapore', 'Europe', 'Global'];
  const regionalPercentiles = {} as Record<import('./types').Region, number>;
  
  for (const region of regions) {
    // To simulate comparison, we recalculate a simulated overall Z-score against that region's norms.
    // For MVP, we'll approximate the region's overall mean by averaging the region's norm means.
    const regionNorms = COMPETENCIES.map(c => getNorm(classLevel, c, region));
    const avgRegionMean = regionNorms.reduce((a, b) => a + b.mean, 0) / regionNorms.length;
    const avgRegionStdDev = regionNorms.reduce((a, b) => a + b.standardDeviation, 0) / regionNorms.length;
    
    // We compare the student's raw percent average to the region's raw percent average
    const studentRawAvg = COMPETENCIES.reduce((sum, c) => sum + competencies[c].rawPercent, 0) / COMPETENCIES.length;
    const regionZScore = (studentRawAvg - avgRegionMean) / avgRegionStdDev;
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
