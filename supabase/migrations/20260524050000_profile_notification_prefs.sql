-- ============================================================================
-- profiles: notification_prefs jsonb
-- ============================================================================
-- El tab "Notificaciones" en /dashboard/settings necesita persistir
-- toggles por evento x channel (email/whatsapp/inapp). Schema simple:
-- jsonb en profiles. NULL = usar DEFAULT_PREFS del codigo.
--
-- Por que jsonb y no tabla dedicada: ~30 toggles total, todos del mismo
-- user, sin foreign keys. Una columna alcanza. Si queremos analytics
-- agregados ("cuantos owners desactivaron weekly-summary"), agregamos
-- tabla en ese momento.
--
-- RLS: profiles.update ya existe (id = auth.uid()). Sin nueva policy.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb;
