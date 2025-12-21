-- Add meal_member_adaptations table to track which meals are best suited for each family member
CREATE TABLE public.meal_member_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL,
  adaptation_score INTEGER NOT NULL DEFAULT 50, -- 0-100 how well suited
  adaptation_notes TEXT, -- e.g., "Más proteína para tu objetivo de ganar músculo"
  variant_instructions TEXT, -- e.g., "Agrega 50g extra de pollo"
  is_best_match BOOLEAN DEFAULT false, -- True if this member is the best match
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_member_adaptations ENABLE ROW LEVEL SECURITY;

-- Users can view adaptations for their family meals
CREATE POLICY "Users can view family meal adaptations" 
ON public.meal_member_adaptations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM meals m
    JOIN meal_plans mp ON mp.id = m.meal_plan_id
    JOIN family_memberships fm ON fm.user_id = mp.user_id
    WHERE m.id = meal_member_adaptations.meal_id 
    AND fm.family_id = get_user_family_id(auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM meals m
    JOIN meal_plans mp ON mp.id = m.meal_plan_id
    WHERE m.id = meal_member_adaptations.meal_id 
    AND mp.user_id = auth.uid()
  )
);

-- Service role can insert/update adaptations
CREATE POLICY "Service role can manage adaptations" 
ON public.meal_member_adaptations 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add family_id to meal_plans to mark plans as family plans
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS is_family_plan BOOLEAN DEFAULT false;
ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_meal_member_adaptations_meal_id ON public.meal_member_adaptations(meal_id);
CREATE INDEX idx_meal_member_adaptations_member ON public.meal_member_adaptations(member_user_id);
CREATE INDEX idx_meal_plans_family_id ON public.meal_plans(family_id);