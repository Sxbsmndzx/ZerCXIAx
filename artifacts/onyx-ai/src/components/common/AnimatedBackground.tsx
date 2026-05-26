export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dark base */}
      <div className="absolute inset-0 bg-background" />

      {/* Orb 1 - top left, cyan */}
      <div
        className="absolute rounded-full blur-[120px] opacity-20 animate-orb-1"
        style={{
          width: "600px",
          height: "600px",
          background: "hsl(var(--primary))",
          top: "-200px",
          left: "-200px",
        }}
      />

      {/* Orb 2 - bottom right, purple */}
      <div
        className="absolute rounded-full blur-[160px] opacity-15 animate-orb-2"
        style={{
          width: "700px",
          height: "700px",
          background: "hsl(270 80% 60%)",
          bottom: "-300px",
          right: "-200px",
        }}
      />

      {/* Orb 3 - center, teal */}
      <div
        className="absolute rounded-full blur-[100px] opacity-10 animate-orb-3"
        style={{
          width: "400px",
          height: "400px",
          background: "hsl(200 100% 50%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
