import { DailyChallenges } from "@/components/DailyChallenges";

const Challenges = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6">
        <DailyChallenges />
      </main>
    </div>
  );
};

export default Challenges;
