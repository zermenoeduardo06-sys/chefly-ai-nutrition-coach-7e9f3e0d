-- Fix function search_path for security (prevents SQL injection via search_path manipulation)

-- Fix generate_affiliate_code function
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix update_affiliate_tier function
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

-- Fix update_updated_at_column function (common trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Ensure has_role function has proper search_path (already should have it but confirming)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;