-- ============================================================================
-- whatsapp_messages: read_at flag
-- ============================================================================
-- Permite identificar mensajes inbound aun no leidos por el owner. El
-- badge "unread" del sidebar usa COUNT(*) WHERE direction='inbound'
-- AND read_at IS NULL.
--
-- Mensajes outbound (enviados por nosotros) son siempre "leidos" por
-- definicion — los filtramos en el query, no necesitan read_at = now().
--
-- read_at se setea cuando el owner abre la conversacion en
-- /dashboard/messages (server action markConversationRead).
-- ============================================================================

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Indice parcial para acelerar el count de unreads por property.
CREATE INDEX IF NOT EXISTS whatsapp_messages_unread_idx
  ON public.whatsapp_messages (property_id)
  WHERE direction = 'inbound' AND read_at IS NULL;
