import { ArrowRight, Sparkles, ArrowLeftRight } from "lucide-react";
import { TechBadge } from "./TechBadge";

export function Hero() {
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

        {/* Interactive input area */}
        <div className="mt-12 grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center max-w-4xl mx-auto">
          <SkillBox label="I know" tags={["React", "Node.js"]} accent="var(--teal)" placeholder="Add a skill…" />
          <div className="hidden md:grid place-items-center h-12 w-12 rounded-full glass mx-auto">
            <ArrowLeftRight className="h-5 w-5 text-[color:var(--teal)]" />
          </div>
          <SkillBox label="I want to learn" tags={["Go", "Kubernetes"]} accent="var(--purple)" placeholder="Add a skill…" />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-cta text-primary-foreground font-semibold px-8 py-4 shadow-glow-cta transition-transform hover:scale-[1.03] active:scale-[0.99]">
            Find Matches
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className="glass glass-hover rounded-full px-6 py-4 text-sm font-medium">
            How it works
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          <Stat value="12.4k" label="Engineers" />
          <Stat value="38k" label="Swaps completed" />
          <Stat value="180+" label="Tech stacks" />
        </div>
      </div>
    </section>
  );
}

function SkillBox({ label, tags, accent, placeholder }: { label: string; tags: string[]; accent: string; placeholder: string }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 text-left relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{label}</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((t) => <TechBadge key={t} name={t} />)}
      </div>
      <input
        className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
        placeholder={placeholder}
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground font-semibold">{value}</span>
      <span>{label}</span>
    </div>
  );
}
