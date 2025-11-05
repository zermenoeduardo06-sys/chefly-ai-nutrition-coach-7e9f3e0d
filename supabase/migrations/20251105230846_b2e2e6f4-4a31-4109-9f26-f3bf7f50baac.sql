-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- 'meals_completed', 'streak', 'points', 'days_active'
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (anyone can read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Insert default achievements
INSERT INTO public.achievements (key, title, description, icon, requirement_type, requirement_value, points_reward) VALUES
('first_meal', 'Primera Comida', 'Completa tu primera comida saludable', '🍽️', 'meals_completed', 1, 50),
('meals_3', 'Aprendiz', 'Completa 3 comidas', '🎓', 'meals_completed', 3, 75),
('meals_10', 'Entusiasta', 'Completa 10 comidas', '🌟', 'meals_completed', 10, 100),
('meals_30', 'Experto', 'Completa 30 comidas', '🏆', 'meals_completed', 30, 150),
('meals_50', 'Maestro', 'Completa 50 comidas', '👑', 'meals_completed', 50, 200),
('meals_100', 'Leyenda', 'Completa 100 comidas', '⭐', 'meals_completed', 100, 300),
('streak_3', 'Constante', 'Mantén una racha de 3 días', '🔥', 'streak', 3, 100),
('streak_7', 'Primera Semana', 'Mantén una racha de 7 días', '📅', 'streak', 7, 150),
('streak_14', 'Dos Semanas', 'Mantén una racha de 14 días', '💪', 'streak', 14, 200),
('streak_30', '30 Días', 'Mantén una racha de 30 días increíble', '🎯', 'streak', 30, 300),
('points_100', 'Centenario', 'Acumula 100 puntos', '💰', 'points', 100, 50),
('points_500', 'Medio Millón', 'Acumula 500 puntos', '💎', 'points', 500, 100),
('points_1000', 'Millonario', 'Acumula 1000 puntos', '🏅', 'points', 1000, 200),
('level_5', 'Nivel 5', 'Alcanza el nivel 5', '⚡', 'points', 400, 150),
('level_10', 'Nivel 10', 'Alcanza el nivel 10', '🚀', 'points', 900, 250)
ON CONFLICT (key) DO NOTHING;