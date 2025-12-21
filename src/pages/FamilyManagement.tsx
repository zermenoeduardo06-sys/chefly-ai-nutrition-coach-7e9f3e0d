import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFamily } from "@/hooks/useFamily";
import { useSubscription } from "@/hooks/useSubscription";
import { useFamilyMealPlan } from "@/hooks/useFamilyMealPlan";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  Share2, 
  UserMinus, 
  Loader2,
  Crown,
  UserPlus,
  LogOut,
  Edit2,
  Check,
  X,
  Sparkles,
  Utensils,
  ShoppingCart,
  Heart,
  Star,
  ChefHat,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import ModularAvatar from "@/components/avatar/ModularAvatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JoinFamilyDialog } from "@/components/family/JoinFamilyDialog";
import confetti from "canvas-confetti";

const FamilyManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const subscription = useSubscription(userId);
  const {
    family,
    members,
    isOwner,
    isLoading: familyLoading,
    loadFamily,
    removeMember,
    leaveFamily,
    updateFamilyName,
  } = useFamily(userId);

  const {
    hasFamilyMealPlan,
    generating,
    generateFamilyMealPlan,
    mealPlan,
    loading: planLoading,
  } = useFamilyMealPlan(userId);

  const handleGenerateFamilyPlan = async () => {
    const result = await generateFamilyMealPlan(language);
    
    if (result.success) {
      // Celebration confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#D946EF', '#F59E0B', '#10B981'],
      });
      
      toast({
        title: language === "es" ? "¡Plan familiar generado!" : "Family plan generated!",
        description: language === "es" 
          ? "El plan considera las preferencias de todos los miembros" 
          : "The plan considers all members' preferences",
      });
    } else {
      toast({
        variant: "destructive",
        title: language === "es" ? "Error" : "Error",
        description: result.error,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    setLoading(false);
  };

  const handleCopyCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      toast({
        title: language === "es" ? "Código copiado" : "Code copied",
        description: language === "es" 
          ? "El código de invitación se copió al portapapeles" 
          : "Invite code copied to clipboard",
      });
    }
  };

  const handleShare = async () => {
    if (family?.invite_code) {
      const shareText = language === "es"
        ? `¡Únete a mi familia en Chefly! Usa el código: ${family.invite_code}`
        : `Join my family on Chefly! Use code: ${family.invite_code}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Chefly Family",
            text: shareText,
          });
        } catch (error) {
          handleCopyCode();
        }
      } else {
        handleCopyCode();
      }
    }
  };

  const handleSaveName = async () => {
    if (newFamilyName.trim()) {
      const result = await updateFamilyName(newFamilyName.trim());
      if (result.success) {
        toast({
          title: language === "es" ? "Nombre actualizado" : "Name updated",
        });
        setEditingName(false);
      } else {
        toast({
          variant: "destructive",
          title: language === "es" ? "Error" : "Error",
          description: result.error,
        });
      }
    }
  };

  const handleRemoveMember = async () => {
    if (memberToRemove) {
      const result = await removeMember(memberToRemove);
      if (result.success) {
        toast({
          title: language === "es" ? "Miembro eliminado" : "Member removed",
        });
      } else {
        toast({
          variant: "destructive",
          title: language === "es" ? "Error" : "Error",
          description: result.error,
        });
      }
      setMemberToRemove(null);
    }
  };

  const handleLeaveFamily = async () => {
    const result = await leaveFamily();
    if (result.success) {
      toast({
        title: language === "es" ? "Has salido de la familia" : "You left the family",
      });
      navigate("/subscription");
    } else {
      toast({
        variant: "destructive",
        title: language === "es" ? "Error" : "Error",
        description: result.error,
      });
    }
    setShowLeaveDialog(false);
  };

  if (loading || familyLoading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          {language === "es" ? "No perteneces a ninguna familia" : "You don't belong to any family"}
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          {language === "es" 
            ? "Únete a una familia existente o suscríbete al Plan Familiar" 
            : "Join an existing family or subscribe to Family Plan"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowJoinDialog(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {language === "es" ? "Tengo un código" : "I have a code"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/pricing")}>
            {language === "es" ? "Ver planes" : "View plans"}
          </Button>
        </div>

        <JoinFamilyDialog
          open={showJoinDialog}
          onOpenChange={setShowJoinDialog}
          onSuccess={() => {
            loadFamily();
            subscription.checkSubscription();
          }}
        />
      </div>
    );
  }

  const memberCount = members.length;
  const maxMembers = family.max_members || 5;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 overflow-hidden pt-safe-top">
        <div className="relative px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="h-8 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder={family.name}
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleSaveName}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setEditingName(false)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{family.name}</h1>
                  {isOwner && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => {
                        setNewFamilyName(family.name);
                        setEditingName(true);
                      }}
                      className="h-6 w-6 text-white/70 hover:bg-white/20"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-white/70 text-xs">
                {memberCount}/{maxMembers} {language === "es" ? "miembros" : "members"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6 max-w-lg mx-auto">
        {/* Welcome/Benefits Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold text-foreground">
              {language === "es" ? "¿Qué es el Plan Familiar?" : "What is the Family Plan?"}
            </h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {language === "es" 
              ? "El Plan Familiar te permite compartir todos los beneficios premium con hasta 5 personas. El dueño paga y todos disfrutan." 
              : "The Family Plan lets you share all premium benefits with up to 5 people. The owner pays, everyone enjoys."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Utensils className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {language === "es" ? "Planes de comida" : "Meal plans"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {language === "es" ? "Personalizados para cada miembro" : "Personalized for each member"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {language === "es" ? "Lista de compras" : "Shopping list"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {language === "es" ? "Unificada para toda la familia" : "Unified for the whole family"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {language === "es" ? "Preferencias" : "Preferences"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {language === "es" ? "Alergias y gustos respetados" : "Allergies and tastes respected"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {language === "es" ? "Recetas adaptadas" : "Adapted recipes"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {language === "es" ? "Variantes para cada quien" : "Variants for everyone"}
                </p>
              </div>
            </div>
          </div>

          {!isOwner && (
            <div className="mt-4 pt-3 border-t border-violet-500/20">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-foreground">
                  {language === "es" 
                    ? "¡Ya eres parte de esta familia! Tienes acceso a todos los beneficios premium." 
                    : "You're part of this family! You have access to all premium benefits."}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Generate Family Meal Plan Card - Prominent Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {language === "es" ? "Plan de Comidas Familiar" : "Family Meal Plan"}
              </h3>
              <p className="text-white/80 text-sm">
                {language === "es" 
                  ? "Genera un plan para toda la familia" 
                  : "Generate a plan for the whole family"}
              </p>
            </div>
          </div>

          {/* Status or Generation */}
          {planLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : hasFamilyMealPlan ? (
            <div className="space-y-3">
              <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {language === "es" ? "Plan activo" : "Active plan"}
                  </p>
                  <p className="text-white/70 text-xs">
                    {mealPlan?.meals?.length || 0} {language === "es" ? "comidas generadas" : "meals generated"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => navigate("/dashboard")}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  {language === "es" ? "Ver" : "View"}
                </Button>
              </div>
              
              <Button
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={handleGenerateFamilyPlan}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "es" ? "Generando nuevo plan..." : "Generating new plan..."}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "es" ? "Regenerar plan" : "Regenerate plan"}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-sm text-white/90 mb-2">
                  {language === "es" 
                    ? "Este plan considera automáticamente:" 
                    : "This plan automatically considers:"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span>{language === "es" ? "Alergias de todos" : "Everyone's allergies"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span>{language === "es" ? "Tipos de dieta" : "Diet types"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span>{language === "es" ? "Gustos y disgustos" : "Likes and dislikes"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span>{language === "es" ? "Metas nutricionales" : "Nutritional goals"}</span>
                  </div>
                </div>
              </div>
              
              <Button
                className="w-full bg-white text-emerald-600 hover:bg-white/90 font-bold text-base py-6"
                onClick={handleGenerateFamilyPlan}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {language === "es" ? "Generando plan..." : "Generating plan..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {language === "es" ? "Generar Plan Familiar" : "Generate Family Plan"}
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-white/60">
                {language === "es" 
                  ? `Se generarán comidas para ${members.length} miembro${members.length > 1 ? 's' : ''}` 
                  : `Will generate meals for ${members.length} member${members.length > 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </motion.div>

        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {language === "es" ? "Invitar miembros" : "Invite members"}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-lg text-center font-bold tracking-widest">
                {family.invite_code}
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleCopyCode}
                className="h-12 w-12"
              >
                <Copy className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleShare}
                className="h-12 w-12"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {language === "es" 
                ? "Comparte este código con tu familia para que se unan" 
                : "Share this code with your family to join"}
            </p>
          </motion.div>
        )}

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              {language === "es" ? "Miembros de la familia" : "Family members"}
            </h3>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            {language === "es" 
              ? "Todos los miembros comparten los beneficios del plan del administrador." 
              : "All members share the benefits of the admin's plan."}
          </p>

          <div className="space-y-2">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-card border rounded-xl p-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {member.profile?.avatar_config ? (
                    <ModularAvatar
                      config={member.profile.avatar_config}
                      size={40}
                    />
                  ) : (
                    <Users className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {member.profile?.display_name || member.profile?.email?.split("@")[0] || "Usuario"}
                    </p>
                    {member.role === "owner" && (
                      <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.role === "owner" 
                      ? (language === "es" ? "Administrador" : "Admin")
                      : (language === "es" ? "Miembro" : "Member")}
                  </p>
                </div>

                {isOwner && member.role !== "owner" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setMemberToRemove(member.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leave Family Button - Only for members */}
        {!isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {language === "es" ? "Salir de la familia" : "Leave family"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "es" ? "¿Eliminar miembro?" : "Remove member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "es" 
                ? "Este miembro perderá acceso a los beneficios del plan familiar." 
                : "This member will lose access to family plan benefits."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "es" ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
              {language === "es" ? "Eliminar" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Family Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "es" ? "¿Salir de la familia?" : "Leave family?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "es" 
                ? "Perderás acceso a los beneficios del plan familiar." 
                : "You will lose access to family plan benefits."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "es" ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveFamily} className="bg-destructive text-destructive-foreground">
              {language === "es" ? "Salir" : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FamilyManagement;
