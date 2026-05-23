-- ============================================================================
-- D10 · webhook_logs
-- ============================================================================
-- Captura cada llamada recibida por nuestros endpoints /api/webhooks/*.
-- Append-only: nunca se actualiza ni borra (excepto cascade desde properties).
-- Defense in depth: RLS habilitada, SELECT solo para member o super_admin.
-- INSERT solo desde route handlers via service_role (admin client).

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        TEXT NOT NULL,
  event_type      TEXT,
  property_id     UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  request_id      TEXT,
  status          TEXT NOT NULL,
  http_status     INTEGER,
  signature_valid BOOLEAN,
  payload         JSONB,
  response        JSONB,
  error           TEXT,
  duration_ms     INTEGER,
  ip              INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.webhook_logs IS
  'Append-only log de llamadas recibidas en /api/webhooks/*. Insertado via service_role; super_admin lee cross-tenant, owner/manager/reception ven los de su propiedad.';

COMMENT ON COLUMN public.webhook_logs.provider IS
  'Identificador del emisor: wompi | meta_whatsapp | (futuros)';
COMMENT ON COLUMN public.webhook_logs.status IS
  'received | processed | failed | rejected_signature | rejected_idempotency | rejected_other';
COMMENT ON COLUMN public.webhook_logs.signature_valid IS
  'Resultado de la verificacion HMAC (null si el provider no firma).';
COMMENT ON COLUMN public.webhook_logs.payload IS
  'Request body original. NO debe contener secretos plain — el provider envia public refs.';

CREATE INDEX webhook_logs_provider_created_idx
  ON public.webhook_logs(provider, created_at DESC);
CREATE INDEX webhook_logs_property_created_idx
  ON public.webhook_logs(property_id, created_at DESC)
  WHERE property_id IS NOT NULL;
CREATE INDEX webhook_logs_status_created_idx
  ON public.webhook_logs(status, created_at DESC);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: super_admin global, o member de la propiedad si property_id matchea.
-- (Mismo patron que audit_logs_member_select sin la rama actor_id que aqui no aplica.)
CREATE POLICY "webhook_logs_member_select" ON public.webhook_logs
  FOR SELECT TO authenticated
  USING (
    (property_id IS NULL AND public.is_super_admin())
    OR (property_id IS NOT NULL AND public.has_property_access(property_id))
  );

-- INSERT/UPDATE/DELETE: SIN policies — solo service_role (admin client).
