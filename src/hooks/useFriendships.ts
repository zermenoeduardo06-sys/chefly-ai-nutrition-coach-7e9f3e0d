import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Json } from "@/integrations/supabase/types";

export interface Friend {
  id: string;
  friendId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarConfig: Json | null;
  status: "pending" | "accepted" | "rejected" | "blocked";
  isRequester: boolean;
}

export function useFriendships() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchFriendships = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendships) {
        setFriends([]);
        setPendingRequests([]);
        return;
      }

      // Get all related user IDs
      const userIds = new Set<string>();
      friendships.forEach((f) => {
        userIds.add(f.user_id);
        userIds.add(f.friend_id);
      });
      userIds.delete(user.id);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url, avatar_config")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const allFriends: Friend[] = [];
      const pending: Friend[] = [];

      friendships.forEach((f) => {
        const isRequester = f.user_id === user.id;
        const otherId = isRequester ? f.friend_id : f.user_id;
        const profile = profileMap.get(otherId);

        const friendData: Friend = {
          id: f.id,
          friendId: otherId,
          email: profile?.email || "",
          displayName: profile?.display_name,
          avatarUrl: profile?.avatar_url,
          avatarConfig: profile?.avatar_config || null,
          status: f.status as Friend["status"],
          isRequester,
        };

        if (f.status === "accepted") {
          allFriends.push(friendData);
        } else if (f.status === "pending" && !isRequester) {
          pending.push(friendData);
        } else if (f.status === "pending" && isRequester) {
          allFriends.push(friendData);
        }
      });

      setFriends(allFriends);
      setPendingRequests(pending);
    } catch (error: any) {
      console.error("Error fetching friendships:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (nickname: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find user by nickname (display_name)
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("display_name", nickname.trim())
        .limit(1);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        toast({
          variant: "destructive",
          title: t("friends.error"),
          description: t("friends.userNotFound"),
        });
        return false;
      }

      const friendId = profiles[0].id;

      if (friendId === user.id) {
        toast({
          variant: "destructive",
          title: t("friends.error"),
          description: t("friends.cannotAddSelf"),
        });
        return false;
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from("friendships")
        .select("id, status")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .limit(1);

      if (existing && existing.length > 0) {
        toast({
          variant: "destructive",
          title: t("friends.error"),
          description: t("friends.alreadyExists"),
        });
        return false;
      }

      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: friendId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: t("friends.requestSent"),
        description: t("friends.requestSentDesc"),
      });

      await fetchFriendships();
      return true;
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      toast({
        variant: "destructive",
        title: t("friends.error"),
        description: error.message,
      });
      return false;
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: t("friends.requestAccepted"),
        description: t("friends.requestAcceptedDesc"),
      });

      await fetchFriendships();
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      toast({
        variant: "destructive",
        title: t("friends.error"),
        description: error.message,
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "rejected" })
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: t("friends.requestRejected"),
      });

      await fetchFriendships();
    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: t("friends.removed"),
      });

      await fetchFriendships();
    } catch (error: any) {
      console.error("Error removing friend:", error);
    }
  };

  useEffect(() => {
    fetchFriendships();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("friendships-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => {
          fetchFriendships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refresh: fetchFriendships,
  };
}
