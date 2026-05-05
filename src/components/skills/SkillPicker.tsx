import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Skill = { id: string; name: string; slug: string; color: string | null };

export const fallbackSkills: Skill[] = [
  { id: "react", name: "React", slug: "react", color: "#38bdf8" },
  { id: "nextjs", name: "Next.js", slug: "nextjs", color: "#e2e8f0" },
  { id: "typescript", name: "TypeScript", slug: "typescript", color: "#3b82f6" },
  { id: "javascript", name: "JavaScript", slug: "javascript", color: "#facc15" },
  { id: "nodejs", name: "Node.js", slug: "nodejs", color: "#84cc16" },
  { id: "python", name: "Python", slug: "python", color: "#facc15" },
  { id: "go", name: "Go", slug: "go", color: "#22d3ee" },
  { id: "rust", name: "Rust", slug: "rust", color: "#f97316" },
  { id: "postgresql", name: "PostgreSQL", slug: "postgresql", color: "#0ea5e9" },
  { id: "docker", name: "Docker", slug: "docker", color: "#0ea5e9" },
  { id: "aws", name: "AWS", slug: "aws", color: "#fb923c" },
  { id: "machine-learning", name: "Machine Learning", slug: "ml", color: "#d946ef" },
];

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    try {
      supabase
        .from("skills")
        .select("id,name,slug,color")
        .order("name")
        .then(({ data, error }) => {
          if (!active) return;
          if (error) {
            setError(error.message);
            setSkills(fallbackSkills);
          } else {
            setSkills(data?.length ? data : fallbackSkills);
          }
          setLoading(false);
        });
    } catch (err) {
      if (!active) return;
      setError(err instanceof Error ? err.message : "Could not load skills");
      setSkills(fallbackSkills);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, []);
  return { skills, loading, error };
}

export function SkillPicker({
  selected,
  onChange,
  accent = "var(--teal)",
  placeholder = "Search skills…",
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  accent?: string;
  placeholder?: string;
}) {
  const { skills, loading, error } = useSkills();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => skills.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())),
    [skills, q],
  );

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-white/25"
        />
      </div>
      {loading && <p className="mb-2 text-xs text-muted-foreground">Loading skills...</p>}
      {error && (
        <p className="mb-2 text-xs text-amber-200">
          Showing starter skills until Supabase is available.
        </p>
      )}
      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((s) => {
          const active = selected.includes(s.id);
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => toggle(s.id)}
              disabled={Boolean(error)}
              title={error ? "Connect Supabase to use the skill catalog" : s.name}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: active ? `${s.color ?? "#94a3b8"}22` : "rgba(255,255,255,.04)",
                borderColor: active ? (s.color ?? "#94a3b8") : "rgba(255,255,255,.12)",
                color: active ? (s.color ?? "#e2e8f0") : "#cbd5e1",
                boxShadow: active ? `0 0 18px -6px ${s.color ?? accent}` : "none",
                cursor: error ? "not-allowed" : "pointer",
                opacity: error ? 0.65 : 1,
              }}
            >
              {active && <Check className="inline h-3 w-3 mr-1" />}
              {s.name}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills match "{q}"</p>
        )}
      </div>
    </div>
  );
}
