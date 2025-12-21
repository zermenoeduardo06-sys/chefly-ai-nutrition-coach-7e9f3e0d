import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamily } from "@/hooks/useFamily";
import { motion } from "framer-motion";
import { Users, Crown, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModularAvatar from "@/components/avatar/ModularAvatar";

interface FamilyStatusBannerProps {
  userId: string | undefined;
}

export const FamilyStatusBanner = ({ userId }: FamilyStatusBannerProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { family, members, isOwner, isLoading } = useFamily(userId);

  // Don't show anything while loading or if user is not in a family
  if (isLoading || !family) return null;

  const ownerMember = members.find(m => m.role === "owner");
  const otherMembers = members.filter(m => m.role !== "owner").slice(0, 3);
  const remainingCount = members.length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-4 cursor-pointer hover:border-violet-500/40 transition-colors"
      onClick={() => navigate("/family")}
    >
      <div className="flex items-center justify-between gap-3">
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
              {isOwner 
                ? (language === "es" 
                    ? `Eres el administrador · ${members.length} miembro${members.length > 1 ? 's' : ''}` 
                    : `You're the admin · ${members.length} member${members.length > 1 ? 's' : ''}`)
                : (language === "es" 
                    ? `Plan compartido por ${ownerMember?.profile?.display_name || 'el admin'}` 
                    : `Plan shared by ${ownerMember?.profile?.display_name || 'admin'}`)
              }
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

      {/* Benefits reminder for members */}
      {!isOwner && (
        <div className="mt-3 pt-3 border-t border-violet-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
            <p className="text-xs text-violet-600 dark:text-violet-400">
              {language === "es" 
                ? "Tienes acceso a todos los beneficios premium del plan familiar" 
                : "You have access to all premium benefits from the family plan"}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FamilyStatusBanner;
