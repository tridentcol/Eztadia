-- ============================================================================
-- Booking SQL functions
-- ============================================================================
-- 3 funciones que son la unica fuente de verdad para disponibilidad y holds.
-- NO replicar esta logica en TypeScript.
--
--   * check_availability(property_id, room_type_id, check_in, check_out)
--       → (available_rooms INT, total_rooms INT)
--       Cuenta rooms libres considerando bookings activos, external_blocks
--       y holds activos no expirados.
--
--   * create_booking_hold(property_id, room_type_id, check_in, check_out,
--                         guest_email, guest_phone, total_cents,
--                         payment_method, ttl_minutes)
--       → UUID del hold creado
--       Atomico (FOR UPDATE). Excepciona NO_AVAILABILITY (P0001) si no hay.
--
--   * expire_old_holds()
--       → INT con cantidad de holds expirados
--       Para uso de cron (/api/cron/expire-holds en B14).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- check_availability
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_availability(
  p_property_id  UUID,
  p_room_type_id UUID,
  p_check_in     DATE,
  p_check_out    DATE
) RETURNS TABLE (
  available_rooms INT,
  total_rooms     INT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INT;
  v_taken INT;
BEGIN
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'INVALID_DATE_RANGE: check_in must be < check_out' USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)::INT INTO v_total
  FROM public.rooms
  WHERE property_id = p_property_id
    AND room_type_id = p_room_type_id
    AND is_active = true;

  -- Rooms con booking confirmado/pending o external block que solape
  SELECT COUNT(DISTINCT r.id)::INT INTO v_taken
  FROM public.rooms r
  WHERE r.property_id = p_property_id
    AND r.room_type_id = p_room_type_id
    AND r.is_active = true
    AND (
      EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.room_id = r.id
          AND b.status IN ('confirmed', 'pending_payment')
          AND b.check_in < p_check_out
          AND b.check_out > p_check_in
      )
      OR EXISTS (
        SELECT 1 FROM public.external_blocks eb
        WHERE eb.room_id = r.id
          AND eb.start_date < p_check_out
          AND eb.end_date > p_check_in
      )
    );

  -- + holds activos del room_type (consumen capacidad a nivel tipo)
  v_taken := v_taken + COALESCE((
    SELECT COUNT(*)::INT
    FROM public.booking_holds h
    WHERE h.property_id = p_property_id
      AND h.room_type_id = p_room_type_id
      AND h.status = 'active'
      AND h.expires_at > now()
      AND h.check_in < p_check_out
      AND h.check_out > p_check_in
  ), 0);

  RETURN QUERY SELECT GREATEST(v_total - v_taken, 0)::INT, v_total;
END;
$$;

-- ----------------------------------------------------------------------------
-- create_booking_hold
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_property_id    UUID,
  p_room_type_id   UUID,
  p_check_in       DATE,
  p_check_out      DATE,
  p_guest_email    TEXT,
  p_guest_phone    TEXT,
  p_total_cents    INT,
  p_payment_method TEXT,
  p_ttl_minutes    INT
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
    payment_method, status, expires_at, updated_at
  ) VALUES (
    p_property_id, p_room_type_id, p_check_in, p_check_out,
    p_guest_email, p_guest_phone, p_total_cents,
    p_payment_method::"PaymentMethod", 'active',
    now() + make_interval(mins => p_ttl_minutes),
    now()
  )
  RETURNING id INTO v_hold_id;

  RETURN v_hold_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- expire_old_holds
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.expire_old_holds()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.booking_holds
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at <= now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- Permisos: solo authenticated y service_role pueden llamar las funciones de
-- escritura. check_availability puede ser publico (anon) para mostrar
-- disponibilidad en /p/[slug] sin crear hold.
-- ----------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.check_availability(UUID, UUID, DATE, DATE) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.check_availability(UUID, UUID, DATE, DATE)
  TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_booking_hold(UUID, UUID, DATE, DATE, TEXT, TEXT, INT, TEXT, INT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_booking_hold(UUID, UUID, DATE, DATE, TEXT, TEXT, INT, TEXT, INT)
  TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.expire_old_holds() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.expire_old_holds() TO service_role;
