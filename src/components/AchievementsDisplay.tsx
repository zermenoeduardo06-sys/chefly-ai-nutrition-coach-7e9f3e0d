import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.requirement_value - b.requirement_value;
  });

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Logros y Medallas
        </CardTitle>
        <CardDescription>
          Desbloquea medallas completando retos
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.has(achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-md' 
                        : 'bg-muted/30 opacity-70 hover:opacity-90'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className={`text-4xl shrink-0 ${
                            !isUnlocked && 'grayscale opacity-50'
                          }`}
                        >
                          {isUnlocked ? achievement.icon : <Lock className="w-10 h-10 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm mb-1 ${
                            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={isUnlocked ? "default" : "outline"} 
                              className="text-xs"
                            >
                              +{achievement.points_reward} pts
                            </Badge>
                            {isUnlocked && (
                              <Badge variant="secondary" className="text-xs">
                                ✓ Desbloqueado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
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
