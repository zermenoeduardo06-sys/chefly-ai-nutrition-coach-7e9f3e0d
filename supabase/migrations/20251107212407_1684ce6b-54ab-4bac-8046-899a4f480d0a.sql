-- Add coming_soon column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN coming_soon boolean NOT NULL DEFAULT false;

-- Update RLS policy to show coming soon plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view active or coming soon plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true OR coming_soon = true);