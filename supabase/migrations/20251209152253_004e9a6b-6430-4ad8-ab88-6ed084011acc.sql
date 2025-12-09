-- Create weekly check-ins table to store user responses
CREATE TABLE public.weekly_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start_date date NOT NULL,
  weight_change text NOT NULL, -- 'up', 'down', 'same'
  energy_level text NOT NULL, -- 'high', 'normal', 'low'
  recipe_preferences text[] DEFAULT '{}',
  custom_recipe_preference text,
  available_ingredients text,
  weekly_goals text[] DEFAULT '{}', -- 'cheaper', 'faster', 'more_protein'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own check-ins
CREATE POLICY "Users can view own check-ins"
ON public.weekly_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
ON public.weekly_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
ON public.weekly_checkins FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_weekly_checkins_user_week ON public.weekly_checkins(user_id, week_start_date DESC);