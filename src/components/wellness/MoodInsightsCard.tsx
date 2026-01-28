import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Lightbulb, ChevronRight, Lock, Brain, Utensils, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { WellnessInsight } from "@/hooks/useWellness";

interface MoodInsightsCardProps {
  insights: WellnessInsight[];
  isCheflyPlus: boolean;
  onGenerateInsights?: () => void;
  isGenerating?: boolean;
  onMarkAsRead?: (insightId: string) => void;
}

const insightIcons: { [key: string]: any } = {
  mood_food: Utensils,
  mood_trend: TrendingUp,
  mood_pattern: Brain,
  general: Lightbulb,
};

export function MoodInsightsCard({ 
  insights, 
  isCheflyPlus,
  onGenerateInsights,
  isGenerating = false,
  onMarkAsRead,
}: MoodInsightsCardProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const texts = {
    es: {
      title: 'Insights de IA',
      subtitle: 'Patrones entre tu alimentación y ánimo',
      generateInsights: 'Analizar patrones',
      noInsights: 'Registra tu ánimo durante 7 días para obtener insights personalizados',
      premiumRequired: 'Función Premium',
      upgradeText: 'Desbloquea análisis de IA que conecta tu alimentación con tu estado de ánimo',
      upgrade: 'Obtener Chefly Plus',
      new: 'Nuevo',
      analyzing: 'Analizando...',
    },
    en: {
      title: 'AI Insights',
      subtitle: 'Patterns between your food and mood',
      generateInsights: 'Analyze patterns',
      noInsights: 'Log your mood for 7 days to get personalized insights',
      premiumRequired: 'Premium Feature',
      upgradeText: 'Unlock AI analysis that connects your food with your mood',
      upgrade: 'Get Chefly Plus',
      new: 'New',
      analyzing: 'Analyzing...',
    },
  };
  const t = texts[language];

  // If not premium, show upgrade prompt
  if (!isCheflyPlus) {
    return (
      <Card3D variant="elevated">
        <Card3DContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Lock className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  {t.title}
                  <Badge className="bg-amber-500/20 text-amber-500 border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Plus
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.upgradeText}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => navigate('/premium-paywall')}
              >
                {t.upgrade}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    );
  }

  return (
    <Card3D variant="default">
      <Card3DHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon3D icon={Brain} color="primary" size="md" />
            <div>
              <h3 className="font-bold">{t.title}</h3>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          {onGenerateInsights && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateInsights}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                  </motion.div>
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  {t.generateInsights}
                </>
              )}
            </Button>
          )}
        </div>
      </Card3DHeader>
      <Card3DContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noInsights}</p>
          </div>
        ) : (
          <AnimatePresence>
            {insights.slice(0, 3).map((insight, index) => {
              const InsightIcon = insightIcons[insight.insight_type] || Lightbulb;
              const isExpanded = expandedInsight === insight.id;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => {
                    setExpandedInsight(isExpanded ? null : insight.id);
                    if (!insight.is_read) {
                      onMarkAsRead?.(insight.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <InsightIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                        {!insight.is_read && (
                          <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
                            {t.new}
                          </Badge>
                        )}
                      </div>
                      <AnimatePresence>
                        {isExpanded ? (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-muted-foreground mt-2"
                          >
                            {insight.description}
                          </motion.p>
                        ) : (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {insight.description}
                          </p>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Card3DContent>
    </Card3D>
  );
}
