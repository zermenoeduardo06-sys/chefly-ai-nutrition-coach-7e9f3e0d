-- Add preferences_hash column to meal_plans for caching
ALTER TABLE public.meal_plans 
ADD COLUMN preferences_hash text;

-- Create index for faster lookups
CREATE INDEX idx_meal_plans_preferences_hash ON public.meal_plans(preferences_hash);