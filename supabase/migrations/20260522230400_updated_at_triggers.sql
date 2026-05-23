-- ============================================================================
-- updated_at automation + handle_new_user fix
-- ============================================================================
-- Gap detectado en B3 smoke test:
--   Prisma maneja @updatedAt en el cliente; en SQL la columna queda NOT NULL
--   sin default. Resultado:
--     - signup falla (handle_new_user no setea updated_at).
--     - cualquier INSERT no-Prisma falla por NOT NULL violation.
--
-- Fix:
--   1. DEFAULT now() en todas las updated_at (permite inserts sin la columna).
--   2. Trigger BEFORE UPDATE que setea updated_at = now() automaticamente.
--   3. handle_new_user actualizado para incluir updated_at en el INSERT.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DEFAULT now() en updated_at de cada tabla con esa columna
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles          ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.organizations     ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.properties        ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.room_types        ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.rooms             ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.bookings          ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.booking_holds     ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.payments          ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.ical_feeds        ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.wompi_configs     ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.whatsapp_configs  ALTER COLUMN updated_at SET DEFAULT now();

-- ----------------------------------------------------------------------------
-- 2. Trigger function set_updated_at + triggers BEFORE UPDATE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'profiles', 'organizations', 'properties', 'room_types', 'rooms',
    'bookings', 'booking_holds', 'payments', 'ical_feeds',
    'wompi_configs', 'whatsapp_configs'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', v_table);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      v_table
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. handle_new_user actualizado para incluir updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
