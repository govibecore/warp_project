import { supabase } from "./supabase";

export interface CohortNorms {
  india_mean_score: number;
  global_mean_score: number;
  singapore_mean_score: number;
  usa_mean_score: number;
  sample_source: string;
}

/** Convert IRT theta to WARP 900-point scaled score. theta 0 -> 450, ±1 SD -> ±150 pts */
function thetaToScaled(theta: number): number {
  return Math.round(Math.max(50, Math.min(900, 450 + theta * 150)));
}

/** Fetch per-region cohort norms for a given class level and difficulty. */
export async function fetchCohortNorms(
  classLevel: number,
  difficulty: string,
): Promise<CohortNorms> {
  const normDifficulty = difficulty.toLowerCase();

  const { data, error } = await supabase
    .from("norms")
    .select("region, mean, std_dev, source, difficulty")
    .eq("class_level", classLevel)
    .in("region", ["india", "global", "singapore", "usa"]);

  if (error || !data || data.length === 0) {
    return {
      india_mean_score: 420,
      global_mean_score: 450,
      singapore_mean_score: 620,
      usa_mean_score: 490,
      sample_source: "pisa_2022_anchor",
    };
  }

  const pick = (region: string) => {
    const exact = data.find((r: any) => r.region === region && r.difficulty === normDifficulty);
    const standard = data.find((r: any) => r.region === region && r.difficulty === "standard");
    return exact ?? standard ?? null;
  };

  const india = pick("india");
  const global_ = pick("global");
  const singapore = pick("singapore");
  const usa = pick("usa");

  return {
    india_mean_score: india ? thetaToScaled(india.mean) : 420,
    global_mean_score: global_ ? thetaToScaled(global_.mean) : 450,
    singapore_mean_score: singapore ? thetaToScaled(singapore.mean) : 620,
    usa_mean_score: usa ? thetaToScaled(usa.mean) : 490,
    sample_source: india?.source ?? global_?.source ?? "pisa_2022_anchor",
  };
}
