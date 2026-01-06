-- ============================================
-- CHEFLY - MIGRACIÓN COMPLETA A SUPABASE PRO
-- Archivo 1: Schema (Enums, Tablas, Funciones, Triggers, RLS)
-- ============================================

-- ============================================
-- PASO 1: CREAR TIPOS ENUM
-- ============================================

CREATE TYPE public.affiliate_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE public.affiliate_tier AS ENUM ('bronce', 'plata', 'oro', 'platino', 'diamante');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.commission_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE public.payout_method AS ENUM ('paypal', 'bank_transfer', 'spei');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================
-- PASO 2: CREAR TABLAS
-- ============================================

-- Tabla: profiles (usuarios)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  avatar_background_color TEXT,
  avatar_config JSONB DEFAULT '{"body": 0, "eyes": 0, "hair": 0, "glasses": -1, "skinTone": 0, "accessory": -1}'::jsonb,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '4 days'),
  is_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: user_preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal TEXT NOT NULL,
  diet_type TEXT NOT NULL,
  allergies TEXT[],
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  cooking_time INTEGER DEFAULT 30,
  servings INTEGER DEFAULT 1,
  age INTEGER,
  weight INTEGER,
  height INTEGER,
  target_weight NUMERIC,
  daily_calorie_goal INTEGER,
  daily_protein_goal INTEGER,
  daily_carbs_goal INTEGER,
  daily_fats_goal INTEGER,
  cooking_skill TEXT DEFAULT 'beginner',
  budget TEXT DEFAULT 'medium',
  dislikes TEXT[] DEFAULT '{}',
  flavor_preferences TEXT[] DEFAULT '{}',
  meal_complexity TEXT DEFAULT 'simple',
  preferred_cuisines TEXT[] DEFAULT '{}',
  activity_level TEXT DEFAULT 'moderate',
  gender TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: user_stats
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  meals_completed INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_activity_date DATE,
  streak_freeze_available INTEGER DEFAULT 0,
  streak_freeze_used_at TIMESTAMP WITH TIME ZONE,
  streak_frozen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: user_roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: user_achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: meal_plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  preferences_hash TEXT,
  is_family_plan BOOLEAN DEFAULT false,
  family_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: meals
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id),
  day_of_week INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT NOT NULL,
  ingredients TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  image_url TEXT,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: meal_completions
CREATE TABLE public.meal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_id UUID NOT NULL REFERENCES public.meals(id),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: shopping_lists
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id),
  items TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: recipe_library
CREATE TABLE public.recipe_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  diet_type TEXT,
  ingredients TEXT[] DEFAULT '{}',
  steps TEXT[] DEFAULT '{}',
  benefits TEXT,
  image_url TEXT,
  language TEXT DEFAULT 'es',
  tags TEXT[] DEFAULT '{}',
  complexity TEXT DEFAULT 'simple',
  allergies TEXT[] DEFAULT '{}',
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  cooking_time_minutes INTEGER DEFAULT 30,
  has_image BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: chat_messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: daily_challenges
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  bonus_description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: user_daily_challenges
CREATE TABLE public.user_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id),
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: families
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mi Familia',
  invite_code TEXT NOT NULL UNIQUE,
  max_members INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: family_memberships
CREATE TABLE public.family_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla: meal_member_adaptations
CREATE TABLE public.meal_member_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID NOT NULL REFERENCES public.meals(id),
  member_user_id UUID NOT NULL,
  variant_instructions TEXT,
  adaptation_notes TEXT,
  adaptation_score INTEGER NOT NULL DEFAULT 50,
  is_best_match BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: friendships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: body_measurements
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL,
  weight NUMERIC,
  neck NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  arms NUMERIC,
  thighs NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: weight_milestones
