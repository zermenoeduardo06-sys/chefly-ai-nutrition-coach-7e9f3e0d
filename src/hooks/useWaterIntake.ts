import { useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WaterIntakeData {
  glasses: number;
  dailyGoal: number;
}

const defaultData: WaterIntakeData = { glasses: 0, dailyGoal: 8 };

async function fetchWaterIntake(userId: string, dateStr: string): Promise<WaterIntakeData> {
  const { data: intake, error } = await supabase
    .from("water_intake")
    .select("glasses, daily_goal")
    .eq("user_id", userId)
    .eq("intake_date", dateStr)
    .maybeSingle();

  if (error) throw error;

  return intake
    ? { glasses: intake.glasses, dailyGoal: intake.daily_goal }
    : defaultData;
}

export function useWaterIntake(userId: string | undefined, selectedDate: Date) {
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const queryKey = ['waterIntake', userId, dateStr];

  const { data = defaultData, isLoading: loading } = useQuery({
    queryKey,
    queryFn: () => fetchWaterIntake(userId!, dateStr),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const upsertWater = useCallback(async (glasses: number, dailyGoal: number) => {
    const { error } = await supabase
      .from("water_intake")
      .upsert(
        { user_id: userId!, intake_date: dateStr, glasses, daily_goal: dailyGoal },
        { onConflict: "user_id,intake_date" }
      );
    if (error) throw error;
  }, [userId, dateStr]);

  const addGlass = useCallback(() => {
    if (!userId) return;
    const prev = queryClient.getQueryData<WaterIntakeData>(queryKey) ?? defaultData;
    const newGlasses = prev.glasses + 1;

    // Optimistic update
    queryClient.setQueryData<WaterIntakeData>(queryKey, { ...prev, glasses: newGlasses });

    // Background upsert with rollback
    upsertWater(newGlasses, prev.dailyGoal).catch(() => {
      queryClient.setQueryData<WaterIntakeData>(queryKey, prev);
    });
  }, [userId, queryKey, queryClient, upsertWater]);

  const removeGlass = useCallback(() => {
    if (!userId) return;
    const prev = queryClient.getQueryData<WaterIntakeData>(queryKey) ?? defaultData;
    if (prev.glasses <= 0) return;
    const newGlasses = prev.glasses - 1;

    queryClient.setQueryData<WaterIntakeData>(queryKey, { ...prev, glasses: newGlasses });

    upsertWater(newGlasses, prev.dailyGoal).catch(() => {
      queryClient.setQueryData<WaterIntakeData>(queryKey, prev);
    });
  }, [userId, queryKey, queryClient, upsertWater]);

  const setDailyGoal = useCallback((goal: number) => {
    if (!userId) return;
    const prev = queryClient.getQueryData<WaterIntakeData>(queryKey) ?? defaultData;

    queryClient.setQueryData<WaterIntakeData>(queryKey, { ...prev, dailyGoal: goal });

    upsertWater(prev.glasses, goal).catch(() => {
      queryClient.setQueryData<WaterIntakeData>(queryKey, prev);
    });
  }, [userId, queryKey, queryClient, upsertWater]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['waterIntake', userId] });
  }, [queryClient, userId]);

  return {
    glasses: data.glasses,
    dailyGoal: data.dailyGoal,
    loading,
    addGlass,
    removeGlass,
    setDailyGoal,
    refetch,
  };
}

/** Invalidate water intake cache from outside the hook */
export function useInvalidateWaterIntake() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['waterIntake'] });
  }, [queryClient]);
}

/** Prefetch helper for usePrefetch */
export { fetchWaterIntake };
