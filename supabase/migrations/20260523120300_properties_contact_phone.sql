-- ============================================================================
-- 20260523120300_properties_contact_phone
--
-- Agrega contact_phone a properties para mostrar WhatsApp en flow publico
-- (BookingFlowTopbar + StatusScreen "Necesitas ayuda" link). Hoy el adapter
-- devuelve "" / "#" porque no hay columna; con esto los componentes ya
-- renderizan numero + link wa.me. UI para capturarlo entra en Phase D
-- (D12 detalle WhatsApp integration).
-- ============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

COMMENT ON COLUMN public.properties.contact_phone IS
  'Telefono publico de contacto (display + wa.me URL). Formato libre — el adapter limpia.';
