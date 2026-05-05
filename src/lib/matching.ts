import { supabase } from "@/integrations/supabase/client";

export type Match = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  // skills they offer that match what I want
  offers: { id: string; name: string; color: string | null }[];
  // skills they want that match what I know
  wants: { id: string; name: string; color: string | null }[];
  score: number;
};

/**
 * Find users where:
 *   their "knows" intersects my "wants"  AND
 *   their "wants" intersects my "knows"
 */
export async function findMatches({
  knowSkillIds,
  wantSkillIds,
  excludeUserId,
}: {
  knowSkillIds: string[];
  wantSkillIds: string[];
  excludeUserId?: string;
}): Promise<Match[]> {
  const knows = uniqueUuidList(knowSkillIds);
  const wants = uniqueUuidList(wantSkillIds);

  if (!knows.length || !wants.length) return [];

  // Pull every user_skill row that is relevant in either direction
  const { data, error } = await supabase
    .from("user_skills")
    .select(
      "user_id, kind, skill:skills(id,name,color), profile:profiles(id,full_name,avatar_url,headline,bio)",
    )
    .or(
      `and(kind.eq.knows,skill_id.in.(${wants.join(",")})),and(kind.eq.wants,skill_id.in.(${knows.join(",")}))`,
    );

  if (error) {
    console.error("matching query failed", error);
    return [];
  }

  type Row = {
    user_id: string;
    kind: "knows" | "wants";
    skill: { id: string; name: string; color: string | null } | null;
    profile: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      headline: string | null;
      bio: string | null;
    } | null;
  };

  const map = new Map<string, Match>();
  for (const row of (data ?? []) as Row[]) {
    if (!row.skill || !row.profile) continue;
    if (excludeUserId && row.user_id === excludeUserId) continue;
    let m = map.get(row.user_id);
    if (!m) {
      m = {
        user_id: row.user_id,
        full_name: row.profile.full_name,
        avatar_url: row.profile.avatar_url,
        headline: row.profile.headline,
        bio: row.profile.bio,
        offers: [],
        wants: [],
        score: 0,
      };
      map.set(row.user_id, m);
    }
    if (row.kind === "knows" && !m.offers.find((s) => s.id === row.skill!.id))
      m.offers.push(row.skill);
    if (row.kind === "wants" && !m.wants.find((s) => s.id === row.skill!.id))
      m.wants.push(row.skill);
  }

  // Two-way matches only
  return Array.from(map.values())
    .filter((m) => m.offers.length > 0 && m.wants.length > 0)
    .map((m) => ({ ...m, score: m.offers.length + m.wants.length }))
    .sort((a, b) => b.score - a.score);
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function uniqueUuidList(ids: string[]) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return Array.from(new Set(ids.filter((id) => uuid.test(id))));
}
