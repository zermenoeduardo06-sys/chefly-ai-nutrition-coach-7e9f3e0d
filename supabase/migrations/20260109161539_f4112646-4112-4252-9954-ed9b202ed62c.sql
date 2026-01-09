-- Add meal_type column to food_scans to track which meal the scan belongs to
ALTER TABLE public.food_scans 
ADD COLUMN IF NOT EXISTS meal_type text;

-- Create an index for faster queries by user, date and meal type
CREATE INDEX IF NOT EXISTS idx_food_scans_user_date 
ON public.food_scans (user_id, scanned_at);

-- Add comment for documentation
COMMENT ON COLUMN public.food_scans.meal_type IS 'Type of meal: breakfast, lunch, dinner, or snack';