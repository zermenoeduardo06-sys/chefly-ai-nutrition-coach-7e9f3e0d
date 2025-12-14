-- Add avatar_config column to store modular avatar settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_config jsonb DEFAULT '{"skinTone": 0, "body": 0, "eyes": 0, "hair": 0, "glasses": -1, "accessory": -1}'::jsonb;