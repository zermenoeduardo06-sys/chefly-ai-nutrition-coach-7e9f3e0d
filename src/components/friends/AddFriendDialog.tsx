import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddFriendDialogProps {
  onSendRequest: (nickname: string) => Promise<boolean>;
}

export function AddFriendDialog({ onSendRequest }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    const success = await onSendRequest(nickname);
    setLoading(false);

    if (success) {
      setNickname("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t("friends.addFriend")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("friends.addFriend")}</DialogTitle>
            <DialogDescription>
              {t("friends.addFriendDescNickname")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">{t("friends.friendNickname")}</Label>
              <Input
                id="nickname"
                type="text"
                placeholder={t("friends.nicknamePlaceholder")}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !nickname.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("common.loading")}
                </>
              ) : (
                t("friends.sendRequest")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
