import { DailyChallenges } from "@/components/DailyChallenges";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { Loader2 } from "lucide-react";

const Challenges = () => {
  const { isBlocked, isLoading } = useTrialGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6">
        <DailyChallenges />
      </main>
    </div>
  );
};

export default Challenges;
