-- Add avatar customization fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_background_color text DEFAULT NULL;