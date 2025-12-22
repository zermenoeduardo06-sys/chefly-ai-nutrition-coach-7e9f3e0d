-- Fix search_path for the grant_monthly_streak_freeze function
DROP FUNCTION IF EXISTS public.grant_monthly_streak_freeze();

CREATE OR REPLACE FUNCTION public.grant_monthly_streak_freeze()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset streak freeze at the start of each month for active subscribers
  IF EXTRACT(DAY FROM NOW()) = 1 THEN
    UPDATE public.user_stats SET streak_freeze_available = 1 WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;