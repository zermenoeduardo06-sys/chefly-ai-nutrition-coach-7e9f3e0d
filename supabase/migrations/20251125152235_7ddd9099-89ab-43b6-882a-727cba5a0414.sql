-- FASE 1: Sistema de Afiliados - Base de Datos Completa

-- Primero, crear función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Enums para estados
CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payout_method AS ENUM ('paypal', 'bank_transfer', 'spei');

-- 1. Tabla de perfiles de afiliados
CREATE TABLE public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'MX',
  
  -- Información de pago
  payout_method payout_method DEFAULT 'paypal',
  paypal_email TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_clabe TEXT,
  
  -- Estadísticas
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earned_mxn DECIMAL(10, 2) DEFAULT 0,
  total_paid_mxn DECIMAL(10, 2) DEFAULT 0,
  pending_balance_mxn DECIMAL(10, 2) DEFAULT 0,
  
  -- Estado y comisiones
  status affiliate_status DEFAULT 'pending',
  commission_rate_basic DECIMAL(5, 2) DEFAULT 20.00,
  commission_rate_intermediate DECIMAL(5, 2) DEFAULT 25.00,
  
  -- Endorsely integration
  endorsely_affiliate_id TEXT,
  endorsely_referral_link TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  last_payout_at TIMESTAMPTZ
);

-- 2. Tabla de referencias/clicks
CREATE TABLE public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  sale_id UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de ventas generadas
CREATE TABLE public.affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.affiliate_referrals(id),
  
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  product_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  sale_amount_mxn DECIMAL(10, 2) NOT NULL,
  
  commission_rate DECIMAL(5, 2) NOT NULL,
  commission_amount_mxn DECIMAL(10, 2) NOT NULL,
  commission_status commission_status DEFAULT 'pending',
  
  stripe_metadata JSONB,
  endorsely_metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- 4. Tabla de comisiones (resumen mensual)
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2025),
  
  total_sales INTEGER DEFAULT 0,
  total_amount_mxn DECIMAL(10, 2) DEFAULT 0,
  commission_earned_mxn DECIMAL(10, 2) DEFAULT 0,
  commission_paid_mxn DECIMAL(10, 2) DEFAULT 0,
  commission_pending_mxn DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(affiliate_id, month, year)
);

-- 5. Tabla de pagos/retiros
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  
  amount_mxn DECIMAL(10, 2) NOT NULL,
  payout_method payout_method NOT NULL,
  status payout_status DEFAULT 'pending',
  
  payout_details JSONB,
  transaction_id TEXT,
  
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  admin_notes TEXT,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_affiliate_profiles_user_id ON public.affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_code ON public.affiliate_profiles(affiliate_code);
CREATE INDEX idx_affiliate_profiles_status ON public.affiliate_profiles(status);
CREATE INDEX idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_converted ON public.affiliate_referrals(converted);
CREATE INDEX idx_affiliate_sales_affiliate_id ON public.affiliate_sales(affiliate_id);
CREATE INDEX idx_affiliate_sales_status ON public.affiliate_sales(commission_status);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- Triggers
CREATE TRIGGER update_affiliate_profiles_updated_at
  BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar código único
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || 
                LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM public.affiliate_profiles WHERE affiliate_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- RLS
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Policies affiliate_profiles
CREATE POLICY "Afiliados pueden ver su propio perfil"
  ON public.affiliate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Afiliados pueden actualizar su propio perfil"
  ON public.affiliate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su perfil de afiliado"
  ON public.affiliate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies affiliate_referrals
CREATE POLICY "Afiliados pueden ver sus propias referencias"
  ON public.affiliate_referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles 
      WHERE id = affiliate_referrals.affiliate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema puede crear referencias"
  ON public.affiliate_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema puede actualizar referencias"
  ON public.affiliate_referrals FOR UPDATE
  USING (true);

-- Policies affiliate_sales
CREATE POLICY "Afiliados pueden ver sus propias ventas"
  ON public.affiliate_sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles 
      WHERE id = affiliate_sales.affiliate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema puede crear ventas"
  ON public.affiliate_sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema puede actualizar ventas"
  ON public.affiliate_sales FOR UPDATE
  USING (true);

-- Policies affiliate_commissions
CREATE POLICY "Afiliados pueden ver sus propias comisiones"
  ON public.affiliate_commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles 
      WHERE id = affiliate_commissions.affiliate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema puede gestionar comisiones"
  ON public.affiliate_commissions FOR ALL
  USING (true) WITH CHECK (true);

-- Policies affiliate_payouts
CREATE POLICY "Afiliados pueden ver sus propios pagos"
  ON public.affiliate_payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles 
      WHERE id = affiliate_payouts.affiliate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Afiliados pueden solicitar pagos"
  ON public.affiliate_payouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles 
      WHERE id = affiliate_payouts.affiliate_id AND user_id = auth.uid()
    )
  );