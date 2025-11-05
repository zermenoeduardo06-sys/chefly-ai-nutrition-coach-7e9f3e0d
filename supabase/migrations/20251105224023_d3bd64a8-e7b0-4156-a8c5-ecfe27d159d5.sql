-- Add image_url column to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS image_url TEXT;