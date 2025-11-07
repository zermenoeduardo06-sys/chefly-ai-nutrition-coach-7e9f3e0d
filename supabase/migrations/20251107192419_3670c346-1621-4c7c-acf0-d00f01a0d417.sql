-- Allow all authenticated users to view other users' stats for leaderboard
CREATE POLICY "Anyone can view all user stats for leaderboard"
ON public.user_stats
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to view other users' achievement counts
CREATE POLICY "Anyone can view all user achievements for leaderboard"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (true);