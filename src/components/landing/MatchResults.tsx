import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { TechBadge } from "./TechBadge";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { initialsOf, type Match } from "@/lib/matching";

const avatarGradients = [
  "linear-gradient(135deg,#38bdf8,#a855f7)",
  "linear-gradient(135deg,#facc15,#f97316)",
  "linear-gradient(135deg,#34d399,#06b6d4)",
  "linear-gradient(135deg,#f472b6,#6366f1)",
  "linear-gradient(135deg,#fb923c,#ef4444)",
  "linear-gradient(135deg,#a78bfa,#22d3ee)",
];

export function MatchResults({
  matches,
  knowIds,
  wantIds,
}: {
  matches: Match[];
  knowIds: string[];
  wantIds: string[];
}) {
  return (
    <div id="match-results" className="max-w-6xl mx-auto mt-16 text-left">
      <div className="flex items-end justify-between mb-6 px-1">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {matches.length} {matches.length === 1 ? "match" : "matches"} found
        </h2>
      </div>
      {matches.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          No two-way matches yet. Try broadening your skills or check back soon — new engineers join
          every day.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {matches.map((m, i) => (
            <MatchCard
              key={m.user_id}
              match={m}
              avatarBg={avatarGradients[i % avatarGradients.length]}
              knowIds={knowIds}
              wantIds={wantIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  avatarBg,
  knowIds,
  wantIds,
}: {
  match: Match;
  avatarBg: string;
  knowIds: string[];
  wantIds: string[];
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const message = useMemo(() => {
    const offer = match.wants[0]?.name;
    const learn = match.offers[0]?.name;
    if (!offer || !learn) return null;
    return `I can help with ${offer} and would like to learn ${learn}.`;
  }, [match.offers, match.wants]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("swap_requests")
      .select("id,status")
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${match.user_id}),and(requester_id.eq.${match.user_id},receiver_id.eq.${user.id})`,
      )
      .in("status", ["pending", "accepted"])
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSent(true);
      });
    return () => {
      active = false;
    };
  }, [match.user_id, user]);

  void knowIds;
  void wantIds;

  const onConnect = async () => {
    if (!user) {
      toast.message("Sign in to connect", {
        description: "Create an account in seconds with a magic link.",
      });
      navigate({ to: "/login" });
      return;
    }
    if (user.id === match.user_id) return;
    setPending(true);

    const { data: existing } = await supabase
      .from("swap_requests")
      .select("id,status")
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${match.user_id}),and(requester_id.eq.${match.user_id},receiver_id.eq.${user.id})`,
      )
      .in("status", ["pending", "accepted"])
      .limit(1)
      .maybeSingle();

    if (existing) {
      setPending(false);
      setSent(true);
      toast.info(
        existing.status === "accepted" ? "You are already connected." : "A request already exists.",
      );
      return;
    }

    const { error } = await supabase.from("swap_requests").insert({
      requester_id: user.id,
      receiver_id: match.user_id,
      status: "pending",
      message,
    });
    setPending(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You already sent a request to this engineer.");
        setSent(true);
      } else {
        toast.error(error.message);
      }
      return;
    }
    setSent(true);
    toast.success(`Request sent to ${match.full_name ?? "engineer"}`);
  };

  return (
    <article className="glass glass-hover rounded-2xl p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-11 w-11 rounded-full grid place-items-center text-sm font-semibold text-white"
          style={{ background: avatarBg }}
        >
          {initialsOf(match.full_name)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">{match.full_name ?? "Anonymous engineer"}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            <MapPin className="h-3 w-3" /> {match.headline ?? "Software engineer"}
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <Row label="Offers" tags={match.offers.map((s) => s.name)} />
        <Row label="Wants" tags={match.wants.map((s) => s.name)} />
      </div>

      <button
        onClick={onConnect}
        disabled={pending || sent}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold py-2.5 transition-transform hover:scale-[1.02] active:scale-[0.99] shadow-glow-cta disabled:opacity-70 disabled:hover:scale-100"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowLeftRight className="h-4 w-4" />
        )}
        {sent ? "Request sent" : "Connect"}
      </button>
    </article>
  );
}

function Row({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <TechBadge key={t} name={t} />
        ))}
      </div>
    </div>
  );
}
