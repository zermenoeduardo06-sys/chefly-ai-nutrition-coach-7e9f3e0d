import { DailyChallenges } from "@/components/DailyChallenges";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { Loader2 } from "lucide-react";

const Challenges = () => {
  const { isBlocked, isLoading } = useTrialGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return <DailyChallenges />;
};

export default Challenges;
