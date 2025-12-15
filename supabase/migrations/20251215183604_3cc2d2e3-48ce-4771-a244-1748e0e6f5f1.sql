-- Create table for food scans
CREATE TABLE public.food_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dish_name TEXT NOT NULL,
  foods_identified TEXT[] DEFAULT '{}',
  portion_estimate TEXT,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  fiber INTEGER DEFAULT 0,
  confidence TEXT DEFAULT 'medium',
  notes TEXT,
  image_url TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;

-- Users can view their own scans
CREATE POLICY "Users can view their own food scans"
ON public.food_scans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert their own food scans"
ON public.food_scans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete their own food scans"
ON public.food_scans
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_food_scans_user_date ON public.food_scans(user_id, scanned_at DESC);