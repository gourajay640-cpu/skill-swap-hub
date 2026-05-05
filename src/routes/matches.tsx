import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Check, X, Inbox, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { initialsOf } from "@/lib/matching";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({ meta: [{ title: "Matches — Skill Swap" }] }),
});

type Profile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
};
type Req = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  requester_id: string;
  receiver_id: string;
  created_at: string;
  requester: Profile | null;
  receiver: Profile | null;
};

type Tab = "incoming" | "outgoing" | "active";

function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("incoming");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("swap_requests")
      .select(
        "id, status, requester_id, receiver_id, created_at, requester:profiles!swap_requests_requester_id_fkey(id,full_name,headline,avatar_url), receiver:profiles!swap_requests_receiver_id_fkey(id,full_name,headline,avatar_url)",
      )
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    setReqs((data ?? []) as unknown as Req[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("matches-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "swap_requests" }, () =>
        refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, refresh]);

  const incoming = reqs.filter((r) => r.status === "pending" && r.receiver_id === user?.id);
  const outgoing = reqs.filter((r) => r.status === "pending" && r.requester_id === user?.id);
  const active = reqs.filter((r) => r.status === "accepted");

  const list = tab === "incoming" ? incoming : tab === "outgoing" ? outgoing : active;

  const respond = async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    if (!user) return;
    let query = supabase
      .from("swap_requests")
      .update({ status })
      .eq("id", id)
      .eq("status", "pending");
    query =
      status === "cancelled" ? query.eq("requester_id", user.id) : query.eq("receiver_id", user.id);

    const { error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(
        status === "accepted"
          ? "Connected!"
          : status === "rejected"
            ? "Request declined"
            : "Request cancelled",
      );
      refresh();
    }
  };

  if (authLoading || !user)
    return (
      <AppShell>
        <Loader2 className="mx-auto mt-32 h-6 w-6 animate-spin text-muted-foreground" />
      </AppShell>
    );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground mt-2">
          Manage your incoming requests, sent invites, and active swaps.
        </p>

        <div className="glass mt-6 inline-flex p-1 rounded-full">
          <TabBtn
            icon={<Inbox className="h-4 w-4" />}
            label={`Incoming (${incoming.length})`}
            active={tab === "incoming"}
            onClick={() => setTab("incoming")}
          />
          <TabBtn
            icon={<Send className="h-4 w-4" />}
            label={`Sent (${outgoing.length})`}
            active={tab === "outgoing"}
            onClick={() => setTab("outgoing")}
          />
          <TabBtn
            icon={<Users className="h-4 w-4" />}
            label={`Active (${active.length})`}
            active={tab === "active"}
            onClick={() => setTab("active")}
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="py-16 grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <div className="glass rounded-2xl py-12 text-center text-muted-foreground">
              {tab === "incoming" && "No incoming requests yet."}
              {tab === "outgoing" && (
                <>
                  No sent requests.{" "}
                  <Link to="/" className="underline underline-offset-2 text-foreground">
                    Find a match →
                  </Link>
                </>
              )}
              {tab === "active" && "Accept a request to start an active swap."}
            </div>
          ) : (
            list.map((r) => {
              const other = r.requester_id === user.id ? r.receiver : r.requester;
              return (
                <article
                  key={r.id}
                  className="glass glass-hover rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-gradient-cta grid place-items-center text-sm font-semibold text-primary-foreground shrink-0">
                      {initialsOf(other?.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {other?.full_name ?? "An engineer"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {other?.headline ?? "Software engineer"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === "incoming" && (
                      <>
                        <button
                          onClick={() => respond(r.id, "rejected")}
                          className="glass glass-hover rounded-full px-3 py-2 text-xs inline-flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </button>
                        <button
                          onClick={() => respond(r.id, "accepted")}
                          className="rounded-full px-4 py-2 text-xs font-semibold bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 shadow-glow-cta"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </button>
                      </>
                    )}
                    {tab === "outgoing" && (
                      <button
                        onClick={() => respond(r.id, "cancelled")}
                        className="glass glass-hover rounded-full px-3 py-2 text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    {tab === "active" && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full ring-1 bg-emerald-400/10 text-emerald-200 ring-emerald-400/30">
                        Active swap
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-colors ${active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}
