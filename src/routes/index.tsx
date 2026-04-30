import { createFileRoute } from "@tanstack/react-router";
import { Background } from "@/components/landing/Background";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ExchangeGrid } from "@/components/landing/ExchangeGrid";
import { ActivityFeed } from "@/components/landing/ActivityFeed";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Skill Swap — Trade Your Tech Stack" },
      { name: "description", content: "Skill Swap is the peer-to-peer exchange for software engineers. Trade what you know for what you want to learn." },
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
        <ExchangeGrid />
        <ActivityFeed />
      </main>
      <footer className="px-6 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Skill Swap — built by engineers, for engineers.
      </footer>
    </div>
  );
}
