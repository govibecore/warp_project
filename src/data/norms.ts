import { COMPETENCIES, type Competency, type Norm, type Region } from '../domain/types';

export const NORM_VERSION = 'provisional-2026.08' as const;

// Base norms (Global Average)
const globalNorms: Readonly<Record<number, Readonly<Record<Competency, Norm>>>> = {
  3: { scientificInquiry: { mean: 52, standardDeviation: 13 }, engineeringDesign: { mean: 50, standardDeviation: 13 }, computationalThinking: { mean: 49, standardDeviation: 14 }, mathematicalReasoning: { mean: 51, standardDeviation: 13 }, systemsThinking: { mean: 50, standardDeviation: 14 }, locatingInformation: { mean: 50, standardDeviation: 13 }, understanding: { mean: 51, standardDeviation: 13 }, synthesis: { mean: 50, standardDeviation: 13 }, evaluatingReflecting: { mean: 49, standardDeviation: 14 } },
  4: { scientificInquiry: { mean: 53, standardDeviation: 13 }, engineeringDesign: { mean: 51, standardDeviation: 13 }, computationalThinking: { mean: 50, standardDeviation: 13 }, mathematicalReasoning: { mean: 52, standardDeviation: 13 }, systemsThinking: { mean: 51, standardDeviation: 14 }, locatingInformation: { mean: 51, standardDeviation: 13 }, understanding: { mean: 52, standardDeviation: 13 }, synthesis: { mean: 51, standardDeviation: 13 }, evaluatingReflecting: { mean: 50, standardDeviation: 13 } },
  5: { scientificInquiry: { mean: 54, standardDeviation: 13 }, engineeringDesign: { mean: 53, standardDeviation: 13 }, computationalThinking: { mean: 52, standardDeviation: 13 }, mathematicalReasoning: { mean: 53, standardDeviation: 13 }, systemsThinking: { mean: 53, standardDeviation: 13 }, locatingInformation: { mean: 53, standardDeviation: 13 }, understanding: { mean: 54, standardDeviation: 13 }, synthesis: { mean: 53, standardDeviation: 13 }, evaluatingReflecting: { mean: 52, standardDeviation: 13 } },
  6: { scientificInquiry: { mean: 56, standardDeviation: 12 }, engineeringDesign: { mean: 54, standardDeviation: 13 }, computationalThinking: { mean: 54, standardDeviation: 13 }, mathematicalReasoning: { mean: 55, standardDeviation: 13 }, systemsThinking: { mean: 55, standardDeviation: 13 }, locatingInformation: { mean: 55, standardDeviation: 13 }, understanding: { mean: 56, standardDeviation: 12 }, synthesis: { mean: 55, standardDeviation: 13 }, evaluatingReflecting: { mean: 54, standardDeviation: 13 } },
  7: { scientificInquiry: { mean: 57, standardDeviation: 12 }, engineeringDesign: { mean: 56, standardDeviation: 12 }, computationalThinking: { mean: 56, standardDeviation: 13 }, mathematicalReasoning: { mean: 57, standardDeviation: 12 }, systemsThinking: { mean: 58, standardDeviation: 12 }, locatingInformation: { mean: 56, standardDeviation: 12 }, understanding: { mean: 57, standardDeviation: 12 }, synthesis: { mean: 56, standardDeviation: 12 }, evaluatingReflecting: { mean: 56, standardDeviation: 12 } },
  8: { scientificInquiry: { mean: 59, standardDeviation: 12 }, engineeringDesign: { mean: 58, standardDeviation: 12 }, computationalThinking: { mean: 58, standardDeviation: 12 }, mathematicalReasoning: { mean: 59, standardDeviation: 12 }, systemsThinking: { mean: 61, standardDeviation: 12 }, locatingInformation: { mean: 58, standardDeviation: 12 }, understanding: { mean: 59, standardDeviation: 12 }, synthesis: { mean: 58, standardDeviation: 12 }, evaluatingReflecting: { mean: 58, standardDeviation: 12 } },
  9: { scientificInquiry: { mean: 61, standardDeviation: 12 }, engineeringDesign: { mean: 60, standardDeviation: 12 }, computationalThinking: { mean: 60, standardDeviation: 12 }, mathematicalReasoning: { mean: 61, standardDeviation: 12 }, systemsThinking: { mean: 62, standardDeviation: 12 }, locatingInformation: { mean: 60, standardDeviation: 12 }, understanding: { mean: 61, standardDeviation: 12 }, synthesis: { mean: 60, standardDeviation: 12 }, evaluatingReflecting: { mean: 60, standardDeviation: 12 } },
  10: { scientificInquiry: { mean: 63, standardDeviation: 12 }, engineeringDesign: { mean: 62, standardDeviation: 12 }, computationalThinking: { mean: 62, standardDeviation: 12 }, mathematicalReasoning: { mean: 63, standardDeviation: 12 }, systemsThinking: { mean: 64, standardDeviation: 12 }, locatingInformation: { mean: 62, standardDeviation: 12 }, understanding: { mean: 63, standardDeviation: 12 }, synthesis: { mean: 62, standardDeviation: 12 }, evaluatingReflecting: { mean: 62, standardDeviation: 12 } },
  11: { scientificInquiry: { mean: 65, standardDeviation: 11 }, engineeringDesign: { mean: 64, standardDeviation: 12 }, computationalThinking: { mean: 64, standardDeviation: 12 }, mathematicalReasoning: { mean: 65, standardDeviation: 11 }, systemsThinking: { mean: 66, standardDeviation: 11 }, locatingInformation: { mean: 64, standardDeviation: 12 }, understanding: { mean: 65, standardDeviation: 11 }, synthesis: { mean: 64, standardDeviation: 12 }, evaluatingReflecting: { mean: 64, standardDeviation: 11 } },
  12: { scientificInquiry: { mean: 67, standardDeviation: 11 }, engineeringDesign: { mean: 66, standardDeviation: 11 }, computationalThinking: { mean: 66, standardDeviation: 11 }, mathematicalReasoning: { mean: 67, standardDeviation: 11 }, systemsThinking: { mean: 68, standardDeviation: 11 }, locatingInformation: { mean: 66, standardDeviation: 11 }, understanding: { mean: 67, standardDeviation: 11 }, synthesis: { mean: 66, standardDeviation: 11 }, evaluatingReflecting: { mean: 66, standardDeviation: 11 } },
};

// Regional adjustment offsets relative to Global Average
const regionOffsets: Readonly<Record<Region, number>> = {
  Global: 0,
  Singapore: +8, // Strong emphasis on student-centered integrative STEM
  China: +5,     // Standardized robotics & 3D design from early years
  USA: +3,       // Broad project-based learning and maker spaces
  Europe: +2,    // Balanced systemic approach
  India: 0       // Baseline comparison point for this MVP analysis
};

export function getNorm(classLevel: number, competency: Competency, region: Region = 'Global'): Norm {
  const baseNorm = globalNorms[classLevel]?.[competency];
  if (!baseNorm || !COMPETENCIES.includes(competency)) {
    throw new Error(`No provisional norm is available for class ${classLevel} and ${competency}.`);
  }
  
  // Adjust the mean based on the region offset, keeping standard deviation consistent.
  return {
    mean: baseNorm.mean + regionOffsets[region],
    standardDeviation: baseNorm.standardDeviation
  };
}
