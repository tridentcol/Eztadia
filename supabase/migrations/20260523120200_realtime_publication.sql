-- ============================================================================
-- 20260523120200_realtime_publication
--
-- Agrega bookings + booking_holds + external_blocks a la publication
-- `supabase_realtime` para que el hook useRealtimeBookings (C6) reciba
-- eventos postgres_changes y refresque el calendar.
--
-- REPLICA IDENTITY default (primary key) ya esta seteada en estas tablas;
-- no necesitamos REPLICA IDENTITY FULL porque el filtro RLS se hace por
-- property_id que es part of la fila visible.
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_holds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.external_blocks;
