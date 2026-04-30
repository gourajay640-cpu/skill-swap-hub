import { ArrowLeftRight, CheckCircle2 } from "lucide-react";

const activity = [
  { a: "JS",         b: "Python",      who: "Sara ↔ Tom",      time: "2m ago" },
  { a: "React",      b: "Vue",         who: "Ana ↔ Marc",      time: "8m ago" },
  { a: "Go",         b: "Rust",        who: "Kenji ↔ Ines",    time: "21m ago" },
  { a: "Kubernetes", b: "Terraform",   who: "Olu ↔ Zara",      time: "1h ago" },
  { a: "GraphQL",    b: "tRPC",        who: "Mira ↔ Felix",    time: "3h ago" },
  { a: "Swift",      b: "Kotlin",      who: "Noor ↔ Pablo",    time: "5h ago" },
];

export function ActivityFeed() {
  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left highlight panel */}
        <div className="glass rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: "var(--purple)" }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: "var(--teal)" }} />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Made for engineers, powered by engineers.</h3>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Skill Swap matches you with peers based on complementary stacks. Trade hours, exchange knowledge, and ship better code together.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Smart matching by stack & timezone",
                "1:1 sessions or async pair programming",
                "Verified profiles & reputation scores",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--teal)]" />
                  <span className="text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Activity feed */}
        <aside className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Latest swaps</h3>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <ul className="space-y-2">
            {activity.map((s, i) => (
              <li key={i} className="glass-hover flex items-center justify-between rounded-xl px-3 py-2.5 border border-transparent hover:border-[color:var(--glass-border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/5">
                    <ArrowLeftRight className="h-4 w-4 text-[color:var(--teal)]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {s.a} <span className="text-muted-foreground">↔</span> {s.b}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{s.who}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">{s.time}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
