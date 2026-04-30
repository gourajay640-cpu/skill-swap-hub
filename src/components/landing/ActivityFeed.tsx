import { ArrowLeftRight, CheckCircle2, Clock, XCircle, Loader2, Pause, Play, Filter } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 10;
const POPULAR_SKILLS = ["React", "Vue", "Node.js", "Python", "Go", "Rust", "Swift", "AWS", "Docker"];

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
  { id: "f1", status: "accepted", created_at: new Date(Date.now() - 2 * 60_000).toISOString(),  requester_name: "Sara",  receiver_name: "Tom",   requester_skill: "JavaScript", receiver_skill: "Python" },
  { id: "f2", status: "accepted", created_at: new Date(Date.now() - 8 * 60_000).toISOString(),  requester_name: "Ana",   receiver_name: "Marc", requester_skill: "React",      receiver_skill: "Vue" },
  { id: "f3", status: "pending",  created_at: new Date(Date.now() - 21 * 60_000).toISOString(), requester_name: "Kenji", receiver_name: "Ines", requester_skill: "Go",         receiver_skill: "Rust" },
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
  if (status === "pending")  return <Clock        className={`${base} text-amber-400`} />;
  if (status === "rejected") return <XCircle      className={`${base} text-rose-400`} />;
  return <ArrowLeftRight className={`${base} text-[color:var(--teal)]`} />;
}

function statusDot(status: string) {
  if (status === "accepted") return "bg-emerald-400/15 ring-1 ring-emerald-400/30";
  if (status === "pending")  return "bg-amber-400/15 ring-1 ring-amber-400/30";
  if (status === "rejected") return "bg-rose-400/15 ring-1 ring-rose-400/30";
  return "bg-white/5";
}

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadFirstPage = useCallback(async () => {
    const { data } = await supabase.rpc("get_recent_swaps_feed", {
      p_limit: PAGE_SIZE,
      p_before: null,
      p_skill: skillFilter,
    });
    const rows = (data as FeedItem[] | null) ?? [];
    setItems(rows);
    setHasMore(rows.length === PAGE_SIZE);
    setLoaded(true);
  }, [skillFilter]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || items.length === 0) return;
    setLoadingMore(true);
    const last = items[items.length - 1];
    const { data } = await supabase.rpc("get_recent_swaps_feed", {
      p_limit: PAGE_SIZE,
      p_before: last.created_at,
      p_skill: skillFilter,
    });
    const rows = (data as FeedItem[] | null) ?? [];
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id));
      return [...prev, ...rows.filter((r) => !seen.has(r.id))];
    });
    setHasMore(rows.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [items, loadingMore, hasMore, skillFilter]);

  // Initial + filter changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadFirstPage();
    })();
    return () => { cancelled = true; };
  }, [loadFirstPage]);

  // Realtime auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const channel = supabase
      .channel("swap_requests_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "swap_requests" }, () => loadFirstPage())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [autoRefresh, loadFirstPage]);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
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
            {display.map((s) => (
              <li key={s.id} className="glass-hover flex items-center justify-between rounded-xl px-3 py-2.5 border border-transparent hover:border-[color:var(--glass-border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`grid place-items-center h-8 w-8 rounded-lg ${statusDot(s.status)}`}>
                    <StatusIcon status={s.status} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SkillChip name={s.requester_skill} />
                      <span className="text-muted-foreground text-xs shrink-0">↔</span>
                      <SkillChip name={s.receiver_skill} />
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {s.requester_name} ↔ {s.receiver_name} · <span className="capitalize">{statusLabel(s.status)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">{timeAgo(s.created_at)}</span>
              </li>
            ))}

            {loaded && display.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-8">
                No swaps {skillFilter ? `for ${skillFilter} ` : ""}yet.
              </li>
            )}

            {hasMore && items.length > 0 && (
              <li ref={sentinelRef} className="flex justify-center py-3 text-xs text-muted-foreground">
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scroll for more"}
              </li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function SkillFilterBar({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
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
