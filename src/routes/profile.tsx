import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SkillPicker } from "@/components/skills/SkillPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Your profile — Skill Swap" }] }),
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [knows, setKnows] = useState<string[]>([]);
  const [wants, setWants] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: us }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_skills").select("skill_id, kind").eq("user_id", user.id),
      ]);
      setName(profile?.full_name ?? "");
      setHeadline(profile?.headline ?? "");
      setBio(profile?.bio ?? "");
      setKnows((us ?? []).filter((r) => r.kind === "knows").map((r) => r.skill_id));
      setWants((us ?? []).filter((r) => r.kind === "wants").map((r) => r.skill_id));
      setLoading(false);
    })();
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error: pErr } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name || null,
      headline: headline || null,
      bio: bio || null,
    });
    if (pErr) { toast.error(pErr.message); setSaving(false); return; }

    // Replace user's skills with the new selection
    const { error: dErr } = await supabase.from("user_skills").delete().eq("user_id", user.id);
    if (dErr) { toast.error(dErr.message); setSaving(false); return; }

    const rows = [
      ...knows.map((id) => ({ user_id: user.id, skill_id: id, kind: "knows" as const })),
      ...wants.map((id) => ({ user_id: user.id, skill_id: id, kind: "wants" as const })),
    ];
    if (rows.length) {
      const { error: iErr } = await supabase.from("user_skills").insert(rows);
      if (iErr) { toast.error(iErr.message); setSaving(false); return; }
    }

    setSaving(false);
    toast.success("Profile saved");
  };

  if (authLoading || loading) {
    return <AppShell><div className="grid place-items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground mt-2">Tell other engineers who you are and which technologies you can swap.</p>

        <div className="mt-8 glass rounded-3xl p-6 sm:p-8 space-y-6">
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Headline" hint="Short tagline shown on your match card.">
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} placeholder="Senior Backend Engineer · Berlin" />
          </Field>
          <Field label="Bio">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputCls} placeholder="I love building distributed systems and teaching what I learn." />
          </Field>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h3 className="font-semibold mb-1">Skills I know</h3>
            <p className="text-xs text-muted-foreground mb-4">Pick technologies you can teach or pair on.</p>
            <SkillPicker selected={knows} onChange={setKnows} accent="var(--teal)" />
          </div>
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h3 className="font-semibold mb-1">Skills I want to learn</h3>
            <p className="text-xs text-muted-foreground mb-4">Pick technologies you want help with.</p>
            <SkillPicker selected={wants} onChange={setWants} accent="var(--purple)" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button onClick={() => navigate({ to: "/dashboard" })} className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-semibold px-6 py-3 shadow-glow-cta disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
        </div>
      </div>
    </AppShell>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-white/25";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {hint && <span className="block text-[11px] text-muted-foreground/80 mb-1">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
