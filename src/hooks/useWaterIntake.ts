import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WaterIntakeData {
  glasses: number;
  dailyGoal: number;
}

export function useWaterIntake(userId: string | undefined, selectedDate: Date) {
  const [data, setData] = useState<WaterIntakeData>({ glasses: 0, dailyGoal: 8 });
  const [loading, setLoading] = useState(true);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchWaterIntake = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: intake, error } = await supabase
        .from("water_intake")
        .select("glasses, daily_goal")
        .eq("user_id", userId)
        .eq("intake_date", dateStr)
        .maybeSingle();

      if (error) throw error;

      if (intake) {
        setData({ glasses: intake.glasses, dailyGoal: intake.daily_goal });
      } else {
        setData({ glasses: 0, dailyGoal: 8 });
      }
    } catch (err) {
      console.error("Error fetching water intake:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, dateStr]);

  useEffect(() => {
    fetchWaterIntake();
  }, [fetchWaterIntake]);

  const addGlass = useCallback(async () => {
    if (!userId) return;

    const newGlasses = data.glasses + 1;

    try {
      const { error } = await supabase
        .from("water_intake")
        .upsert(
          {
            user_id: userId,
            intake_date: dateStr,
            glasses: newGlasses,
            daily_goal: data.dailyGoal,
          },
          { onConflict: "user_id,intake_date" }
        );

      if (error) throw error;

      setData((prev) => ({ ...prev, glasses: newGlasses }));
    } catch (err) {
      console.error("Error adding glass:", err);
    }
  }, [userId, dateStr, data]);

  const removeGlass = useCallback(async () => {
    if (!userId || data.glasses <= 0) return;

    const newGlasses = data.glasses - 1;

    try {
      const { error } = await supabase
        .from("water_intake")
        .upsert(
          {
            user_id: userId,
            intake_date: dateStr,
            glasses: newGlasses,
            daily_goal: data.dailyGoal,
          },
          { onConflict: "user_id,intake_date" }
        );

      if (error) throw error;

      setData((prev) => ({ ...prev, glasses: newGlasses }));
    } catch (err) {
      console.error("Error removing glass:", err);
    }
  }, [userId, dateStr, data]);

  const setDailyGoal = useCallback(async (goal: number) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("water_intake")
        .upsert(
          {
            user_id: userId,
            intake_date: dateStr,
            glasses: data.glasses,
            daily_goal: goal,
          },
          { onConflict: "user_id,intake_date" }
        );

      if (error) throw error;

      setData((prev) => ({ ...prev, dailyGoal: goal }));
    } catch (err) {
      console.error("Error setting daily goal:", err);
    }
  }, [userId, dateStr, data.glasses]);

  return {
    glasses: data.glasses,
    dailyGoal: data.dailyGoal,
    loading,
    addGlass,
    removeGlass,
    setDailyGoal,
    refetch: fetchWaterIntake,
  };
}
