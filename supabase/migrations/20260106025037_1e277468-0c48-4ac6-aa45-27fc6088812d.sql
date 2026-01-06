-- Add new columns to user_preferences for personalized nutrition goals
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS target_weight numeric,
ADD COLUMN IF NOT EXISTS daily_calorie_goal integer,
ADD COLUMN IF NOT EXISTS daily_protein_goal integer,
ADD COLUMN IF NOT EXISTS daily_carbs_goal integer,
ADD COLUMN IF NOT EXISTS daily_fats_goal integer;

-- Create weight milestones table
CREATE TABLE public.weight_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_number integer NOT NULL,
  starting_weight numeric NOT NULL,
  target_weight numeric NOT NULL,
  milestone_weight numeric NOT NULL,
  percentage integer NOT NULL,
  achieved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weight_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for weight_milestones
CREATE POLICY "Users can view their own milestones" 
ON public.weight_milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones" 
ON public.weight_milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" 
ON public.weight_milestones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" 
ON public.weight_milestones 
FOR DELETE 
USING (auth.uid() = user_id);