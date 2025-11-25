-- Create body_measurements table for tracking weight and body measurements
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL,
  weight NUMERIC(5,2),
  neck NUMERIC(5,2),
  chest NUMERIC(5,2),
  waist NUMERIC(5,2),
  hips NUMERIC(5,2),
  arms NUMERIC(5,2),
  thighs NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_date UNIQUE(user_id, measurement_date)
);

-- Enable RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own measurements" 
ON public.body_measurements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" 
ON public.body_measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" 
ON public.body_measurements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" 
ON public.body_measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);