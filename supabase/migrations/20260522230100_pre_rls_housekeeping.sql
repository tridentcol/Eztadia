-- ============================================================================
-- Pre-RLS housekeeping
-- ============================================================================
-- Esta migration corrige el schema que Prisma db push dejo a medias:
--   - FK profiles.id -> auth.users.id (Prisma no conoce el schema auth)
--   - Trigger handle_new_user para auto-crear profile al signup
--   - bookings.nights como GENERATED column (check_out - check_in)
--   - bookings.code default tipo HAB-YYYY-NNNNN via sequence
--   - bookings.public_token default 32 hex chars
--   - properties.ical_export_secret default 48 hex chars
--
-- IMPORTANTE: a partir de esta migration, NO correr `prisma db push` directo.
-- Si necesitas cambios al schema, usa `prisma migrate dev` (que respeta
-- migrations existentes) o agrega un nuevo supabase migration manual.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FK profiles -> auth.users
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- Trigger: auto-crear profile al signup
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- bookings.nights como GENERATED column
-- ----------------------------------------------------------------------------
-- Prisma creo nights como INT nullable. La convertimos a GENERATED ALWAYS.

ALTER TABLE public.bookings DROP COLUMN nights;
ALTER TABLE public.bookings
  ADD COLUMN nights INTEGER
  GENERATED ALWAYS AS ((check_out - check_in)) STORED;

-- ----------------------------------------------------------------------------
-- Secuencia + default para bookings.code (HAB-YYYY-NNNNN, year en Bogota TZ)
-- ----------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.booking_code_seq START 1;

ALTER TABLE public.bookings
  ALTER COLUMN code SET DEFAULT (
    'HAB-'
    || EXTRACT(YEAR FROM (now() AT TIME ZONE 'America/Bogota'))::TEXT
    || '-'
    || lpad(nextval('public.booking_code_seq')::text, 5, '0')
  );

-- ----------------------------------------------------------------------------
-- bookings.public_token default: 32 hex chars (16 bytes random)
-- ----------------------------------------------------------------------------
-- gen_random_bytes vive en extensions.pgcrypto (ya instalado).

ALTER TABLE public.bookings
  ALTER COLUMN public_token SET DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

-- ----------------------------------------------------------------------------
-- properties.ical_export_secret default: 48 hex chars (24 bytes random)
-- ----------------------------------------------------------------------------

ALTER TABLE public.properties
  ALTER COLUMN ical_export_secret SET DEFAULT encode(extensions.gen_random_bytes(24), 'hex');
