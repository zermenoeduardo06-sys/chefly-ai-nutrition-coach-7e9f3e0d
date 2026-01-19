import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AiUsage {
  totalUsedCents: number;
  limitCents: number;
  remaining: number;
  percentUsed: number;
  isLimitReached: boolean;
  chatCount: number;
  scanCount: number;
  cachedScanCount: number;
  shoppingCount: number;
  isLoading: boolean;
}

export const useAiUsage = (userId: string | undefined) => {
  const [usage, setUsage] = useState<AiUsage>({
    totalUsedCents: 0,
    limitCents: 200,
    remaining: 200,
    percentUsed: 0,
    isLimitReached: false,
    chatCount: 0,
    scanCount: 0,
    cachedScanCount: 0,
    shoppingCount: 0,
    isLoading: true,
  });

  const fetchUsage = useCallback(async () => {
    if (!userId) {
      setUsage(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data, error } = await supabase
        .from('ai_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (error) {
        console.error('Error fetching AI usage:', error);
        setUsage(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (data) {
        const totalUsedCents = data.total_cost_cents || 0;
        const limitCents = data.monthly_limit_cents || 200;
        const remaining = Math.max(0, limitCents - totalUsedCents);
        const percentUsed = Math.min(100, (totalUsedCents / limitCents) * 100);

        setUsage({
          totalUsedCents,
          limitCents,
          remaining,
          percentUsed,
          isLimitReached: data.is_limit_reached || false,
          chatCount: data.chat_messages_count || 0,
          scanCount: data.food_scans_count || 0,
          cachedScanCount: data.food_scans_cached_count || 0,
          shoppingCount: data.shopping_list_count || 0,
          isLoading: false,
        });
      } else {
        // No record yet - user has full budget
        setUsage({
          totalUsedCents: 0,
          limitCents: 200,
          remaining: 200,
          percentUsed: 0,
          isLimitReached: false,
          chatCount: 0,
          scanCount: 0,
          cachedScanCount: 0,
          shoppingCount: 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching AI usage:', error);
      setUsage(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return {
    ...usage,
    refresh: fetchUsage,
    formatCurrency,
    usedFormatted: `$${(usage.totalUsedCents / 100).toFixed(2)}`,
    limitFormatted: `$${(usage.limitCents / 100).toFixed(2)}`,
  };
};
