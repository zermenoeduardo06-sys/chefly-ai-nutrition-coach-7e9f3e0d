import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserMinus, Check, X, Clock } from "lucide-react";
import { Friend } from "@/hooks/useFriendships";
import { useLanguage } from "@/contexts/LanguageContext";

interface FriendCardProps {
  friend: Friend;
  onAccept?: () => void;
  onReject?: () => void;
  onRemove?: () => void;
  isPending?: boolean;
}

export function FriendCard({ friend, onAccept, onReject, onRemove, isPending }: FriendCardProps) {
  const { t } = useLanguage();
  
  const getInitials = (email: string, displayName?: string | null) => {
    if (displayName) {
      return displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const displayName = friend.displayName || friend.email.split("@")[0];

  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={friend.avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(friend.email, friend.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
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
              <Button
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
