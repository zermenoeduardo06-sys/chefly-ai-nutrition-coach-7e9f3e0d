-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_mxn integer NOT NULL,
  billing_period text NOT NULL DEFAULT 'monthly',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert the 3 subscription plans
INSERT INTO public.subscription_plans (name, price_mxn, features, display_order) VALUES
(
  'Básico',
  99,
  '[
    "Plan de comidas semanal personalizado",
    "Seguimiento de calorías y macros",
    "Acceso a recetas básicas",
    "Chat con IA (5 mensajes/día)"
  ]'::jsonb,
  1
),
(
  'Intermedio',
  199,
  '[
    "Todo lo del plan Básico",
    "Planes de comidas diarios ilimitados",
    "Recetas premium y variadas",
    "Chat con IA ilimitado",
    "Lista de compras automática",
    "Seguimiento de progreso avanzado",
    "Desafíos diarios ilimitados"
  ]'::jsonb,
  2
),
(
  'Premium',
  300,
  '[
    "Todo lo del plan Intermedio",
    "Asesoría nutricional personalizada",
    "Planes de comidas para toda la familia",
    "Acceso a nutricionista certificado",
    "Recetas exclusivas y gourmet",
    "Sistema de logros premium",
    "Prioridad en soporte",
    "Reportes nutricionales avanzados"
  ]'::jsonb,
  3
);