import { supabase } from "./supabase";

export interface Resource {
  key: string;
  title: string;
  url: string | null;
  category: string;
  competency: string | null;
  difficulty: string | null;
}

/** Fetch curated resources by key array stored in the reports row. */
export async function fetchResources(keys: string[]): Promise<Resource[]> {
  if (!keys || keys.length === 0) return [];

  const { data, error } = await supabase
    .from("resources")
    .select("key, title, url, category, competency, difficulty")
    .in("key", keys)
    .eq("verified", true)
    .limit(3);

  if (error || !data) return [];
  return data as Resource[];
}

/** Fetch top 3 resources for a competency + difficulty when no keys are stored. */
export async function fetchResourcesByCompetency(
  competency: string,
  difficulty: string,
): Promise<Resource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("key, title, url, category, competency, difficulty")
    .eq("competency", competency)
    .eq("verified", true)
    .limit(3);

  if (error || !data || data.length === 0) {
    // Fallback: fetch any 3 verified resources
    const { data: fallback } = await supabase
      .from("resources")
      .select("key, title, url, category, competency, difficulty")
      .eq("verified", true)
      .limit(3);
    return (fallback as Resource[]) ?? [];
  }
  return data as Resource[];
}