CREATE TABLE public.weight_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_number INTEGER NOT NULL,
  starting_weight NUMERIC NOT NULL,
  target_weight NUMERIC NOT NULL,
  milestone_weight NUMERIC NOT NULL,
  percentage INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: weekly_checkins
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  weight_change TEXT NOT NULL,
  energy_level TEXT NOT NULL,
  weekly_goals TEXT[] DEFAULT '{}',
  recipe_preferences TEXT[] DEFAULT '{}',
  custom_recipe_preference TEXT,
  available_ingredients TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: food_scans
CREATE TABLE public.food_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dish_name TEXT NOT NULL,
  foods_identified TEXT[] DEFAULT '{}',
  portion_estimate TEXT,
  confidence TEXT DEFAULT 'medium',
  notes TEXT,
  image_url TEXT,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  fiber INTEGER DEFAULT 0,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: notification_preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meal_reminders BOOLEAN NOT NULL DEFAULT true,
  streak_reminders BOOLEAN NOT NULL DEFAULT true,
  achievement_alerts BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT false,
  reminder_times JSONB NOT NULL DEFAULT '{"lunch": "13:00", "dinner": "19:00", "breakfast": "08:00"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: push_subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: subscription_plans
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_mxn INTEGER NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  coming_soon BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: user_subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_profiles
CREATE TABLE public.affiliate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'MX',
  payout_method public.payout_method DEFAULT 'paypal',
  paypal_email TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_clabe TEXT,
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'not_connected',
  stripe_onboarding_completed BOOLEAN DEFAULT false,
  endorsely_affiliate_id TEXT,
  endorsely_referral_link TEXT,
  current_tier public.affiliate_tier NOT NULL DEFAULT 'bronce',
  tier_upgraded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lifetime_sales_mxn NUMERIC DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earned_mxn NUMERIC DEFAULT 0,
  total_paid_mxn NUMERIC DEFAULT 0,
  pending_balance_mxn NUMERIC DEFAULT 0,
  commission_rate_basic NUMERIC DEFAULT 20.00,
  commission_rate_intermediate NUMERIC DEFAULT 25.00,
  status public.affiliate_status DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_tiers
CREATE TABLE public.affiliate_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier public.affiliate_tier NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  min_sales_mxn NUMERIC NOT NULL,
  min_conversions INTEGER NOT NULL,
  commission_bonus_percentage NUMERIC DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_referrals
CREATE TABLE public.affiliate_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  sale_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_sales
CREATE TABLE public.affiliate_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  referral_id UUID REFERENCES public.affiliate_referrals(id),
  customer_id UUID,
  customer_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  sale_amount_mxn NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  commission_amount_mxn NUMERIC NOT NULL,
  commission_status public.commission_status DEFAULT 'pending',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_metadata JSONB,
  endorsely_metadata JSONB,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_commissions
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_sales INTEGER DEFAULT 0,
  total_amount_mxn NUMERIC DEFAULT 0,
  commission_earned_mxn NUMERIC DEFAULT 0,
  commission_paid_mxn NUMERIC DEFAULT 0,
  commission_pending_mxn NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla: affiliate_payouts
CREATE TABLE public.affiliate_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  amount_mxn NUMERIC NOT NULL,
  payout_method public.payout_method NOT NULL,
  status public.payout_status DEFAULT 'pending',
  payout_details JSONB,
  transaction_id TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Añadir FK para meal_plans -> families
ALTER TABLE public.meal_plans ADD CONSTRAINT meal_plans_family_id_fkey 
  FOREIGN KEY (family_id) REFERENCES public.families(id);

-- ============================================
-- PASO 3: CREAR FUNCIONES DE BASE DE DATOS
-- ============================================

-- Función: handle_new_user (trigger para crear perfil automáticamente)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Función: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Función: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Función: generate_family_invite_code
CREATE OR REPLACE FUNCTION public.generate_family_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := 'FAM-';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM families WHERE invite_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- Función: set_family_invite_code (trigger)
CREATE OR REPLACE FUNCTION public.set_family_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    NEW.invite_code := generate_family_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Función: is_family_member
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_memberships
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- Función: is_family_owner
CREATE OR REPLACE FUNCTION public.is_family_owner(_user_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families
    WHERE id = _family_id AND owner_id = _user_id
  )
