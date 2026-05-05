import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Pause,
  Play,
  Filter,
  Timer,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 10;
const POPULAR_SKILLS = [
  "React",
  "Vue",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "Swift",
  "AWS",
  "Docker",
];

type FeedItem = {
  id: string;
  status: string;
  created_at: string;
  requester_name: string;
  receiver_name: string;
  requester_skill: string | null;
  receiver_skill: string | null;
};

const fallback: FeedItem[] = [
  {
    id: "f1",
    status: "accepted",
    created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    requester_name: "Sara",
    receiver_name: "Tom",
    requester_skill: "React",
    receiver_skill: "Vue",
  },
  {
    id: "f2",
    status: "accepted",
    created_at: new Date(Date.now() - 8 * 60_000).toISOString(),
    requester_name: "Ana",
    receiver_name: "Marc",
    requester_skill: "Node.js",
    receiver_skill: "Python",
  },
  {
    id: "f3",
    status: "pending",
    created_at: new Date(Date.now() - 14 * 60_000).toISOString(),
    requester_name: "Kenji",
    receiver_name: "Ines",
    requester_skill: "Go",
    receiver_skill: "Rust",
  },
  {
    id: "f4",
    status: "accepted",
    created_at: new Date(Date.now() - 22 * 60_000).toISOString(),
    requester_name: "Liam",
    receiver_name: "Mei",
    requester_skill: "TypeScript",
    receiver_skill: "React",
  },
  {
    id: "f5",
    status: "accepted",
    created_at: new Date(Date.now() - 38 * 60_000).toISOString(),
    requester_name: "Olu",
    receiver_name: "Zara",
    requester_skill: "Docker",
    receiver_skill: "Kubernetes",
  },
  {
    id: "f6",
    status: "pending",
    created_at: new Date(Date.now() - 55 * 60_000).toISOString(),
    requester_name: "Mira",
    receiver_name: "Felix",
    requester_skill: "Vue",
    receiver_skill: "Svelte",
  },
  {
    id: "f7",
    status: "accepted",
    created_at: new Date(Date.now() - 1 * 3_600_000).toISOString(),
    requester_name: "Noor",
    receiver_name: "Pablo",
    requester_skill: "Swift",
    receiver_skill: "Kotlin",
  },
  {
    id: "f8",
    status: "accepted",
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    requester_name: "Aria",
    receiver_name: "Dev",
    requester_skill: "Node.js",
    receiver_skill: "Go",
  },
  {
    id: "f9",
    status: "rejected",
    created_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    requester_name: "Hugo",
    receiver_name: "Yui",
    requester_skill: "PHP",
    receiver_skill: "Ruby",
  },
  {
    id: "f10",
    status: "accepted",
    created_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    requester_name: "Sami",
    receiver_name: "Eli",
    requester_skill: "AWS",
    receiver_skill: "Terraform",
  },
  {
    id: "f11",
    status: "pending",
    created_at: new Date(Date.now() - 6 * 3_600_000).toISOString(),
    requester_name: "Tara",
    receiver_name: "Jin",
    requester_skill: "GraphQL",
    receiver_skill: "PostgreSQL",
  },
  {
    id: "f12",
    status: "accepted",
    created_at: new Date(Date.now() - 9 * 3_600_000).toISOString(),
    requester_name: "Lena",
    receiver_name: "Omar",
    requester_skill: "Python",
    receiver_skill: "TensorFlow",
  },
  {
    id: "f13",
    status: "accepted",
    created_at: new Date(Date.now() - 14 * 3_600_000).toISOString(),
    requester_name: "Ravi",
    receiver_name: "Sofia",
    requester_skill: "Next.js",
    receiver_skill: "Tailwind CSS",
  },
  {
    id: "f14",
    status: "accepted",
    created_at: new Date(Date.now() - 22 * 3_600_000).toISOString(),
    requester_name: "Bea",
    receiver_name: "Niko",
    requester_skill: "MongoDB",
    receiver_skill: "Redis",
  },
  {
    id: "f15",
    status: "pending",
    created_at: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    requester_name: "Cleo",
    receiver_name: "Rafa",
    requester_skill: "Solidity",
    receiver_skill: "Rust",
  },
];

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusLabel(status: string) {
  if (status === "accepted") return "matched";
  if (status === "pending") return "requested";
  if (status === "rejected") return "declined";
  return status;
}

function StatusIcon({ status }: { status: string }) {
  const base = "h-4 w-4";
  if (status === "accepted") return <CheckCircle2 className={`${base} text-emerald-400`} />;
  if (status === "pending") return <Clock className={`${base} text-amber-400`} />;
  if (status === "rejected") return <XCircle className={`${base} text-rose-400`} />;
  return <ArrowLeftRight className={`${base} text-[color:var(--teal)]`} />;
}

