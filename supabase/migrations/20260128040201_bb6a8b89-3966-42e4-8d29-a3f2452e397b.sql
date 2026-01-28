-- Tabla para registros de ánimo diario
CREATE TABLE public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  mood_score INTEGER NOT NULL,
  factors TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT mood_score_range CHECK (mood_score >= 1 AND mood_score <= 5)
);

-- Tabla para insights de bienestar generados por IA
CREATE TABLE public.wellness_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  related_data JSONB,
  is_read BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para escaneos corporales
CREATE TABLE public.body_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  scan_type TEXT DEFAULT 'front',
  estimated_body_fat_min DECIMAL,
  estimated_body_fat_max DECIMAL,
  body_fat_category TEXT,
  body_type TEXT,
  fat_distribution TEXT,
  ai_notes TEXT,
  recommendations TEXT[],
  raw_analysis JSONB,
  confidence TEXT DEFAULT 'medium',
  scanned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT scan_type_values CHECK (scan_type IN ('front', 'side', 'back'))
);

-- Habilitar RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_scans ENABLE ROW LEVEL SECURITY;

-- Políticas para mood_logs
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood logs"
  ON public.mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood logs"
  ON public.mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para wellness_insights
CREATE POLICY "Users can view their own wellness insights"
  ON public.wellness_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness insights"
  ON public.wellness_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness insights"
  ON public.wellness_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness insights"
  ON public.wellness_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para body_scans
CREATE POLICY "Users can view their own body scans"
  ON public.body_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body scans"
  ON public.body_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body scans"
  ON public.body_scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body scans"
  ON public.body_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para mejor performance
CREATE INDEX idx_mood_logs_user_date ON public.mood_logs(user_id, logged_at DESC);
CREATE INDEX idx_wellness_insights_user ON public.wellness_insights(user_id, generated_at DESC);
CREATE INDEX idx_body_scans_user_date ON public.body_scans(user_id, scanned_at DESC);