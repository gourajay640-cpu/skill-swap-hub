import { Background } from "@/components/landing/Background";
import { Navbar } from "@/components/landing/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6">{children}</main>
    </div>
  );
}
