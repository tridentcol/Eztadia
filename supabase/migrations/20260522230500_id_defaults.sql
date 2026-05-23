-- ============================================================================
-- id column defaults (gen_random_uuid)
-- ============================================================================
-- Gap detectado en B3 smoke test:
--   Prisma @default(uuid()) genera el UUID en el cliente; en SQL la columna
--   queda sin DEFAULT. Resultado:
--     - SQL function create_booking_hold falla (INSERT sin id).
--     - cualquier INSERT puro falla por NOT NULL en id.
--
-- Fix: DEFAULT gen_random_uuid() en cada tabla con id @default(uuid()).
-- Prisma client sigue generando ids en aplicacion (no hay drift); este default
-- solo se activa cuando alguien inserta sin setear id (SQL functions, seeds).
-- Excluidas:
--   - profiles (id viene de auth.users.id via trigger)
--   - wompi_configs, whatsapp_configs (PK es property_id, no id)
-- ============================================================================

ALTER TABLE public.organizations     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.properties        ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.property_users    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.room_types        ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.rooms             ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.seasonal_rates    ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.bookings          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.booking_holds     ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.payments          ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.ical_feeds        ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.external_blocks   ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.whatsapp_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.email_logs        ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.audit_logs        ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.login_events      ALTER COLUMN id SET DEFAULT gen_random_uuid();
