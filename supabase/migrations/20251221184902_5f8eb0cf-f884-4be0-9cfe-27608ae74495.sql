-- Tabla de familias
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mi Familia',
  owner_id UUID NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  max_members INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de membresías familiares
CREATE TABLE public.family_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT CHECK (role IN ('owner', 'member')) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id),
  UNIQUE(user_id) -- Un usuario solo puede pertenecer a una familia
);

-- Función para generar código de invitación único
CREATE OR REPLACE FUNCTION public.generate_family_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Trigger para generar código automáticamente
CREATE OR REPLACE FUNCTION public.set_family_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    NEW.invite_code := generate_family_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_family_invite_code
  BEFORE INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.set_family_invite_code();

-- Trigger para updated_at
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar membresía familiar
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_memberships
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- Función helper para verificar si es owner de familia
CREATE OR REPLACE FUNCTION public.is_family_owner(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.families
    WHERE id = _family_id AND owner_id = _user_id
  )
$$;

-- RLS Policies para families
CREATE POLICY "Users can view their own family"
  ON public.families FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    is_family_member(auth.uid(), id)
  );

CREATE POLICY "Users can create their own family"
  ON public.families FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their family"
  ON public.families FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their family"
  ON public.families FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies para family_memberships
CREATE POLICY "Users can view family memberships they belong to"
  ON public.family_memberships FOR SELECT
  USING (
    user_id = auth.uid() OR 
    is_family_owner(auth.uid(), family_id)
  );

CREATE POLICY "Owners can add members"
  ON public.family_memberships FOR INSERT
  WITH CHECK (
    is_family_owner(auth.uid(), family_id) OR
    (user_id = auth.uid() AND role = 'member')
  );

CREATE POLICY "Owners can remove members"
  ON public.family_memberships FOR DELETE
  USING (
    is_family_owner(auth.uid(), family_id) OR
    user_id = auth.uid()
  );

-- Función para obtener family_id de un usuario
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.family_memberships
  WHERE user_id = _user_id
  LIMIT 1
$$;