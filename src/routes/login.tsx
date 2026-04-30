import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/landing/Background";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Skill Swap" }] }),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="relative min-h-screen grid place-items-center px-4 py-16">
        <div className="w-full max-w-md glass rounded-3xl p-8">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
          {sent ? (
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-cta grid place-items-center shadow-glow-cta mb-5">
                <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground mt-2">
                We sent a magic link to <span className="text-foreground font-medium">{email}</span>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in with a magic link — no password required.</p>
              <form onSubmit={onSubmit} className="mt-6 space-y-3">
                <label className="block">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm outline-none focus:border-white/25"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta text-primary-foreground font-semibold py-3 shadow-glow-cta disabled:opacity-70"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {sending ? "Sending link…" : "Send magic link"}
                </button>
              </form>
              <p className="text-[11px] text-muted-foreground mt-5 text-center">
                By continuing you agree to swap knowledge respectfully.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
