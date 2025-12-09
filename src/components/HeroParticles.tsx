import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Particle {
  id: number;
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
  opacity: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));
};

// Reduce particles on mobile for better performance
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const floatingParticles = generateParticles(isMobile ? 12 : 30);
const glowOrbs = generateParticles(isMobile ? 4 : 8);

export const HeroParticles = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms for different layers
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);
  const y3 = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Base gradient layer */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"
        style={{ opacity }}
      />

      {/* Animated gradient mesh - Layer 1 (slowest parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y1, opacity }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tl from-secondary/20 to-transparent blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </motion.div>

      {/* Glow orbs - Layer 2 (medium parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y2, opacity }}
      >
        {glowOrbs.map((orb) => (
          <motion.div
            key={`orb-${orb.id}`}
            className="absolute rounded-full"
            style={{
              width: orb.size * 15,
              height: orb.size * 15,
              left: orb.x,
              top: orb.y,
              background: orb.id % 2 === 0 
                ? "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)"
                : "radial-gradient(circle, hsl(var(--secondary) / 0.25) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity],
            }}
            transition={{
              duration: orb.duration * 0.5,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Floating particles - Layer 3 (fastest parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y3, opacity }}
      >
        {floatingParticles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              background: particle.id % 3 === 0 
                ? "hsl(var(--primary))"
                : particle.id % 3 === 1
                ? "hsl(var(--secondary))"
                : "hsl(var(--foreground) / 0.3)",
              boxShadow: particle.id % 2 === 0 
                ? "0 0 10px hsl(var(--primary) / 0.5)"
                : "0 0 8px hsl(var(--secondary) / 0.4)",
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.id % 2 === 0 ? 10 : -10, 0],
              opacity: [particle.opacity, particle.opacity * 2, particle.opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Shooting stars / meteors */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`meteor-${i}`}
            className="absolute w-1 h-20 rounded-full"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--primary)), transparent)",
              left: `${20 + i * 30}%`,
              top: "-20%",
              rotate: "45deg",
            }}
            animate={{
              y: ["0%", "150%"],
              x: ["0%", "50%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 4 + 2,
              ease: "easeIn",
            }}
          />
        ))}
      </motion.div>

      {/* Floating sparkle dots */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y3, opacity }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${8 + i * 8}%`,
              top: `${10 + (i % 4) * 25}%`,
            }}
          >
            <motion.div
              className="w-1 h-1 bg-primary rounded-full"
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Animated wave at bottom */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ opacity }}
      >
        <svg
          className="absolute bottom-0 w-full h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z"
            fill="hsl(var(--primary) / 0.05)"
            animate={{
              d: [
                "M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z",
                "M0,60 C360,20 720,80 1080,30 C1260,50 1380,80 1440,50 L1440,120 L0,120 Z",
                "M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M0,80 C480,40 960,100 1440,60 L1440,120 L0,120 Z"
            fill="hsl(var(--secondary) / 0.03)"
            animate={{
              d: [
                "M0,80 C480,40 960,100 1440,60 L1440,120 L0,120 Z",
                "M0,50 C480,90 960,30 1440,80 L1440,120 L0,120 Z",
                "M0,80 C480,40 960,100 1440,60 L1440,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </svg>
      </motion.div>

      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
    </div>
  );
};
