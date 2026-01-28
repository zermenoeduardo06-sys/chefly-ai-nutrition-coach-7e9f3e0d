import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface BodyTypeIndicatorProps {
  bodyType: string;
  size?: 'sm' | 'md' | 'lg';
}

const bodyTypeColors: { [key: string]: string } = {
  ectomorfo: 'from-sky-500 to-cyan-500',
  ectomorph: 'from-sky-500 to-cyan-500',
  mesomorfo: 'from-emerald-500 to-green-500',
  mesomorph: 'from-emerald-500 to-green-500',
  endomorfo: 'from-amber-500 to-orange-500',
  endomorph: 'from-amber-500 to-orange-500',
  combinado: 'from-violet-500 to-purple-500',
  combined: 'from-violet-500 to-purple-500',
};

export function BodyTypeIndicator({ bodyType, size = 'md' }: BodyTypeIndicatorProps) {
  const { language } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-20 h-32',
    lg: 'w-28 h-44',
  };

  const bodyTypeKey = bodyType.toLowerCase();
  const gradientClass = bodyTypeColors[bodyTypeKey] || 'from-gray-400 to-gray-500';

  // Different silhouette shapes based on body type
  const getShapeStyle = () => {
    switch (bodyTypeKey) {
      case 'ectomorfo':
      case 'ectomorph':
        // Lean, narrow build
        return {
          shoulderWidth: '60%',
          waistWidth: '45%',
          hipWidth: '55%',
        };
      case 'mesomorfo':
      case 'mesomorph':
        // Athletic, V-shaped
        return {
          shoulderWidth: '90%',
          waistWidth: '55%',
          hipWidth: '70%',
        };
      case 'endomorfo':
      case 'endomorph':
        // Wider, rounder build
        return {
          shoulderWidth: '75%',
          waistWidth: '80%',
          hipWidth: '85%',
        };
      default:
        // Balanced
        return {
          shoulderWidth: '75%',
          waistWidth: '60%',
          hipWidth: '70%',
        };
    }
  };

  const shape = getShapeStyle();

  const texts = {
    es: {
      ectomorfo: 'Ectomorfo',
      mesomorfo: 'Mesomorfo', 
      endomorfo: 'Endomorfo',
      combinado: 'Combinado',
    },
    en: {
      ectomorph: 'Ectomorph',
      mesomorph: 'Mesomorph',
      endomorph: 'Endomorph',
      combined: 'Combined',
    },
  };

  const displayName = language === 'es' 
    ? texts.es[bodyTypeKey as keyof typeof texts.es] || bodyType
    : texts.en[bodyTypeKey as keyof typeof texts.en] || bodyType;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      >
        {/* Stylized body silhouette using CSS shapes */}
        <svg viewBox="0 0 100 160" className="w-full h-full">
          <defs>
            <linearGradient id={`bodyGradient-${bodyTypeKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className={`${gradientClass.split(' ')[0].replace('from-', 'stop-')}`} style={{ stopColor: 'currentColor' }} />
              <stop offset="100%" className={`${gradientClass.split(' ')[1].replace('to-', 'stop-')}`} style={{ stopColor: 'currentColor' }} />
            </linearGradient>
          </defs>
          
          {/* Head */}
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            cx="50"
            cy="20"
            r="14"
            className={`fill-current bg-gradient-to-b ${gradientClass}`}
            style={{ fill: `url(#bodyGradient-${bodyTypeKey})` }}
          />
          
          {/* Body shape */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            d={`
              M ${50 - parseInt(shape.shoulderWidth) / 2} 40
              Q ${50 - parseInt(shape.waistWidth) / 2 - 5} 80 ${50 - parseInt(shape.waistWidth) / 2} 90
              Q ${50 - parseInt(shape.hipWidth) / 2 - 3} 100 ${50 - parseInt(shape.hipWidth) / 2} 120
              L ${50 - parseInt(shape.hipWidth) / 2 + 10} 155
              L ${50 - 5} 155
              L ${50} 130
              L ${50 + 5} 155
              L ${50 + parseInt(shape.hipWidth) / 2 - 10} 155
              L ${50 + parseInt(shape.hipWidth) / 2} 120
              Q ${50 + parseInt(shape.hipWidth) / 2 + 3} 100 ${50 + parseInt(shape.waistWidth) / 2} 90
              Q ${50 + parseInt(shape.waistWidth) / 2 + 5} 80 ${50 + parseInt(shape.shoulderWidth) / 2} 40
              Q 50 35 ${50 - parseInt(shape.shoulderWidth) / 2} 40
            `}
            style={{ fill: `url(#bodyGradient-${bodyTypeKey})` }}
          />
          
          {/* Arms */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            d={`
              M ${50 - parseInt(shape.shoulderWidth) / 2 - 2} 42
              Q ${50 - parseInt(shape.shoulderWidth) / 2 - 15} 70 ${50 - parseInt(shape.shoulderWidth) / 2 - 12} 95
              L ${50 - parseInt(shape.shoulderWidth) / 2 - 5} 95
              Q ${50 - parseInt(shape.shoulderWidth) / 2 - 8} 70 ${50 - parseInt(shape.shoulderWidth) / 2 + 5} 50
            `}
            style={{ fill: `url(#bodyGradient-${bodyTypeKey})` }}
          />
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            d={`
              M ${50 + parseInt(shape.shoulderWidth) / 2 + 2} 42
              Q ${50 + parseInt(shape.shoulderWidth) / 2 + 15} 70 ${50 + parseInt(shape.shoulderWidth) / 2 + 12} 95
              L ${50 + parseInt(shape.shoulderWidth) / 2 + 5} 95
              Q ${50 + parseInt(shape.shoulderWidth) / 2 + 8} 70 ${50 + parseInt(shape.shoulderWidth) / 2 - 5} 50
            `}
            style={{ fill: `url(#bodyGradient-${bodyTypeKey})` }}
          />
        </svg>
      </motion.div>
      
      <span className={`text-xs font-medium bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
        {displayName}
      </span>
    </div>
  );
}
