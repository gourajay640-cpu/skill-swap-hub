import { ArrowLeftRight, MapPin } from "lucide-react";
import { TechBadge } from "./TechBadge";

type Exchange = {
  name: string;
  initials: string;
  location: string;
  knows: string[];
  wants: string[];
  avatarBg: string;
};

const exchanges: Exchange[] = [
  { name: "Maya Chen",      initials: "MC", location: "Berlin",     knows: ["React", "TypeScript"], wants: ["Rust", "Go"],         avatarBg: "linear-gradient(135deg, #38bdf8, #a855f7)" },
  { name: "Diego Alvarez",  initials: "DA", location: "Mexico City",knows: ["Python", "ML"],        wants: ["Kubernetes", "AWS"],  avatarBg: "linear-gradient(135deg, #facc15, #f97316)" },
  { name: "Priya Natarajan", initials: "PN", location: "Bangalore",  knows: ["Node.js", "GraphQL"],  wants: ["Swift", "Elixir"],    avatarBg: "linear-gradient(135deg, #34d399, #06b6d4)" },
  { name: "Lukas Berg",     initials: "LB", location: "Stockholm",  knows: ["Solidity", "Docker"],  wants: ["React", "GraphQL"],   avatarBg: "linear-gradient(135deg, #f472b6, #6366f1)" },
];

export function ExchangeGrid() {
  return (
    <section className="px-4 sm:px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">The Exchange</h2>
            <p className="text-muted-foreground mt-2">Engineers ready to swap knowledge right now.</p>
          </div>
          <button className="glass glass-hover rounded-full px-5 py-2 text-sm">View all</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {exchanges.map((e) => (
            <article key={e.name} className="glass glass-hover rounded-2xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full grid place-items-center text-sm font-semibold text-white" style={{ background: e.avatarBg }}>
                  {e.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {e.location}
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <Row label="Offers" tags={e.knows} />
                <Row label="Wants" tags={e.wants} />
              </div>

              <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold py-2.5 transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-glow-cta">
                <ArrowLeftRight className="h-4 w-4" />
                Connect
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => <TechBadge key={t} name={t} />)}
      </div>
    </div>
  );
}
