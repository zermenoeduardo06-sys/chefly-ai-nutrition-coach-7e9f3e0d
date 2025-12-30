-- Fix meal_member_adaptations RLS policy
-- Drop the overly permissive service role policy that has roles:{public}
DROP POLICY IF EXISTS "Service role can manage adaptations" ON public.meal_member_adaptations;

-- Create a proper policy for authenticated users to insert their own adaptations
CREATE POLICY "Users can insert their own adaptations"
ON public.meal_member_adaptations
FOR INSERT
WITH CHECK (
  auth.uid() = member_user_id
  OR EXISTS (
    SELECT 1 FROM meals m
    JOIN meal_plans mp ON mp.id = m.meal_plan_id
    WHERE m.id = meal_member_adaptations.meal_id
    AND mp.user_id = auth.uid()
  )
);

-- Create policy for users to update their own adaptations
CREATE POLICY "Users can update their own adaptations"
ON public.meal_member_adaptations
FOR UPDATE
USING (
  auth.uid() = member_user_id
  OR EXISTS (
    SELECT 1 FROM meals m
    JOIN meal_plans mp ON mp.id = m.meal_plan_id
    WHERE m.id = meal_member_adaptations.meal_id
    AND mp.user_id = auth.uid()
  )
);

-- Create policy for users to delete their own adaptations
CREATE POLICY "Users can delete their own adaptations"
ON public.meal_member_adaptations
FOR DELETE
USING (
  auth.uid() = member_user_id
  OR EXISTS (
    SELECT 1 FROM meals m
    JOIN meal_plans mp ON mp.id = m.meal_plan_id
    WHERE m.id = meal_member_adaptations.meal_id
    AND mp.user_id = auth.uid()
  )
);