import { Code2, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { initialsOf } from "@/lib/matching";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { label: "Discover", to: "/" as const },
  { label: "Matches", to: "/matches" as const },
  { label: "Dashboard", to: "/dashboard" as const },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setName(null); return; }
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.full_name ?? user.email ?? null));
  }, [user]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4">
      <nav className="glass mx-auto max-w-6xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-cta shadow-glow-cta">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Skill Swap</span>
        </Link>
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-white/5"
                activeProps={{ className: "px-4 py-2 text-sm rounded-lg text-foreground bg-white/5" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="h-9 w-9 rounded-full p-[2px] bg-gradient-cta">
                <div className="h-full w-full rounded-full bg-background grid place-items-center text-xs font-semibold">
                  {initialsOf(name)}
                </div>
              </Link>
              <button
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm rounded-full px-4 py-2 bg-gradient-cta text-primary-foreground font-semibold shadow-glow-cta">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
