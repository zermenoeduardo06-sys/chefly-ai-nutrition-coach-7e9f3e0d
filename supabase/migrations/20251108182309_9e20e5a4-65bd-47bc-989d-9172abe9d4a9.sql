-- Enable users to update their own meals (for swapping and other operations)
CREATE POLICY "Users can update own meals"
ON meals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM meal_plans mp
  WHERE mp.id = meals.meal_plan_id 
  AND mp.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM meal_plans mp
  WHERE mp.id = meals.meal_plan_id 
  AND mp.user_id = auth.uid()
));

-- Enable users to insert their own meals (for meal replacements)
CREATE POLICY "Users can insert own meals"
ON meals
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM meal_plans mp
  WHERE mp.id = meals.meal_plan_id 
  AND mp.user_id = auth.uid()
));

-- Enable users to delete their own meals (for meal replacements)
CREATE POLICY "Users can delete own meals"
ON meals
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM meal_plans mp
  WHERE mp.id = meals.meal_plan_id 
  AND mp.user_id = auth.uid()
));