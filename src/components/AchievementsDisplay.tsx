import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

interface AchievementsDisplayProps {
  achievements: Achievement[];
  unlockedAchievements: Set<string>;
}

export const AchievementsDisplay = ({ achievements, unlockedAchievements }: AchievementsDisplayProps) => {
  const { t } = useLanguage();
  
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.requirement_value - b.requirement_value;
  });

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <span className="text-xl md:text-2xl">🏆</span>
          {t('achievements.title')}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('achievements.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <ScrollArea className="h-[450px] md:h-[500px]">
          <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2 pr-2 md:pr-4">
            {sortedAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.has(achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-md' 
                        : 'bg-muted/30 opacity-70'
                    }`}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div 
                          className={`text-3xl md:text-5xl shrink-0 ${
                            !isUnlocked && 'grayscale opacity-50'
                          }`}
                        >
                          {isUnlocked ? achievement.icon : <Lock className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-base md:text-lg mb-1 md:mb-2 ${
                            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={isUnlocked ? "default" : "outline"} 
                              className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1"
                            >
                              +{achievement.points_reward} pts
                            </Badge>
                            {isUnlocked && (
                              <Badge variant="secondary" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                                ✓ {t('achievements.unlocked')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
