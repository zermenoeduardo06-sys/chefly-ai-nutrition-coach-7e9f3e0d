-- Allow authenticated users to view public profile info of other users
CREATE POLICY "Users can view other users public profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Drop the overly restrictive policy that blocks anonymous access
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;