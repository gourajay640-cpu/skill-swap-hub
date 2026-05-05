export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden page-bg">
      <div
        className="orb animate-float-slow"
        style={{ width: 520, height: 520, top: -120, left: -120, background: "var(--teal)" }}
      />
      <div
        className="orb animate-float-slow-2"
        style={{ width: 600, height: 600, top: "30%", right: -160, background: "var(--purple)" }}
      />
      <div
        className="orb animate-float-slow"
        style={{
          width: 480,
          height: 480,
          bottom: -160,
          left: "30%",
          background: "var(--electric)",
        }}
      />
      <div
        className="orb animate-float-slow-2"
        style={{
          width: 360,
          height: 360,
          top: "10%",
          left: "45%",
          background: "var(--teal)",
          opacity: 0.35,
        }}
      />
      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
