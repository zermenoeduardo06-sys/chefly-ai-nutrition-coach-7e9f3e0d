import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/hooks/useFriendships";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FriendCard } from "@/components/friends/FriendCard";
import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { Users, UserPlus, Loader2, Lock, Zap, Crown } from "lucide-react";

const Friends = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriendships();

  const [userId, setUserId] = useState<string | null>(null);
  const { limits } = useSubscriptionLimits(userId || undefined);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  if (loading || trialLoading || limits.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  // Show locked screen for free users
  if (!limits.isCheflyPlus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("friends.title")}
            </h1>
          </div>

          {/* Locked Feature Card */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {language === 'es' ? 'Función exclusiva de Chefly Plus' : 'Chefly Plus exclusive feature'}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-foreground mb-2">
                {language === 'es' ? 'Sistema de Amigos' : 'Friends System'}
              </h2>
              
              <p className="text-muted-foreground max-w-md mb-6">
                {language === 'es' 
                  ? 'Conecta con amigos, compara tu progreso y compitan juntos para alcanzar sus metas nutricionales.'
                  : 'Connect with friends, compare your progress and compete together to reach your nutritional goals.'
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-lg">
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'es' ? 'Agrega amigos' : 'Add friends'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'es' ? 'Compara stats' : 'Compare stats'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <Crown className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'es' ? 'Compite' : 'Compete'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => navigate("/pricing")}
                size="lg"
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {language === 'es' ? 'Mejorar a Chefly Plus' : 'Upgrade to Chefly Plus'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const acceptedFriends = friends.filter(f => f.status === "accepted");
  const sentRequests = friends.filter(f => f.status === "pending" && f.isRequester);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              {t("friends.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("friends.subtitle")}
            </p>
          </div>
          <AddFriendDialog onSendRequest={sendFriendRequest} />
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                {t("friends.pendingRequests")}
                <Badge variant="secondary" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  isPending
                  onAccept={() => acceptFriendRequest(friend.id)}
                  onReject={() => rejectFriendRequest(friend.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="gap-2">
              {t("friends.myFriends")}
              {acceptedFriends.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {acceptedFriends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              {t("friends.sentRequests")}
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4 space-y-3">
            {acceptedFriends.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {t("friends.noFriends")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("friends.noFriendsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              acceptedFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  currentUserId={userId || undefined}
                  onRemove={() => removeFriend(friend.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-3">
            {sentRequests.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {t("friends.noSentRequests")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {t("friends.noSentRequestsDesc")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onRemove={() => removeFriend(friend.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
