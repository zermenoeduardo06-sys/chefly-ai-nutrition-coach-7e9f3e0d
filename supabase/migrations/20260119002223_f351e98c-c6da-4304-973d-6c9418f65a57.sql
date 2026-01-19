-- Create AI usage tracking table
CREATE TABLE public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  
  -- Usage counters
  chat_messages_count INTEGER DEFAULT 0,
  food_scans_count INTEGER DEFAULT 0,
  food_scans_cached_count INTEGER DEFAULT 0,
  shopping_list_count INTEGER DEFAULT 0,
  
  -- Estimated costs in USD cents
  chat_cost_cents INTEGER DEFAULT 0,
  scan_cost_cents INTEGER DEFAULT 0,
  shopping_cost_cents INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,
  
  -- Limit and status
  monthly_limit_cents INTEGER DEFAULT 200, -- $2.00 USD default
  is_limit_reached BOOLEAN DEFAULT false,
  limit_reached_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all records (for edge functions)
CREATE POLICY "Service role can manage AI usage"
ON public.ai_usage_tracking
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_ai_usage_user_month_year ON public.ai_usage_tracking(user_id, month, year);

-- Trigger to update updated_at
CREATE TRIGGER update_ai_usage_tracking_updated_at
BEFORE UPDATE ON public.ai_usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();