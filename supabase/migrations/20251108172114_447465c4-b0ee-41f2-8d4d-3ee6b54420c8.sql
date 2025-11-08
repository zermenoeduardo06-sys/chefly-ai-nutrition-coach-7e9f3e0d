-- Add INSERT, UPDATE, and DELETE policies for shopping_lists table
CREATE POLICY "Users can insert own shopping lists"
ON public.shopping_lists
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM meal_plans mp
    WHERE mp.id = shopping_lists.meal_plan_id
    AND mp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own shopping lists"
ON public.shopping_lists
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM meal_plans mp
    WHERE mp.id = shopping_lists.meal_plan_id
    AND mp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own shopping lists"
ON public.shopping_lists
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM meal_plans mp
    WHERE mp.id = shopping_lists.meal_plan_id
    AND mp.user_id = auth.uid()
  )
);