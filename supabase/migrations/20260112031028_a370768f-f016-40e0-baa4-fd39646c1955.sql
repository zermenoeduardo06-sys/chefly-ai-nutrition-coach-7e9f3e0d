-- Create food analysis cache table for storing scan results
CREATE TABLE public.food_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash TEXT NOT NULL UNIQUE,
  dish_name TEXT NOT NULL,
  foods_identified TEXT[] DEFAULT '{}',
  portion_estimate TEXT,
  calories INTEGER,
  protein NUMERIC(6,2),
  carbs NUMERIC(6,2),
  fat NUMERIC(6,2),
  fiber NUMERIC(6,2),
  confidence TEXT DEFAULT 'high',
  notes TEXT,
  language TEXT DEFAULT 'es',
  hit_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast hash lookups
CREATE INDEX idx_food_cache_hash ON public.food_analysis_cache(image_hash);

-- Create index for dish name searches (useful for analytics)
CREATE INDEX idx_food_cache_dish ON public.food_analysis_cache(dish_name);

-- Enable RLS
ALTER TABLE public.food_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read from cache (public data)
CREATE POLICY "Anyone can read food cache"
  ON public.food_analysis_cache FOR SELECT
  USING (true);

-- Allow edge functions to insert (using service role key)
CREATE POLICY "Service role can insert food cache"
  ON public.food_analysis_cache FOR INSERT
  WITH CHECK (true);

-- Allow edge functions to update hit_count
CREATE POLICY "Service role can update food cache"
  ON public.food_analysis_cache FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_food_cache_updated_at
  BEFORE UPDATE ON public.food_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();