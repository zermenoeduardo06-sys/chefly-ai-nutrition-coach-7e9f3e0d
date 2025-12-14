import { useRef } from "react";

export const HeroParticlesLite = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Base gradient layer - static, no animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />

      {/* Simple gradient orbs - CSS animations only */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tl from-secondary/15 to-transparent blur-3xl opacity-60" />

      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
    </div>
  );
};
