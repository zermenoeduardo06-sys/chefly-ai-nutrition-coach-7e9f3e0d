import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface DreamyBlob {
  id: number;
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
  opacity: number;
}

const generateDreamyBlobs = (count: number): DreamyBlob[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 300 + 150,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    duration: Math.random() * 15 + 20, // Slower animations (20-35s)
    delay: Math.random() * 8,
    opacity: Math.random() * 0.3 + 0.1,
  }));
};

// Reduce blobs on mobile for performance
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const dreamyBlobs = generateDreamyBlobs(isMobile ? 4 : 8);
const softOrbs = generateDreamyBlobs(isMobile ? 3 : 6);

export const HeroParticles = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Gentle parallax transforms
  const y1 = useTransform(scrollY, [0, 600], [0, 80]);
  const y2 = useTransform(scrollY, [0, 600], [0, 50]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Warm dreamy base gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        {/* Soft warm overlay - creates the "dreamy mist" effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/10" />
      </motion.div>

      {/* Large soft blobs - Layer 1 (slowest, creates depth) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y1, opacity }}
      >
        {dreamyBlobs.map((blob) => (
          <motion.div
            key={`dream-blob-${blob.id}`}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              left: blob.x,
              top: blob.y,
              background: blob.id % 3 === 0 
                ? "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 40%, transparent 70%)"
                : blob.id % 3 === 1
                ? "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, hsl(var(--secondary) / 0.04) 40%, transparent 70%)"
                : "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, hsl(var(--accent) / 0.03) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              delay: blob.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Soft glowing orbs - Layer 2 (medium speed, adds warmth) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: y2, opacity }}
      >
        {softOrbs.map((orb) => (
          <motion.div
            key={`soft-orb-${orb.id}`}
            className="absolute rounded-full"
            style={{
              width: orb.size * 0.6,
              height: orb.size * 0.6,
              left: orb.x,
              top: orb.y,
              background: orb.id % 2 === 0 
                ? "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.08) 30%, transparent 60%)"
                : "radial-gradient(circle, hsl(var(--secondary) / 0.18) 0%, hsl(var(--secondary) / 0.06) 30%, transparent 60%)",
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity],
            }}
            transition={{
              duration: orb.duration * 0.7,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Floating dust particles - Layer 3 (subtle, adds texture) */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        {[...Array(isMobile ? 8 : 15)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${5 + i * 6}%`,
              top: `${10 + (i % 5) * 18}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Soft ambient light spots */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--secondary) / 0.06) 0%, transparent 60%)",
            filter: "blur(70px)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            delay: 5,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Soft wave at bottom - gentler animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{ opacity }}
      >
        <svg
          className="absolute bottom-0 w-full h-40"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,80 C360,120 720,40 1080,100 C1260,130 1380,70 1440,90 L1440,160 L0,160 Z"
            fill="hsl(var(--primary) / 0.03)"
            animate={{
              d: [
                "M0,80 C360,120 720,40 1080,100 C1260,130 1380,70 1440,90 L1440,160 L0,160 Z",
                "M0,100 C360,60 720,110 1080,70 C1260,90 1380,120 1440,80 L1440,160 L0,160 Z",
                "M0,80 C360,120 720,40 1080,100 C1260,130 1380,70 1440,90 L1440,160 L0,160 Z",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M0,120 C480,80 960,140 1440,100 L1440,160 L0,160 Z"
            fill="hsl(var(--secondary) / 0.02)"
            animate={{
              d: [
                "M0,120 C480,80 960,140 1440,100 L1440,160 L0,160 Z",
                "M0,90 C480,130 960,70 1440,120 L1440,160 L0,160 Z",
                "M0,120 C480,80 960,140 1440,100 L1440,160 L0,160 Z",
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </svg>
      </motion.div>

      {/* Vignette overlay for depth - softer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
    </div>
  );
};
