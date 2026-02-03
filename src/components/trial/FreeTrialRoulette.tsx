import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useIsMobile } from '@/hooks/use-mobile';
import confetti from 'canvas-confetti';
import mascotHappy from '@/assets/mascot-happy.png';

const SEGMENTS = [
  { label: '1 día', labelEn: '1 day', color: 'hsl(var(--primary))' },
  { label: 'Nada', labelEn: 'Nothing', color: 'hsl(var(--muted))' },
  { label: '3 días', labelEn: '3 days', color: 'hsl(var(--secondary))' },
  { label: 'Nada', labelEn: 'Nothing', color: 'hsl(var(--muted))' },
  { label: '2 días', labelEn: '2 days', color: 'hsl(var(--accent))' },
  { label: 'Nada', labelEn: 'Nothing', color: 'hsl(var(--muted))' },
  { label: '7 días', labelEn: '7 days', color: 'hsl(142, 76%, 36%)' },
  { label: 'Nada', labelEn: 'Nothing', color: 'hsl(var(--muted))' },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length; // 45 degrees each

export const FreeTrialRoulette = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { selectionChanged, warningNotification, successNotification, celebrationPattern } = useHaptics();
  const isMobile = useIsMobile();
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(2);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const texts = {
    es: {
      title: '¡Gira para ganar días gratis!',
      spin: 'Girar ruleta',
      spinAgain: '¡Girar de nuevo!',
      almost: '¡Casi! Tienes otro intento',
      won: '¡Ganaste!',
      continue: 'Continuar',
    },
    en: {
      title: 'Spin to win free days!',
      spin: 'Spin the wheel',
      spinAgain: 'Spin again!',
      almost: 'So close! You have another try',
      won: 'You won!',
      continue: 'Continue',
    },
  };

  const t = texts[language];

  // Reduce particle count for tablets for better performance
  const particleCount = isMobile ? 20 : 10;

  // Cleanup haptic interval on unmount
  useEffect(() => {
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
      }
    };
  }, []);

  const handleSpin = async () => {
    if (isSpinning || spinsRemaining <= 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);
    setShowContinueButton(false);

    // Start haptic feedback during spin
    hapticIntervalRef.current = setInterval(() => {
      selectionChanged();
    }, 150);

    const isSecondSpin = spinsRemaining === 1;
    
    // Calculate target rotation
    // First spin: lands on "Nada" (segment 1, at 67.5°)
    // Second spin: lands on "3 días" (segment 2, at 112.5°)
    const baseRotation = rotation;
    const spins = isSecondSpin ? 6 : 5; // More dramatic second spin
    const targetSegmentIndex = isSecondSpin ? 2 : 1; // 3 días or Nada
    // The indicator is at top (0°), so we need to calculate where segment center lands
    const segmentCenter = targetSegmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const targetAngle = 360 - segmentCenter + (Math.random() * 10 - 5); // Small randomness
    
    const totalRotation = baseRotation + (spins * 360) + targetAngle;
    
    // Animate rotation
    setRotation(totalRotation);

    // Wait for animation to complete
    const spinDuration = isSecondSpin ? 5000 : 4000;
    
    setTimeout(() => {
      // Clear haptic interval
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }

      setIsSpinning(false);
      setSpinsRemaining(prev => prev - 1);

      if (isSecondSpin) {
        // WIN! 3 days
        successNotification();
        celebrationPattern();
        setResult(language === 'es' ? '3 días' : '3 days');
        setShowResult(true);
        
        // Confetti explosion
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a3e635', '#22d3ee', '#facc15', '#f472b6'],
        });

        // Show continue button as fallback
        setTimeout(() => {
          setShowContinueButton(true);
        }, 1000);

        // Navigate after celebration (with longer delay for iPad)
        setTimeout(() => {
          navigate('/trial-won', { replace: true });
        }, 2500);
      } else {
        // First spin - lose
        warningNotification();
        setResult(language === 'es' ? 'Nada' : 'Nothing');
        setShowResult(true);
      }
    }, spinDuration);
  };

  const handleContinue = () => {
    navigate('/trial-won', { replace: true });
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%)',
        paddingTop: 'env(safe-area-inset-top, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
      }}
    >
      {/* Floating particles - reduced for tablets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{ 
              x: Math.random() * 400, 
              y: Math.random() * 800,
              opacity: 0.3 
            }}
            animate={{ 
              y: [null, Math.random() * -200 - 100],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
      >
        {t.title}
      </motion.h1>

      {/* Roulette Container */}
      <div className="relative mb-8">
        {/* Indicator Triangle */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg"
          />
        </div>

        {/* Wheel */}
        <motion.div
          className="relative w-64 h-64 rounded-full shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning 
              ? `transform ${spinsRemaining === 1 ? '5s' : '4s'} cubic-bezier(0.17, 0.67, ${spinsRemaining === 1 ? '0.05' : '0.12'}, 0.99)`
              : 'none',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {SEGMENTS.map((segment, i) => {
              const startAngle = i * SEGMENT_ANGLE;
              const endAngle = (i + 1) * SEGMENT_ANGLE;
              const midAngle = (startAngle + endAngle) / 2;
              
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 100 + 100 * Math.cos(startRad);
              const y1 = 100 + 100 * Math.sin(startRad);
              const x2 = 100 + 100 * Math.cos(endRad);
              const y2 = 100 + 100 * Math.sin(endRad);
              
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
              
              const textRad = (midAngle - 90) * (Math.PI / 180);
              const textX = 100 + 60 * Math.cos(textRad);
              const textY = 100 + 60 * Math.sin(textRad);

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={segment.color}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground font-bold text-[10px]"
                    style={{ 
                      transform: `rotate(${midAngle}deg)`,
                      transformOrigin: `${textX}px ${textY}px`,
                    }}
                  >
                    {language === 'es' ? segment.label : segment.labelEn}
                  </text>
                </g>
              );
            })}
            {/* Center circle */}
            <circle cx="100" cy="100" r="20" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle cx="100" cy="100" r="8" fill="hsl(var(--primary))" />
          </svg>
        </motion.div>
      </div>

      {/* Result message */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 text-center"
        >
          <p className={`text-xl font-bold ${result === 'Nada' || result === 'Nothing' ? 'text-muted-foreground' : 'text-primary'}`}>
            {result === 'Nada' || result === 'Nothing' ? t.almost : `${t.won} ${result}`}
          </p>
        </motion.div>
      )}

      {/* Spin Button */}
      <motion.button
        onClick={handleSpin}
        disabled={isSpinning || spinsRemaining <= 0}
        whileTap={{ scale: 0.95 }}
        animate={!isSpinning && spinsRemaining > 0 ? {
          boxShadow: ['0 0 0px rgba(163, 230, 53, 0)', '0 0 30px rgba(163, 230, 53, 0.5)', '0 0 0px rgba(163, 230, 53, 0)'],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🎰
            </motion.span>
            {language === 'es' ? 'Girando...' : 'Spinning...'}
          </span>
        ) : spinsRemaining === 2 ? (
          t.spin
        ) : spinsRemaining === 1 ? (
          t.spinAgain
        ) : (
          language === 'es' ? 'Sin intentos' : 'No spins left'
        )}
      </motion.button>

      {/* Continue button fallback for iPad */}
      {showContinueButton && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleContinue}
          className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg"
        >
          {t.continue}
        </motion.button>
      )}

      {/* Spins remaining indicator */}
      <p className="mt-4 text-sm text-muted-foreground">
        {language === 'es' 
          ? `${spinsRemaining} intento${spinsRemaining !== 1 ? 's' : ''} restante${spinsRemaining !== 1 ? 's' : ''}`
          : `${spinsRemaining} spin${spinsRemaining !== 1 ? 's' : ''} remaining`
        }
      </p>

      {/* Mascot */}
      <motion.img
        src={mascotHappy}
        alt="Chefly"
        className="absolute bottom-20 right-4 w-20 h-20 object-contain"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
};

export default FreeTrialRoulette;
