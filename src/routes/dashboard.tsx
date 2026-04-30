import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Inbox, Send, Users, Loader2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Counts = { incoming: number; outgoing: number; accepted: number };
type Profile = { id: string; full_name: string | null; headline: string | null };

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Skill Swap" }] }),
});

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Counts>({ incoming: 0, outgoing: 0, accepted: 0 });
  const [recent, setRecent] = useState<{ id: string; status: string; other: Profile | null; direction: "in" | "out" }[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null; headline: string | null } | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: prof }, { data: requests }] = await Promise.all([
      supabase.from("profiles").select("full_name, headline").eq("id", user.id).maybeSingle(),
      supabase
        .from("swap_requests")
        .select("id, status, requester_id, receiver_id, created_at, requester:profiles!swap_requests_requester_id_fkey(id,full_name,headline), receiver:profiles!swap_requests_receiver_id_fkey(id,full_name,headline)")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false }),
    ]);

    setProfile(prof ?? null);

    type R = {
      id: string; status: string; requester_id: string; receiver_id: string;
      requester: Profile | null; receiver: Profile | null;
    };
    const rs = (requests ?? []) as unknown as R[];

    const c: Counts = { incoming: 0, outgoing: 0, accepted: 0 };
    for (const r of rs) {
      if (r.status === "accepted") c.accepted++;
      else if (r.status === "pending") {
        if (r.receiver_id === user.id) c.incoming++;
        else c.outgoing++;
      }
    }
    setCounts(c);

    setRecent(
      rs.slice(0, 6).map((r) => ({
        id: r.id,
        status: r.status,
        direction: r.requester_id === user.id ? "out" : "in",
        other: r.requester_id === user.id ? r.receiver : r.requester,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  // Realtime sync
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dashboard-swaps")
      .on("postgres_changes", { event: "*", schema: "public", table: "swap_requests" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refresh]);

  if (authLoading || !user) return <AppShell><Loader2 className="mx-auto mt-32 h-6 w-6 animate-spin text-muted-foreground" /></AppShell>;

  const profileIncomplete = !profile?.full_name;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
            <p className="text-muted-foreground mt-2">Your active swaps and pending requests.</p>
          </div>
          <Link to="/profile" className="glass glass-hover rounded-full px-5 py-2.5 text-sm font-medium">Edit profile</Link>
        </div>

        {profileIncomplete && (
          <div className="mt-6 glass rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3 border border-[color:var(--teal)]/30">
            <div>
              <div className="font-semibold">Finish your profile</div>
              <div className="text-sm text-muted-foreground">Add your name and skills so others can match with you.</div>
            </div>
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full bg-gradient-cta text-primary-foreground px-4 py-2 shadow-glow-cta">
              Set up <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Stat icon={<Inbox className="h-5 w-5" />} label="Incoming requests" value={counts.incoming} accent="var(--teal)" />
          <Stat icon={<Send className="h-5 w-5" />} label="Sent requests" value={counts.outgoing} accent="var(--electric)" />
          <Stat icon={<Users className="h-5 w-5" />} label="Active swaps" value={counts.accepted} accent="var(--purple)" />
        </div>

        <div className="mt-8 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent activity</h2>
            <Link to="/matches" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          {loading ? (
            <div className="py-8 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No activity yet. <Link to="/" className="text-foreground underline underline-offset-2">Find your first match →</Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.other?.full_name ?? "An engineer"}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.other?.headline ?? "Software engineer"}</div>
                  </div>
                  <StatusPill status={r.status} direction={r.direction} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ background: accent }} />
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
    </div>
  );
}

function StatusPill({ status, direction }: { status: string; direction: "in" | "out" }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: direction === "in" ? "Pending · review" : "Pending · sent", cls: "bg-yellow-400/10 text-yellow-200 ring-yellow-400/30" },
    accepted:  { label: "Accepted", cls: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30" },
    rejected:  { label: "Declined", cls: "bg-rose-400/10 text-rose-200 ring-rose-400/30" },
    cancelled: { label: "Cancelled", cls: "bg-white/5 text-muted-foreground ring-white/10" },
  };
  const m = map[status] ?? map.pending;
  return <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ring-1 ${m.cls}`}>{m.label}</span>;
}
