import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Footprints, Flame, Scale, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppleHealth } from '@/hooks/useAppleHealth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AppleHealthCardProps {
  onConnect?: () => void;
  className?: string;
}

export const AppleHealthCard: React.FC<AppleHealthCardProps> = ({ onConnect, className }) => {
  const { t, language } = useLanguage();
  const {
    isHealthAvailable,
    isAuthorized,
    isLoading,
    steps,
    activeCalories,
    weight,
    lastSync,
    requestAuthorization,
    syncData,
    disconnectHealth,
  } = useAppleHealth();

  // Don't render if not on iOS native
  if (!isHealthAvailable) {
    return null;
  }

  const handleConnect = async () => {
    const success = await requestAuthorization();
    if (success && onConnect) {
      onConnect();
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return null;
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return language === 'es' ? 'Ahora' : 'Just now';
    if (minutes < 60) return language === 'es' ? `Hace ${minutes} min` : `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === 'es' ? `Hace ${hours}h` : `${hours}h ago`;
    
    return language === 'es' ? `Hace ${Math.floor(hours / 24)} días` : `${Math.floor(hours / 24)} days ago`;
  };

  if (!isAuthorized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-4 border border-red-500/20",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Apple Health</h3>
            <p className="text-xs text-muted-foreground">
              {language === 'es' ? 'No conectado' : 'Not connected'}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'es' 
            ? 'Conecta Apple Health para sincronizar tus pasos, calorías quemadas y peso automáticamente.'
            : 'Connect Apple Health to sync your steps, burned calories, and weight automatically.'}
        </p>

        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Heart className="w-4 h-4 mr-2" />
          )}
          {language === 'es' ? 'Conectar Apple Health' : 'Connect Apple Health'}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-4 border border-red-500/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Apple Health</h3>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <Check className="w-3 h-3" />
              {language === 'es' ? 'Conectado' : 'Connected'}
            </div>
          </div>
        </div>
        
        <button
          onClick={syncData}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-background/50 rounded-xl p-3 text-center">
          <Footprints className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">
            {steps !== null ? steps.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === 'es' ? 'Pasos' : 'Steps'}
          </p>
        </div>

        <div className="bg-background/50 rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">
            {activeCalories !== null ? activeCalories.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === 'es' ? 'Calorías' : 'Calories'}
          </p>
        </div>

        <div className="bg-background/50 rounded-xl p-3 text-center">
          <Scale className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">
            {weight !== null ? `${weight}` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">kg</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          {formatLastSync()}
        </p>
        <button
          onClick={disconnectHealth}
          className="text-xs text-red-500 hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {language === 'es' ? 'Desconectar' : 'Disconnect'}
        </button>
      </div>
    </motion.div>
  );
};
