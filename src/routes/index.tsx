import { createFileRoute } from "@tanstack/react-router";
import { Background } from "@/components/landing/Background";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ActivityFeed } from "@/components/landing/ActivityFeed";
import { SocialLinks } from "@/components/landing/SocialLinks";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Skill Swap — Trade Your Tech Stack" },
      {
        name: "description",
        content:
          "Skill Swap is the peer-to-peer exchange for software engineers. Trade what you know for what you want to learn.",
      },
      { property: "og:title", content: "Skill Swap — Trade Your Tech Stack" },
      { property: "og:description", content: "The peer-to-peer exchange for software engineers." },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <Navbar />
      <main>
        <Hero />
        <ActivityFeed />
      </main>
      <footer className="px-4 sm:px-6 pb-10">
        <div className="glass max-w-6xl mx-auto rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Skill Swap — built by engineers, for engineers.
          </p>
          <SocialLinks size="md" />
        </div>
      </footer>
    </div>
  );
}
