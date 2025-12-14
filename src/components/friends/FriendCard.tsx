import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserMinus, Check, X, Clock, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Friend } from "@/hooks/useFriendships";
import { useLanguage } from "@/contexts/LanguageContext";
import { FriendStatsComparison } from "./FriendStatsComparison";
import { getAvatarColor, getInitials } from "@/lib/avatarColors";
import ModularAvatar from "@/components/avatar/ModularAvatar";
import { AvatarConfig } from "@/components/avatar/AvatarParts";

interface FriendCardProps {
  friend: Friend;
  currentUserId?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
  isPending?: boolean;
}

export function FriendCard({ friend, currentUserId, onAccept, onReject, onRemove, isPending }: FriendCardProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const avatarColor = getAvatarColor(friend.displayName || friend.friendId);

  const displayName = friend.displayName || t("friends.anonymous");
  const canCompare = friend.status === "accepted" && currentUserId;
  
  const hasModularAvatar = friend.avatarConfig && !friend.avatarUrl;

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {hasModularAvatar ? (
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <ModularAvatar config={friend.avatarConfig as unknown as AvatarConfig} size={48} />
                </div>
              ) : (
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={friend.avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className={`${avatarColor} text-white font-semibold`}>
                    {getInitials(friend.displayName)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">@{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isPending ? (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={onAccept}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("friends.accept")}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("friends.reject")}</span>
                  </Button>
                </>
              ) : friend.status === "pending" && friend.isRequester ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{t("friends.pending")}</span>
                </div>
              ) : (
                <>
                  {canCompare && (
                    <CollapsibleTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("friends.compare")}</span>
                        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRemove}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
        
        {canCompare && (
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <FriendStatsComparison friend={friend} currentUserId={currentUserId} />
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </Card>
  );
}
