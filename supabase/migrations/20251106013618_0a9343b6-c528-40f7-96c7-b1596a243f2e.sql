-- Create daily_challenges table to store available challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'meal_variety', 'protein_goal', 'hydration', 'meal_timing', 'calorie_target', 'streak_bonus'
  target_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  bonus_description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_daily_challenges table to track completed challenges
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for daily_challenges
CREATE POLICY "Users can view own challenges"
ON public.daily_challenges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
ON public.daily_challenges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies for user_daily_challenges
CREATE POLICY "Users can view own challenge progress"
ON public.user_daily_challenges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
ON public.user_daily_challenges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
ON public.user_daily_challenges
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON public.daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_expires_at ON public.daily_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_id ON public.user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_challenge_id ON public.user_daily_challenges(challenge_id);