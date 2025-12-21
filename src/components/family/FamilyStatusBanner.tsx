import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamily } from "@/hooks/useFamily";
import { useFamilyMealPlan } from "@/hooks/useFamilyMealPlan";
import { motion } from "framer-motion";
import { Users, Crown, ChevronRight, Sparkles, Utensils, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ModularAvatar from "@/components/avatar/ModularAvatar";

interface FamilyStatusBannerProps {
  userId: string | undefined;
  onPlanGenerated?: () => void;
}

export const FamilyStatusBanner = ({ userId, onPlanGenerated }: FamilyStatusBannerProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { family, members, isOwner, isLoading } = useFamily(userId);
  const { 
    hasFamilyMealPlan, 
    generating, 
    generateFamilyMealPlan,
    mealPlan,
    loading: planLoading 
  } = useFamilyMealPlan(userId);

  // Don't show anything while loading or if user is not in a family
  if (isLoading || !family) return null;

  const ownerMember = members.find(m => m.role === "owner");
  const remainingCount = members.length > 4 ? members.length - 4 : 0;

  const handleGenerateFamilyPlan = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await generateFamilyMealPlan(language);
    
    if (result.success) {
      toast({
        title: language === "es" ? "¡Plan familiar generado!" : "Family plan generated!",
        description: language === "es" 
          ? "El plan considera las preferencias de todos los miembros" 
          : "The plan considers all members' preferences",
      });
      onPlanGenerated?.();
    } else {
      toast({
        variant: "destructive",
        title: language === "es" ? "Error" : "Error",
        description: result.error,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-4"
    >
      {/* Header - Clickable to go to family management */}
      <div 
        className="flex items-center justify-between gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/family")}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Family icon */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 text-white" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {family.name}
              </h3>
              {isOwner && (
                <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {members.length} {language === "es" ? "miembro" : "member"}{members.length > 1 ? "s" : ""}
              {isOwner && (language === "es" ? " · Administrador" : " · Admin")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="hidden sm:flex -space-x-2">
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.id}
                className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
                style={{ zIndex: 4 - index }}
              >
                {member.profile?.avatar_config ? (
                  <ModularAvatar config={member.profile.avatar_config} size={28} />
                ) : (
                  <Users className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
            {remainingCount > 0 && (
              <div 
                className="h-7 w-7 rounded-full border-2 border-background bg-violet-500 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ zIndex: 0 }}
              >
                +{remainingCount}
              </div>
            )}
          </div>
          
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>

      {/* Family Meal Plan Section */}
      <div className="mt-4 pt-4 border-t border-violet-500/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Utensils className="h-4 w-4 text-violet-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {language === "es" ? "Plan de comidas familiar" : "Family meal plan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasFamilyMealPlan 
                  ? (language === "es" 
                      ? "Considera las preferencias de todos" 
                      : "Considers everyone's preferences")
                  : (language === "es" 
                      ? "Genera un plan adaptado a toda la familia" 
                      : "Generate a plan adapted to the whole family")
                }
              </p>
            </div>
          </div>
          
          {planLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          ) : hasFamilyMealPlan ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">
                  {language === "es" ? "Activo" : "Active"}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-violet-600 hover:text-violet-700 hover:bg-violet-500/10"
                onClick={handleGenerateFamilyPlan}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-xs h-8 gap-1.5"
              onClick={handleGenerateFamilyPlan}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{language === "es" ? "Generando..." : "Generating..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{language === "es" ? "Generar plan" : "Generate plan"}</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Show what family plan includes */}
        {!hasFamilyMealPlan && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{language === "es" ? "Alergias respetadas" : "Allergies respected"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{language === "es" ? "Gustos combinados" : "Combined tastes"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{language === "es" ? "Variantes por persona" : "Variants per person"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>{language === "es" ? "Lista de compras unificada" : "Unified shopping list"}</span>
            </div>
          </div>
        )}

        {/* Info for members who don't have the plan yet */}
        {!isOwner && !hasFamilyMealPlan && (
          <p className="mt-3 text-xs text-violet-600 dark:text-violet-400">
            {language === "es" 
              ? "💡 Cualquier miembro puede generar el plan familiar" 
              : "💡 Any member can generate the family plan"}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default FamilyStatusBanner;