$$;

-- Función: get_user_family_id
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT family_id FROM public.family_memberships
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Función: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función: generate_affiliate_code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM affiliate_profiles WHERE affiliate_code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- Función: validate_affiliate_insert (trigger)
CREATE OR REPLACE FUNCTION public.validate_affiliate_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create affiliate profile for another user';
  END IF;
  
  IF EXISTS (SELECT 1 FROM affiliate_profiles WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'User already has an affiliate profile';
  END IF;
  
  NEW.affiliate_code := generate_affiliate_code();
  
  RETURN NEW;
END;
$$;

-- Función: update_affiliate_tier
CREATE OR REPLACE FUNCTION public.update_affiliate_tier(affiliate_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_sales numeric;
  current_conversions integer;
  new_tier affiliate_tier;
BEGIN
  SELECT lifetime_sales_mxn, total_conversions 
  INTO current_sales, current_conversions
  FROM affiliate_profiles 
  WHERE id = affiliate_profile_id;

  SELECT tier INTO new_tier
  FROM affiliate_tiers
  WHERE current_sales >= min_sales_mxn 
    AND current_conversions >= min_conversions
  ORDER BY min_sales_mxn DESC
  LIMIT 1;

  IF new_tier IS NOT NULL THEN
    UPDATE affiliate_profiles 
    SET current_tier = new_tier,
        tier_upgraded_at = NOW()
    WHERE id = affiliate_profile_id
      AND current_tier IS DISTINCT FROM new_tier;
  END IF;
END;
$$;

-- Función: grant_monthly_streak_freeze
CREATE OR REPLACE FUNCTION public.grant_monthly_streak_freeze()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXTRACT(DAY FROM NOW()) = 1 THEN
    UPDATE public.user_stats SET streak_freeze_available = 1 WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- PASO 4: CREAR TRIGGERS
-- ============================================

-- Trigger para crear perfil cuando se registra un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para generar código de invitación de familia
CREATE TRIGGER set_family_invite_code_trigger
  BEFORE INSERT ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.set_family_invite_code();

-- Trigger para validar inserción de afiliado
CREATE TRIGGER validate_affiliate_insert_trigger
  BEFORE INSERT ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_affiliate_insert();

-- ============================================
-- PASO 5: HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_member_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 6: CREAR POLÍTICAS RLS
-- ============================================

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_stats
CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Políticas para achievements
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Políticas para user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view all user achievements for leaderboard" ON public.user_achievements FOR SELECT USING (true);

-- Políticas para meal_plans
CREATE POLICY "Users can manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family members can view family meal plans" ON public.meal_plans FOR SELECT
  USING (EXISTS (SELECT 1 FROM family_memberships fm WHERE fm.user_id = meal_plans.user_id AND fm.family_id = get_user_family_id(auth.uid())));

-- Políticas para meals
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meals.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meals.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can update own meals" ON public.meals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meals.meal_plan_id AND mp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meals.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = meals.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Family members can view family meals" ON public.meals FOR SELECT
  USING (EXISTS (SELECT 1 FROM meal_plans mp JOIN family_memberships fm ON fm.user_id = mp.user_id WHERE mp.id = meals.meal_plan_id AND fm.family_id = get_user_family_id(auth.uid())));

-- Políticas para meal_completions
CREATE POLICY "Users can manage own completions" ON public.meal_completions FOR ALL USING (auth.uid() = user_id);

-- Políticas para shopping_lists
CREATE POLICY "Users can view own shopping lists" ON public.shopping_lists FOR SELECT
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = shopping_lists.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can insert own shopping lists" ON public.shopping_lists FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = shopping_lists.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can update own shopping lists" ON public.shopping_lists FOR UPDATE
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = shopping_lists.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Users can delete own shopping lists" ON public.shopping_lists FOR DELETE
  USING (EXISTS (SELECT 1 FROM meal_plans mp WHERE mp.id = shopping_lists.meal_plan_id AND mp.user_id = auth.uid()));
CREATE POLICY "Family members can view family shopping lists" ON public.shopping_lists FOR SELECT
  USING (EXISTS (SELECT 1 FROM meal_plans mp JOIN family_memberships fm ON fm.user_id = mp.user_id WHERE mp.id = shopping_lists.meal_plan_id AND fm.family_id = get_user_family_id(auth.uid())));

-- Políticas para recipe_library
CREATE POLICY "Anyone can read recipe library" ON public.recipe_library FOR SELECT USING (true);
CREATE POLICY "Service role can manage recipes" ON public.recipe_library FOR ALL USING (true) WITH CHECK (true);

-- Políticas para chat_messages
CREATE POLICY "Users can manage own messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Políticas para daily_challenges
CREATE POLICY "Users can view own challenges" ON public.daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenges" ON public.daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_daily_challenges
CREATE POLICY "Users can view own challenge progress" ON public.user_daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge progress" ON public.user_daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON public.user_daily_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para families
CREATE POLICY "Users can view their own family" ON public.families FOR SELECT USING ((owner_id = auth.uid()) OR is_family_member(auth.uid(), id));
CREATE POLICY "Users can create their own family" ON public.families FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their family" ON public.families FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their family" ON public.families FOR DELETE USING (owner_id = auth.uid());

-- Políticas para family_memberships
CREATE POLICY "Users can view family memberships they belong to" ON public.family_memberships FOR SELECT
  USING ((user_id = auth.uid()) OR is_family_owner(auth.uid(), family_id));
CREATE POLICY "Owners can add members" ON public.family_memberships FOR INSERT
  WITH CHECK (is_family_owner(auth.uid(), family_id) OR ((user_id = auth.uid()) AND (role = 'member')));
CREATE POLICY "Owners can remove members" ON public.family_memberships FOR DELETE
  USING (is_family_owner(auth.uid(), family_id) OR (user_id = auth.uid()));

-- Políticas para meal_member_adaptations
CREATE POLICY "Users can view family meal adaptations" ON public.meal_member_adaptations FOR SELECT
  USING ((EXISTS (SELECT 1 FROM meals m JOIN meal_plans mp ON mp.id = m.meal_plan_id JOIN family_memberships fm ON fm.user_id = mp.user_id WHERE m.id = meal_member_adaptations.meal_id AND fm.family_id = get_user_family_id(auth.uid()))) OR (EXISTS (SELECT 1 FROM meals m JOIN meal_plans mp ON mp.id = m.meal_plan_id WHERE m.id = meal_member_adaptations.meal_id AND mp.user_id = auth.uid())));
CREATE POLICY "Users can insert their own adaptations" ON public.meal_member_adaptations FOR INSERT
  WITH CHECK ((auth.uid() = member_user_id) OR (EXISTS (SELECT 1 FROM meals m JOIN meal_plans mp ON mp.id = m.meal_plan_id WHERE m.id = meal_member_adaptations.meal_id AND mp.user_id = auth.uid())));
CREATE POLICY "Users can update their own adaptations" ON public.meal_member_adaptations FOR UPDATE
  USING ((auth.uid() = member_user_id) OR (EXISTS (SELECT 1 FROM meals m JOIN meal_plans mp ON mp.id = m.meal_plan_id WHERE m.id = meal_member_adaptations.meal_id AND mp.user_id = auth.uid())));
CREATE POLICY "Users can delete their own adaptations" ON public.meal_member_adaptations FOR DELETE
  USING ((auth.uid() = member_user_id) OR (EXISTS (SELECT 1 FROM meals m JOIN meal_plans mp ON mp.id = m.meal_plan_id WHERE m.id = meal_member_adaptations.meal_id AND mp.user_id = auth.uid())));

-- Políticas para friendships
CREATE POLICY "Users can view their friendships" ON public.friendships FOR SELECT USING ((auth.uid() = user_id) OR (auth.uid() = friend_id));
CREATE POLICY "Users can send friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can respond to friend requests" ON public.friendships FOR UPDATE USING (auth.uid() = friend_id);
CREATE POLICY "Users can remove friendships" ON public.friendships FOR DELETE USING ((auth.uid() = user_id) OR (auth.uid() = friend_id));

-- Políticas para body_measurements
CREATE POLICY "Users can view their own measurements" ON public.body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own measurements" ON public.body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own measurements" ON public.body_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own measurements" ON public.body_measurements FOR DELETE USING (auth.uid() = user_id);

-- Políticas para weight_milestones
CREATE POLICY "Users can view their own milestones" ON public.weight_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own milestones" ON public.weight_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.weight_milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own milestones" ON public.weight_milestones FOR DELETE USING (auth.uid() = user_id);

-- Políticas para weekly_checkins
CREATE POLICY "Users can view own check-ins" ON public.weekly_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON public.weekly_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON public.weekly_checkins FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para food_scans
CREATE POLICY "Users can view their own food scans" ON public.food_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own food scans" ON public.food_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own food scans" ON public.food_scans FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para push_subscriptions
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para subscription_plans
CREATE POLICY "Anyone can view active or coming soon plans" ON public.subscription_plans FOR SELECT USING ((is_active = true) OR (coming_soon = true));

-- Políticas para user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para affiliate_profiles
CREATE POLICY "Afiliados pueden ver su propio perfil" ON public.affiliate_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden crear su perfil de afiliado" ON public.affiliate_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Afiliados pueden actualizar su propio perfil" ON public.affiliate_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all affiliate profiles" ON public.affiliate_profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update affiliate profiles" ON public.affiliate_profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Políticas para affiliate_tiers
CREATE POLICY "Anyone can view affiliate tiers" ON public.affiliate_tiers FOR SELECT USING (true);

-- Políticas para affiliate_referrals
CREATE POLICY "Afiliados pueden ver sus propias referencias" ON public.affiliate_referrals FOR SELECT
  USING (EXISTS (SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = affiliate_referrals.affiliate_id AND affiliate_profiles.user_id = auth.uid()));

-- Políticas para affiliate_sales
CREATE POLICY "Afiliados pueden ver sus propias ventas" ON public.affiliate_sales FOR SELECT
  USING (EXISTS (SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = affiliate_sales.affiliate_id AND affiliate_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can view all sales" ON public.affiliate_sales FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Políticas para affiliate_commissions
CREATE POLICY "Affiliates can view own commissions" ON public.affiliate_commissions FOR SELECT
  USING (affiliate_id IN (SELECT id FROM affiliate_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Service role can manage commissions" ON public.affiliate_commissions FOR ALL USING (true) WITH CHECK (true);

-- Políticas para affiliate_payouts
CREATE POLICY "Afiliados pueden ver sus propios pagos" ON public.affiliate_payouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = affiliate_payouts.affiliate_id AND affiliate_profiles.user_id = auth.uid()));
CREATE POLICY "Afiliados pueden solicitar pagos" ON public.affiliate_payouts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = affiliate_payouts.affiliate_id AND affiliate_profiles.user_id = auth.uid()));
CREATE POLICY "Admins can view all payouts" ON public.affiliate_payouts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payouts" ON public.affiliate_payouts FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- PASO 7: CREAR STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-images', 'recipe-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('food-scans', 'food-scans', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para recipe-images
CREATE POLICY "Recipe images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-images');
CREATE POLICY "Service role can manage recipe images" ON storage.objects FOR ALL USING (bucket_id = 'recipe-images') WITH CHECK (bucket_id = 'recipe-images');

-- Políticas de storage para food-scans
CREATE POLICY "Food scan images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'food-scans');
CREATE POLICY "Users can upload their own food scans" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-scans' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para assets
CREATE POLICY "Assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'assets');

-- ============================================
-- FIN DEL SCRIPT DE SCHEMA
-- ============================================
