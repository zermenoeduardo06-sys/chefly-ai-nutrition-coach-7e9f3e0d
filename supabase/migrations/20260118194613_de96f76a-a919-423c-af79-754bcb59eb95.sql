-- Add columns for exclusive influencer system
ALTER TABLE affiliate_profiles 
ADD COLUMN IF NOT EXISTS social_handle TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false;

-- Add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_is_influencer 
ON affiliate_profiles(is_influencer) WHERE is_influencer = true;