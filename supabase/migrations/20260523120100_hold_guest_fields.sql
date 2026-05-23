-- ============================================================================
-- 20260523120100_hold_guest_fields
--
-- Agrega columnas guest_* a booking_holds para no perder los datos del guest
-- entre el submit del form en /booking/new y la conversion a booking en el
-- pago / upload de comprobante. Previamente la conversion usaba 'Guest
-- pendiente' como placeholder (deuda C5).
--
-- Tambien recrea create_booking_hold con la nueva signature (DROP + CREATE
-- porque PostgreSQL no permite cambiar signature con CREATE OR REPLACE).
-- ============================================================================

-- 1. Agrega columnas. NOT NULL con DEFAULT para no romper holds existentes
--    (la DB esta vacia en dev, pero el patron es safer).
ALTER TABLE public.booking_holds
  ADD COLUMN IF NOT EXISTS guest_full_name       TEXT NOT NULL DEFAULT 'Guest',
  ADD COLUMN IF NOT EXISTS guest_document_type   TEXT,
  ADD COLUMN IF NOT EXISTS guest_document_number TEXT,
  ADD COLUMN IF NOT EXISTS guest_country         TEXT NOT NULL DEFAULT 'CO';

-- 2. Recrea create_booking_hold con los 4 nuevos params (al final, opcionales
--    via overload-style — pasamos NULL para document si no se capturo).
DROP FUNCTION IF EXISTS public.create_booking_hold(
  UUID, UUID, DATE, DATE, TEXT, TEXT, INT, TEXT, INT
);

CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_property_id           UUID,
  p_room_type_id          UUID,
  p_check_in              DATE,
  p_check_out             DATE,
  p_guest_email           TEXT,
  p_guest_phone           TEXT,
  p_total_cents           INT,
  p_payment_method        TEXT,
  p_ttl_minutes           INT,
  p_guest_full_name       TEXT,
  p_guest_document_type   TEXT DEFAULT NULL,
  p_guest_document_number TEXT DEFAULT NULL,
  p_guest_country         TEXT DEFAULT 'CO'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold_id   UUID;
  v_available INT;
BEGIN
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'INVALID_DATE_RANGE' USING ERRCODE = 'P0001';
  END IF;

  IF p_total_cents < 0 THEN
    RAISE EXCEPTION 'INVALID_TOTAL' USING ERRCODE = 'P0001';
  END IF;

  IF p_ttl_minutes <= 0 OR p_ttl_minutes > 60 * 48 THEN
    RAISE EXCEPTION 'INVALID_TTL' USING ERRCODE = 'P0001';
  END IF;

  -- Lock filas relevantes del room_type para evitar race
  PERFORM 1
  FROM public.rooms
  WHERE property_id = p_property_id
    AND room_type_id = p_room_type_id
    AND is_active = true
  FOR UPDATE;

  SELECT available_rooms INTO v_available
  FROM public.check_availability(p_property_id, p_room_type_id, p_check_in, p_check_out);

  IF v_available IS NULL OR v_available <= 0 THEN
    RAISE EXCEPTION 'NO_AVAILABILITY' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.booking_holds (
    property_id, room_type_id, check_in, check_out,
    guest_email, guest_phone, total_cents,
    payment_method, status, expires_at, updated_at,
    guest_full_name, guest_document_type, guest_document_number, guest_country
  ) VALUES (
    p_property_id, p_room_type_id, p_check_in, p_check_out,
    p_guest_email, p_guest_phone, p_total_cents,
    p_payment_method::"PaymentMethod", 'active',
    now() + make_interval(mins => p_ttl_minutes),
    now(),
    p_guest_full_name, p_guest_document_type, p_guest_document_number,
    COALESCE(p_guest_country, 'CO')
  )
  RETURNING id INTO v_hold_id;

  RETURN v_hold_id;
END;
$$;

-- 3. Re-grant permissions (DROP elimino los grants previos).
REVOKE ALL ON FUNCTION public.create_booking_hold(
  UUID, UUID, DATE, DATE, TEXT, TEXT, INT, TEXT, INT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking_hold(
  UUID, UUID, DATE, DATE, TEXT, TEXT, INT, TEXT, INT, TEXT, TEXT, TEXT, TEXT
) TO authenticated, service_role;
