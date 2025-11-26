-- Add Stripe Connect fields to affiliate_profiles
ALTER TABLE public.affiliate_profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_stripe_account 
ON public.affiliate_profiles(stripe_account_id);

COMMENT ON COLUMN public.affiliate_profiles.stripe_account_id IS 'Stripe Connect account ID for receiving payouts';
COMMENT ON COLUMN public.affiliate_profiles.stripe_account_status IS 'Status: not_connected, pending, active, restricted';
COMMENT ON COLUMN public.affiliate_profiles.stripe_onboarding_completed IS 'Whether affiliate completed Stripe onboarding';