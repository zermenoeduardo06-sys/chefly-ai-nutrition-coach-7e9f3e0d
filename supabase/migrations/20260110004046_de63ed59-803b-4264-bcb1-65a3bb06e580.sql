-- Add unique constraint on user_id for user_preferences to allow upsert
ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);

-- Add unique constraint on user_id for user_stats to allow upsert
ALTER TABLE public.user_stats 
ADD CONSTRAINT user_stats_user_id_unique UNIQUE (user_id);