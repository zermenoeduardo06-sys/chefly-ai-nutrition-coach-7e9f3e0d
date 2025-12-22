-- Add streak freeze columns for premium users
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS streak_freeze_available INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_freeze_used_at DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS streak_frozen_at DATE DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.user_stats.streak_freeze_available IS 'Number of streak freezes available (premium feature)';
COMMENT ON COLUMN public.user_stats.streak_freeze_used_at IS 'Date when last streak freeze was used';
COMMENT ON COLUMN public.user_stats.streak_frozen_at IS 'Date the streak was frozen';

-- Grant monthly streak freezes - function for premium users
CREATE OR REPLACE FUNCTION public.grant_monthly_streak_freeze()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset streak freeze at the start of each month for active subscribers
  IF EXTRACT(DAY FROM NOW()) = 1 THEN
    UPDATE public.user_stats SET streak_freeze_available = 1 WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;