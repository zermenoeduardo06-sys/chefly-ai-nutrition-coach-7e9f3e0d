-- Create enum for affiliate tiers
CREATE TYPE public.affiliate_tier AS ENUM ('bronce', 'plata', 'oro', 'platino', 'diamante');

-- Add tier columns to affiliate_profiles
ALTER TABLE public.affiliate_profiles
ADD COLUMN current_tier public.affiliate_tier DEFAULT 'bronce' NOT NULL,
ADD COLUMN tier_upgraded_at timestamp with time zone DEFAULT now(),
ADD COLUMN lifetime_sales_mxn numeric DEFAULT 0;

-- Create affiliate_tiers table to define tier requirements and benefits
CREATE TABLE public.affiliate_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.affiliate_tier NOT NULL UNIQUE,
  name_es text NOT NULL,
  name_en text NOT NULL,
  min_sales_mxn numeric NOT NULL,
  min_conversions integer NOT NULL,
  commission_bonus_percentage numeric DEFAULT 0,
  display_order integer NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  benefits jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on affiliate_tiers
ALTER TABLE public.affiliate_tiers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view tiers
CREATE POLICY "Anyone can view affiliate tiers"
ON public.affiliate_tiers
FOR SELECT
USING (true);

-- Insert default tier definitions
INSERT INTO public.affiliate_tiers (tier, name_es, name_en, min_sales_mxn, min_conversions, commission_bonus_percentage, display_order, color, icon, benefits) VALUES
('bronce', 'Bronce', 'Bronze', 0, 0, 0, 1, '#CD7F32', 'Award', '["Acceso al dashboard de afiliados", "Comisión base del 20-25%", "Materiales de marketing básicos"]'::jsonb),
('plata', 'Plata', 'Silver', 10000, 5, 5, 2, '#C0C0C0', 'Medal', '["Todo lo de Bronce", "Comisión +5% adicional", "Soporte prioritario", "Materiales de marketing premium"]'::jsonb),
('oro', 'Oro', 'Gold', 50000, 20, 10, 3, '#FFD700', 'Crown', '["Todo lo de Plata", "Comisión +10% adicional", "Gestor de cuenta dedicado", "Acceso anticipado a nuevos productos"]'::jsonb),
('platino', 'Platino', 'Platinum', 150000, 50, 15, 4, '#E5E4E2', 'Star', '["Todo lo de Oro", "Comisión +15% adicional", "Bonos trimestrales", "Co-marketing con la marca"]'::jsonb),
('diamante', 'Diamante', 'Diamond', 500000, 150, 25, 5, '#B9F2FF', 'Gem', '["Todo lo de Platino", "Comisión +25% adicional", "Revenue share especial", "Eventos exclusivos VIP"]'::jsonb);

-- Create function to update affiliate tier based on performance
CREATE OR REPLACE FUNCTION public.update_affiliate_tier(affiliate_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sales numeric;
  current_conversions integer;
  new_tier affiliate_tier;
  old_tier affiliate_tier;
BEGIN
  -- Get current stats
  SELECT 
    COALESCE(lifetime_sales_mxn, 0),
    COALESCE(total_conversions, 0),
    current_tier
  INTO current_sales, current_conversions, old_tier
  FROM affiliate_profiles
  WHERE id = affiliate_profile_id;

  -- Determine new tier based on sales and conversions
  SELECT tier INTO new_tier
  FROM affiliate_tiers
  WHERE current_sales >= min_sales_mxn 
    AND current_conversions >= min_conversions
  ORDER BY display_order DESC
  LIMIT 1;

  -- Update tier if changed
  IF new_tier IS NOT NULL AND new_tier != old_tier THEN
    UPDATE affiliate_profiles
    SET 
      current_tier = new_tier,
      tier_upgraded_at = now()
    WHERE id = affiliate_profile_id;
  END IF;
END;
$$;