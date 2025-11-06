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
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid gap-4 lg:grid-cols-2">
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
                        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/50 shadow-md hover:shadow-lg' 
                        : 'bg-muted/30 opacity-70 hover:opacity-90'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div 
                          className={`text-5xl shrink-0 ${
                            !isUnlocked && 'grayscale opacity-50'
                          }`}
                        >
                          {isUnlocked ? achievement.icon : <Lock className="w-12 h-12 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-lg mb-2 ${
                            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant={isUnlocked ? "default" : "outline"} 
                              className="text-sm px-3 py-1"
                            >
                              +{achievement.points_reward} pts
                            </Badge>
                            {isUnlocked && (
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                ✓ Desbloqueado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
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
