const palette: Record<string, { bg: string; fg: string; ring: string }> = {
  React:      { bg: "rgba(56,189,248,.15)",  fg: "#7dd3fc", ring: "rgba(56,189,248,.35)" },
  "Node.js":  { bg: "rgba(132,204,22,.15)",  fg: "#bef264", ring: "rgba(132,204,22,.35)" },
  Go:         { bg: "rgba(34,211,238,.15)",  fg: "#67e8f9", ring: "rgba(34,211,238,.35)" },
  Kubernetes: { bg: "rgba(99,102,241,.18)",  fg: "#a5b4fc", ring: "rgba(99,102,241,.4)"  },
  Python:     { bg: "rgba(250,204,21,.15)",  fg: "#fde047", ring: "rgba(250,204,21,.4)"  },
  Rust:       { bg: "rgba(249,115,22,.15)",  fg: "#fdba74", ring: "rgba(249,115,22,.4)"  },
  TypeScript: { bg: "rgba(59,130,246,.18)",  fg: "#93c5fd", ring: "rgba(59,130,246,.4)"  },
  GraphQL:    { bg: "rgba(236,72,153,.15)",  fg: "#f9a8d4", ring: "rgba(236,72,153,.4)"  },
  AWS:        { bg: "rgba(251,146,60,.15)",  fg: "#fdba74", ring: "rgba(251,146,60,.4)"  },
  Swift:      { bg: "rgba(244,63,94,.15)",   fg: "#fda4af", ring: "rgba(244,63,94,.4)"   },
  Elixir:     { bg: "rgba(168,85,247,.15)",  fg: "#d8b4fe", ring: "rgba(168,85,247,.4)"  },
  Docker:     { bg: "rgba(14,165,233,.18)",  fg: "#7dd3fc", ring: "rgba(14,165,233,.4)"  },
  Solidity:   { bg: "rgba(148,163,184,.18)", fg: "#cbd5e1", ring: "rgba(148,163,184,.4)" },
  ML:         { bg: "rgba(217,70,239,.15)",  fg: "#f0abfc", ring: "rgba(217,70,239,.4)"  },
};

export function TechBadge({ name }: { name: string }) {
  const c = palette[name] ?? { bg: "rgba(255,255,255,.08)", fg: "#e2e8f0", ring: "rgba(255,255,255,.2)" };
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ring-1"
      style={{ background: c.bg, color: c.fg, boxShadow: `inset 0 0 0 1px ${c.ring}` }}
    >
      {name}
    </span>
  );
}
