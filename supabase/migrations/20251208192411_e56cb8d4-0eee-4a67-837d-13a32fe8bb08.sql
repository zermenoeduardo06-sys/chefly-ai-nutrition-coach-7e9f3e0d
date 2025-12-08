-- 1. Add unique constraint on user_id to prevent multiple affiliate accounts per user
ALTER TABLE public.affiliate_profiles 
ADD CONSTRAINT affiliate_profiles_user_id_unique UNIQUE (user_id);

-- 2. Add unique constraint on affiliate_code (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'affiliate_profiles_affiliate_code_key'
  ) THEN
    ALTER TABLE public.affiliate_profiles 
    ADD CONSTRAINT affiliate_profiles_affiliate_code_key UNIQUE (affiliate_code);
  END IF;
END $$;

-- 3. Create a function to validate affiliate profile inserts
CREATE OR REPLACE FUNCTION public.validate_affiliate_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the user_id matches the authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create affiliate profile for another user';
  END IF;
  
  -- Ensure user doesn't already have an affiliate profile
  IF EXISTS (SELECT 1 FROM affiliate_profiles WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'User already has an affiliate profile';
  END IF;
  
  -- Generate affiliate code if not provided (prevent manipulation)
  NEW.affiliate_code := generate_affiliate_code();
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger for affiliate insert validation
DROP TRIGGER IF EXISTS validate_affiliate_insert_trigger ON public.affiliate_profiles;
CREATE TRIGGER validate_affiliate_insert_trigger
  BEFORE INSERT ON public.affiliate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_affiliate_insert();

-- 5. Make affiliate_commissions not publicly readable - only through affiliate_profiles relationship
DROP POLICY IF EXISTS "Sistema puede gestionar comisiones" ON public.affiliate_commissions;

-- 6. Create more restrictive policy for system operations (service role only)
CREATE POLICY "Service role can manage commissions" 
ON public.affiliate_commissions 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Add policy to prevent direct access to affiliate_id from commissions without proper auth
DROP POLICY IF EXISTS "Afiliados pueden ver sus propias comisiones" ON public.affiliate_commissions;
CREATE POLICY "Affiliates can view own commissions" 
ON public.affiliate_commissions 
FOR SELECT 
TO authenticated
USING (
  affiliate_id IN (
    SELECT id FROM affiliate_profiles WHERE user_id = auth.uid()
  )
);