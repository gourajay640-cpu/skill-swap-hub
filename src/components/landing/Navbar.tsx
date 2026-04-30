import { Code2 } from "lucide-react";

const links = ["Discover", "Matches", "Dashboard"];

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4">
      <nav className="glass mx-auto max-w-6xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-cta shadow-glow-cta">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Skill Swap</span>
        </a>
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l}>
              <a href="#" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-white/5">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </button>
          <div className="h-9 w-9 rounded-full p-[2px] bg-gradient-cta">
            <div className="h-full w-full rounded-full bg-background grid place-items-center text-sm font-semibold">
              AK
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
