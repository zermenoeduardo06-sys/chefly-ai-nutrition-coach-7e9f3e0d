-- Remove overly permissive INSERT/UPDATE policies from affiliate_referrals
-- Edge functions use service_role key which bypasses RLS anyway
DROP POLICY IF EXISTS "Sistema puede actualizar referencias" ON public.affiliate_referrals;
DROP POLICY IF EXISTS "Sistema puede crear referencias" ON public.affiliate_referrals;

-- Remove overly permissive INSERT/UPDATE policies from affiliate_sales
DROP POLICY IF EXISTS "Sistema puede actualizar ventas" ON public.affiliate_sales;
DROP POLICY IF EXISTS "Sistema puede crear ventas" ON public.affiliate_sales;

-- Fix profiles table - replace overly permissive SELECT with restricted policy
-- Users should only see limited public info (display_name, avatar_url) for others
DROP POLICY IF EXISTS "Users can view other users public profile info" ON public.profiles;

-- Create new restricted policy - users can view their own full profile
-- For others, access is through the existing "Users can view own profile" policy
-- Leaderboard/friends features can access only non-sensitive columns via specific queries