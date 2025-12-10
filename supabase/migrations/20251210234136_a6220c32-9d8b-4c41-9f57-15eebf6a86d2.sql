-- Create recipe_library table for caching recipes with images
CREATE TABLE public.recipe_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  diet_type TEXT,
  ingredients TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  benefits TEXT,
  image_url TEXT,
  language TEXT DEFAULT 'es',
  tags TEXT[] DEFAULT '{}',
  complexity TEXT DEFAULT 'simple',
  cooking_time_minutes INTEGER DEFAULT 30,
  allergies TEXT[] DEFAULT '{}',
  has_image BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying (no index on image_url due to size)
CREATE INDEX idx_recipe_library_meal_type ON public.recipe_library(meal_type);
CREATE INDEX idx_recipe_library_diet_type ON public.recipe_library(diet_type);
CREATE INDEX idx_recipe_library_language ON public.recipe_library(language);
CREATE INDEX idx_recipe_library_has_image ON public.recipe_library(has_image) WHERE has_image = true;

-- Enable RLS
ALTER TABLE public.recipe_library ENABLE ROW LEVEL SECURITY;

-- Anyone can read recipes (public library)
CREATE POLICY "Anyone can read recipe library"
ON public.recipe_library
FOR SELECT
USING (true);

-- Service role can manage recipes (via edge functions)
CREATE POLICY "Service role can manage recipes"
ON public.recipe_library
FOR ALL
USING (true)
WITH CHECK (true);