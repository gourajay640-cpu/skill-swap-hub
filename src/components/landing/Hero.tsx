import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ArrowLeftRight, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SkillPicker, useSkills } from "@/components/skills/SkillPicker";
import { TechBadge } from "./TechBadge";
import { findMatches, type Match } from "@/lib/matching";
import { MatchResults } from "./MatchResults";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function Hero() {
  const { skills } = useSkills();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [knows, setKnows] = useState<string[]>([]);
  const [wants, setWants] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loadedSavedSkills, setLoadedSavedSkills] = useState(false);

  useEffect(() => {
    if (!user || loadedSavedSkills || knows.length || wants.length) return;
    let active = true;
    supabase
      .from("user_skills")
      .select("skill_id, kind")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setKnows((data ?? []).filter((r) => r.kind === "knows").map((r) => r.skill_id));
        setWants((data ?? []).filter((r) => r.kind === "wants").map((r) => r.skill_id));
        setLoadedSavedSkills(true);
      });
    return () => {
      active = false;
    };
  }, [loadedSavedSkills, knows.length, user, wants.length]);

  const onFind = async () => {
    if (!knows.length || !wants.length) {
      navigate({ to: "/login" });
      return;
    }
    setSearching(true);
    const m = await findMatches({
      knowSkillIds: knows,
      wantSkillIds: wants,
      excludeUserId: user?.id,
    });
    setMatches(m);
    setSearching(false);
    queueMicrotask(() => {
      document
        .getElementById("match-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const labelFor = (id: string) => skills.find((s) => s.id === id)?.name ?? "";

  return (
    <section className="relative pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--teal)]" />
          Peer-to-peer engineer mentorship — no fees, just trades
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient">Trade Your Tech Stack.</span>
          <br />
          Master Something New.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          The peer-to-peer exchange for software engineers.
        </p>

        <div className="mt-12 grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start max-w-4xl mx-auto text-left">
          <SkillBox label="I know" tags={knows.map(labelFor)} accent="var(--teal)">
            <SkillPicker selected={knows} onChange={setKnows} accent="var(--teal)" />
          </SkillBox>
          <div className="hidden md:grid place-items-center h-12 w-12 rounded-full glass mx-auto mt-12">
            <ArrowLeftRight className="h-5 w-5 text-[color:var(--teal)]" />
          </div>
          <SkillBox label="I want to learn" tags={wants.map(labelFor)} accent="var(--purple)">
            <SkillPicker selected={wants} onChange={setWants} accent="var(--purple)" />
          </SkillBox>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onFind}
            disabled={searching}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-cta text-primary-foreground font-semibold px-8 py-4 shadow-glow-cta transition-transform hover:scale-[1.03] active:scale-[0.99] disabled:opacity-70"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {searching ? "Searching…" : "Find Matches"}
            {!searching && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
          <a href="/login" className="glass glass-hover rounded-full px-6 py-4 text-sm font-medium">
            Sign in to connect
          </a>
        </div>
      </div>

      {matches && <MatchResults matches={matches} knowIds={knows} wantIds={wants} />}
    </section>
  );
}

function SkillBox({
  label,
  tags,
  accent,
  children,
}: {
  label: string;
  tags: string[];
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 relative overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: accent }}
      />
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{label}</div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((t) => (
            <TechBadge key={t} name={t} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
