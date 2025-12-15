import { motion } from "framer-motion";
import cheflyLogo from "@/assets/chefly-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={(definition) => {
        // Only trigger onComplete when the exit animation finishes
        if (definition === "exit") {
          onComplete();
        }
      }}
    >
      {/* Background decorative elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-32 right-10 w-32 h-32 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/3 right-20 w-16 h-16 rounded-full bg-primary/5 blur-xl" />
      </motion.div>

      {/* Logo container with animations */}
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
      >
        {/* Glow effect behind logo */}
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 0.6, 0.3], scale: [1, 1.5, 1.3] }}
          transition={{
            duration: 1.5,
            delay: 0.3,
            times: [0, 0.5, 1],
          }}
        />

        {/* Logo image */}
        <motion.img
          src={cheflyLogo}
          alt="Chefly"
          className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 0.2,
          }}
        />
      </motion.div>

      {/* App name */}
      <motion.h1
        className="mt-6 text-3xl font-bold text-foreground tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Chefly
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="mt-2 text-muted-foreground text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Tu coach de nutrición con IA
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        className="mt-8 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>

      {/* Auto-hide after animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2 }}
        onAnimationComplete={() => onComplete()}
      />
    </motion.div>
  );
};

export default SplashScreen;
