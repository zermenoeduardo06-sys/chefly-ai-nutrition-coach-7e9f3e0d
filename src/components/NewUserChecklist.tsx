import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Utensils, MessageCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NewUserChecklistProps {
  onDismiss: () => void;
  mealsCompleted: number;
  hasUsedChat: boolean;
  onOpenTutorial?: () => void;
}

const NewUserChecklist = ({ onDismiss, mealsCompleted, hasUsedChat, onOpenTutorial }: NewUserChecklistProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [tutorialSeen, setTutorialSeen] = useState(() => {
    return localStorage.getItem('chefly_tutorial_clicked') === 'true';
  });

  const steps = [
    {
      id: "tutorial",
      icon: Sparkles,
      titleKey: "newUserChecklist.step0.title",
      descKey: "newUserChecklist.step0.desc",
      completed: tutorialSeen,
      action: () => {
        localStorage.setItem('chefly_tutorial_clicked', 'true');
        setTutorialSeen(true);
        onOpenTutorial?.();
      },
    },
    {
      id: "review",
      icon: Utensils,
      titleKey: "newUserChecklist.step1.title",
      descKey: "newUserChecklist.step1.desc",
      completed: true, // They're on the dashboard, so they've reviewed the menu
      action: () => {},
    },
    {
      id: "complete",
      icon: CheckCircle2,
      titleKey: "newUserChecklist.step2.title",
      descKey: "newUserChecklist.step2.desc",
      completed: mealsCompleted > 0,
      action: () => {},
    },
    {
      id: "chat",
      icon: MessageCircle,
      titleKey: "newUserChecklist.step3.title",
      descKey: "newUserChecklist.step3.desc",
      completed: hasUsedChat,
      action: () => navigate("/chat"),
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const allCompleted = completedCount === steps.length;

  useEffect(() => {
    if (allCompleted) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, onDismiss]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 mb-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {t("newUserChecklist.title")}
              <span className="text-xs font-normal text-muted-foreground">
                ({completedCount}/{steps.length})
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">{t("newUserChecklist.subtitle")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={step.action}
              className={`flex-1 flex items-center gap-2 p-2 rounded-lg border transition-all ${
                step.completed
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card/50 border-border/50 hover:border-primary/30 cursor-pointer"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <step.icon className="w-3 h-3" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${step.completed ? "line-through opacity-70" : ""}`}>
                  {t(step.titleKey)}
                </p>
                <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                  {t(step.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {allCompleted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center text-primary mt-3 font-medium"
          >
            {t("newUserChecklist.completed")} 🎉
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NewUserChecklist;