function statusDot(status: string) {
  if (status === "accepted") return "bg-emerald-400/15 ring-1 ring-emerald-400/30";
  if (status === "pending") return "bg-amber-400/15 ring-1 ring-amber-400/30";
  if (status === "rejected") return "bg-rose-400/15 ring-1 ring-rose-400/30";
  return "bg-white/5";
}

// Deterministic hash so each swap renders consistent "extra" details across renders.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const DURATIONS = ["30 min", "45 min", "1 hr", "1.5 hr", "2 hr"];
const FORMATS = ["1:1 call", "Async pair", "Code review", "Live coding"];

function categoryFor(skill: string | null): { label: string; color: string } | null {
  if (!skill) return null;
  const s = skill.toLowerCase();
  if (
    [
      "react",
      "vue",
      "svelte",
      "next.js",
      "nextjs",
      "tailwind",
      "tailwindcss",
      "javascript",
      "typescript",
      "html",
      "css",
    ].includes(s)
  )
    return { label: "Frontend", color: "text-sky-300 bg-sky-400/10 border-sky-400/20" };
  if (
    [
      "node.js",
      "nodejs",
      "python",
      "go",
      "rust",
      "java",
      "ruby",
      "php",
      "elixir",
      "c++",
      "cpp",
      "graphql",
    ].includes(s)
  )
    return { label: "Backend", color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" };
  if (["docker", "kubernetes", "aws", "terraform"].includes(s))
    return { label: "DevOps", color: "text-orange-300 bg-orange-400/10 border-orange-400/20" };
  if (["postgresql", "mongodb", "redis"].includes(s))
    return { label: "Database", color: "text-purple-300 bg-purple-400/10 border-purple-400/20" };
  if (["swift", "kotlin"].includes(s))
    return { label: "Mobile", color: "text-pink-300 bg-pink-400/10 border-pink-400/20" };
  if (["ml", "tensorflow", "machine learning"].includes(s))
    return { label: "AI", color: "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20" };
  if (["solidity"].includes(s))
    return { label: "Web3", color: "text-amber-300 bg-amber-400/10 border-amber-400/20" };
  return { label: "Tech", color: "text-slate-300 bg-white/5 border-white/10" };
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#38bdf8,#a855f7)",
  "linear-gradient(135deg,#facc15,#f97316)",
  "linear-gradient(135deg,#34d399,#06b6d4)",
  "linear-gradient(135deg,#f472b6,#6366f1)",
  "linear-gradient(135deg,#fb923c,#ef4444)",
  "linear-gradient(135deg,#a78bfa,#22d3ee)",
];

function MiniAvatar({ name, seed }: { name: string; seed: number }) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  const bg = AVATAR_GRADIENTS[seed % AVATAR_GRADIENTS.length];
  return (
    <span
      className="h-6 w-6 rounded-full ring-2 ring-background grid place-items-center text-[10px] font-semibold text-white"
      style={{ background: bg }}
      title={name}
    >
      {initial}
    </span>
  );
}

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLLIElement | null>(null);

  const loadFirstPage = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_recent_swaps_feed", {
        p_limit: PAGE_SIZE,
        p_before: undefined,
        p_skill: skillFilter ?? undefined,
      });
      if (error) throw error;
      const rows = (data as FeedItem[] | null) ?? [];
      setItems(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      setItems([]);
      setHasMore(false);
    } finally {
      setLoaded(true);
    }
  }, [skillFilter]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || items.length === 0) return;
    setLoadingMore(true);
    const last = items[items.length - 1];
    try {
      const { data, error } = await supabase.rpc("get_recent_swaps_feed", {
        p_limit: PAGE_SIZE,
        p_before: last.created_at,
        p_skill: skillFilter ?? undefined,
      });
      if (error) throw error;
      const rows = (data as FeedItem[] | null) ?? [];
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        return [...prev, ...rows.filter((r) => !seen.has(r.id))];
      });
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [items, loadingMore, hasMore, skillFilter]);

  // Initial + filter changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadFirstPage();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFirstPage]);

  // Realtime auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const channel = supabase
      .channel("swap_requests_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "swap_requests" }, () =>
        loadFirstPage(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoRefresh, loadFirstPage]);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const display = useMemo(
    () => (loaded && items.length > 0 ? items : !loaded ? [] : skillFilter ? [] : fallback),
    [loaded, items, skillFilter],
  );

  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left highlight panel */}
        <div className="glass rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--purple)" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--teal)" }}
          />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Made for engineers, powered by engineers.
            </h3>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Skill Swap matches you with peers based on complementary stacks. Trade hours, exchange
              knowledge, and ship better code together.
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
        <aside className="glass rounded-3xl p-6 flex flex-col max-h-[640px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Latest swaps</h3>
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border border-[color:var(--glass-border)] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
            >
              {autoRefresh ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <Pause className="h-3 w-3" /> Live
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                  <Play className="h-3 w-3" /> Paused
                </>
              )}
            </button>
          </div>

          <SkillFilterBar value={skillFilter} onChange={setSkillFilter} />

          <ul className="space-y-2 mt-3 overflow-y-auto pr-1 -mr-1 flex-1">
            {display.map((s) => {
              const seed = hashSeed(s.id);
              const duration = DURATIONS[seed % DURATIONS.length];
              const format = FORMATS[(seed >> 3) % FORMATS.length];
              const messages = (seed % 23) + 2;
              const xp = ((seed >> 5) % 40) + 10;
              const cat = categoryFor(s.requester_skill ?? s.receiver_skill);
              return (
                <li
                  key={s.id}
                  className="glass-hover rounded-xl px-3 py-2.5 border border-transparent hover:border-[color:var(--glass-border)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid place-items-center h-8 w-8 rounded-lg shrink-0 ${statusDot(s.status)}`}
                      >
                        <StatusIcon status={s.status} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <SkillChip name={s.requester_skill} />
                          <span className="text-muted-foreground text-xs shrink-0">↔</span>
                          <SkillChip name={s.receiver_skill} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 min-w-0">
                          <div className="flex -space-x-1.5 shrink-0">
                            <MiniAvatar name={s.requester_name} seed={seed} />
                            <MiniAvatar name={s.receiver_name} seed={seed + 7} />
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {s.requester_name} ↔ {s.receiver_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo(s.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-1.5 mt-2.5 pl-11">
                    <MetaPill icon={<Timer className="h-3 w-3" />} text={duration} />
                    <MetaPill text={format} />
                    {cat && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${cat.color}`}
                      >
                        {cat.label}
                      </span>
                    )}
                    {s.status === "accepted" && (
                      <MetaPill
                        icon={<MessageSquare className="h-3 w-3" />}
                        text={`${messages} msgs`}
                      />
                    )}
                    {s.status === "accepted" && (
                      <MetaPill
                        icon={<Sparkles className="h-3 w-3 text-[color:var(--teal)]" />}
                        text={`+${xp} XP`}
                      />
                    )}
                  </div>
                </li>
              );
            })}

            {loaded && display.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-8">
                No swaps {skillFilter ? `for ${skillFilter} ` : ""}yet.
              </li>
            )}

            {hasMore && items.length > 0 && (
              <li
                ref={sentinelRef}
                className="flex justify-center py-3 text-xs text-muted-foreground"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scroll for more"}
              </li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function MetaPill({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-white/[0.04] border border-[color:var(--glass-border)] backdrop-blur-md">
      {icon}
      {text}
    </span>
  );
}

function SkillFilterBar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 -mx-1 px-1 overflow-x-auto pb-1 scrollbar-thin">
      <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <button
        onClick={() => onChange(null)}
        className={
          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors " +
          (value === null
            ? "bg-white/[0.12] border-[color:var(--glass-border)] text-foreground"
            : "bg-white/[0.03] border-[color:var(--glass-border)] text-muted-foreground hover:text-foreground")
        }
      >
        All
      </button>
      {POPULAR_SKILLS.map((skill) => {
        const active = value === skill;
        return (
          <button
            key={skill}
            onClick={() => onChange(active ? null : skill)}
            className={
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors " +
              (active
                ? "bg-white/[0.12] border-[color:var(--glass-border)] text-foreground"
                : "bg-white/[0.03] border-[color:var(--glass-border)] text-muted-foreground hover:text-foreground")
            }
          >
            {skill}
          </button>
        );
      })}
    </div>
  );
}

function SkillChip({ name }: { name: string | null }) {
  const isMissing = !name;
  return (
    <span
      className={
        "inline-flex items-center max-w-[8rem] truncate rounded-md px-2 py-0.5 text-[11px] font-medium border backdrop-blur-md " +
        (isMissing
          ? "bg-white/[0.03] border-[color:var(--glass-border)] text-muted-foreground italic"
          : "bg-white/[0.06] border-[color:var(--glass-border)] text-foreground/90")
      }
      title={name ?? "Skill not set"}
    >
      {name ?? "Any skill"}
    </span>
  );
}
