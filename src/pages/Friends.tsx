import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/hooks/useFriendships";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FriendCard } from "@/components/friends/FriendCard";
import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { Users, UserPlus, Loader2 } from "lucide-react";

const Friends = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  if (loading || trialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
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

        {/* Profile Settings */}
        <ProfileSettings />

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
