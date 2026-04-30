import { Github, Linkedin, Instagram } from "lucide-react";

export const socials = [
  { label: "GitHub",    href: "#", Icon: Github },
  { label: "LinkedIn",  href: "#", Icon: Linkedin },
  { label: "Instagram", href: "#", Icon: Instagram },
];

export function SocialLinks({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <ul className="flex items-center gap-2">
      {socials.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={label}
            title={label}
            className={`${dim} grid place-items-center rounded-full border border-[color:var(--glass-border)] bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.1] transition-colors`}
          >
            <Icon className={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}