import { useLanguage } from '@/contexts/LanguageContext';
import { useAiUsage } from '@/hooks/useAiUsage';
import { Progress } from '@/components/ui/progress';
import { Sparkles, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiUsageIndicatorProps {
  userId: string | undefined;
  compact?: boolean;
  showDetails?: boolean;
}

export const AiUsageIndicator = ({ userId, compact = false, showDetails = false }: AiUsageIndicatorProps) => {
  const { language } = useLanguage();
  const { 
    percentUsed, 
    isLimitReached, 
    usedFormatted, 
    limitFormatted,
    chatCount,
    scanCount,
    cachedScanCount,
    shoppingCount,
    isLoading 
  } = useAiUsage(userId);

  const texts = {
    es: {
      title: 'Uso de IA este mes',
      limit: 'Límite mensual',
      warning: 'Cerca del límite',
      reached: 'Límite alcanzado',
      chats: 'Mensajes de chat',
      scans: 'Escaneos de comida',
      cached: 'Escaneos cacheados',
      shopping: 'Listas de compras',
      resetsOn: 'Se reinicia el 1 de cada mes',
    },
    en: {
      title: 'AI usage this month',
      limit: 'Monthly limit',
      warning: 'Near limit',
      reached: 'Limit reached',
      chats: 'Chat messages',
      scans: 'Food scans',
      cached: 'Cached scans',
      shopping: 'Shopping lists',
      resetsOn: 'Resets on the 1st of each month',
    },
  };

  const t = texts[language];

  if (isLoading) {
    return null;
  }

  const isWarning = percentUsed >= 80 && !isLimitReached;
  
  // Determine progress bar color
  const getProgressColor = () => {
    if (isLimitReached) return 'bg-destructive';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-primary';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-medium",
            isLimitReached && "text-destructive",
            isWarning && "text-yellow-600"
          )}>
            {usedFormatted}
          </span>
          <span className="text-muted-foreground">/ {limitFormatted}</span>
        </div>
        {isLimitReached && <XCircle className="h-4 w-4 text-destructive" />}
        {isWarning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">{t.title}</span>
        </div>
        {isLimitReached && (
          <div className="flex items-center gap-1 text-destructive text-sm">
            <XCircle className="h-4 w-4" />
            <span>{t.reached}</span>
          </div>
        )}
        {isWarning && (
          <div className="flex items-center gap-1 text-yellow-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{t.warning}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={cn(
            isLimitReached && "text-destructive font-medium",
            isWarning && "text-yellow-600 font-medium"
          )}>
            {usedFormatted}
          </span>
          <span className="text-muted-foreground">{limitFormatted}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getProgressColor()
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {showDetails && (
        <div className="pt-2 border-t space-y-1.5 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>{t.chats}</span>
            <span>{chatCount}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.scans}</span>
            <span>{scanCount}</span>
          </div>
          {cachedScanCount > 0 && (
            <div className="flex justify-between">
              <span>{t.cached}</span>
              <span className="text-green-600">+{cachedScanCount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t.shopping}</span>
            <span>{shoppingCount}</span>
          </div>
          <p className="text-xs pt-1 text-muted-foreground/70">{t.resetsOn}</p>
        </div>
      )}
    </div>
  );
};
