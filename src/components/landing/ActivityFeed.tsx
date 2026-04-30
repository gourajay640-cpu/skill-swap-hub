import { ArrowLeftRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.rpc("get_recent_swaps_feed");
      if (!cancelled) {
        setItems((data as FeedItem[] | null) ?? []);
        setLoaded(true);
      }
    };
    load();
    const channel = supabase
      .channel("swap_requests_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "swap_requests" }, () => load())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const display = loaded && items.length > 0 ? items : fallback;

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
            {display.map((s) => (
              <li key={s.id} className="glass-hover flex items-center justify-between rounded-xl px-3 py-2.5 border border-transparent hover:border-[color:var(--glass-border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/5">
                    <ArrowLeftRight className="h-4 w-4 text-[color:var(--teal)]" />
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
          </ul>
        </aside>
      </div>
    </section>
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
