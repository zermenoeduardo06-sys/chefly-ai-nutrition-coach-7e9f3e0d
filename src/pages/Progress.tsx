import { NutritionProgressCharts } from "@/components/NutritionProgressCharts";

const Progress = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6">
        <NutritionProgressCharts />
      </main>
    </div>
  );
};

export default Progress;
