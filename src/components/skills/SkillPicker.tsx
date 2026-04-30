import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Skill = { id: string; name: string; slug: string; color: string | null };

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("skills").select("*").order("name").then(({ data }) => {
      setSkills(data ?? []);
      setLoading(false);
    });
  }, []);
  return { skills, loading };
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
  const { skills } = useSkills();
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
      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((s) => {
          const active = selected.includes(s.id);
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => toggle(s.id)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: active ? `${s.color ?? "#94a3b8"}22` : "rgba(255,255,255,.04)",
                borderColor: active ? (s.color ?? "#94a3b8") : "rgba(255,255,255,.12)",
                color: active ? (s.color ?? "#e2e8f0") : "#cbd5e1",
                boxShadow: active ? `0 0 18px -6px ${s.color ?? accent}` : "none",
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
