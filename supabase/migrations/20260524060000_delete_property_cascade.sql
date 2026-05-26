-- ============================================================================
-- delete_property_cascade(uuid)
-- ============================================================================
-- Function que borra una property con TODAS sus dependencias. Solo accesible
-- al owner del property (verificado via is_property_owner). El server action
-- en app/actions/property.ts agrega una confirmacion adicional (typing del
-- slug exacto) como defensa UI.
--
-- Borrar via DELETE en properties dispara CASCADE en las FKs que tienen
-- ON DELETE CASCADE (bank_accounts, room_types, rooms, bookings, holds,
-- payments, etc.). Pero como las migrations originales (creadas via Prisma
-- en B2 + via apply_migration mid-sesion) no garantizan CASCADE en todas
-- las tablas, hacemos DELETEs explicitos en orden para no dejar huerfanos.
--
-- Audit log NO se borra — queda como registro historico del owner. Si
-- queremos compliance "right to be forgotten" en el futuro, agregar.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_property_cascade(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo owner puede borrar. is_super_admin tambien aplica.
  IF NOT public.is_property_owner(p_id) THEN
    RAISE EXCEPTION 'forbidden: only the property owner can delete it'
      USING ERRCODE = '42501';
  END IF;

  -- Dependencias en orden de FK (de hoja a raiz). Best-effort: si una
  -- tabla no existe en este schema, falla silenciosamente y continua.
  -- Por eso usamos DO blocks con EXCEPTION OTHERS THEN NULL.

  -- Pagos primero (FK a bookings + holds).
  DELETE FROM public.payments WHERE property_id = p_id;

  -- Holds + bookings (FK a property + room_type + room).
  DELETE FROM public.booking_holds WHERE property_id = p_id;
  DELETE FROM public.bookings WHERE property_id = p_id;

  -- External blocks (iCal sync) + ical feeds.
  BEGIN DELETE FROM public.external_blocks WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.ical_feeds WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- WhatsApp/messaging.
  BEGIN DELETE FROM public.whatsapp_messages WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.whatsapp_configs WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Email logs (best effort).
  BEGIN DELETE FROM public.email_logs WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Webhook logs (best effort).
  BEGIN DELETE FROM public.webhook_logs WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Wompi + bank accounts.
  BEGIN DELETE FROM public.wompi_configs WHERE property_id = p_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  DELETE FROM public.bank_accounts WHERE property_id = p_id;

  -- Seasonal rates (FK a room_types, no a property directo; las borra
  -- el DELETE de room_types abajo via CASCADE — pero por defensa hacemos
  -- DELETE explicito buscando los room_types de la property).
  DELETE FROM public.seasonal_rates
    WHERE room_type_id IN (
      SELECT id FROM public.room_types WHERE property_id = p_id
    );

  -- Rooms primero (FK a room_types y property).
  DELETE FROM public.rooms WHERE property_id = p_id;

  -- Room types.
  DELETE FROM public.room_types WHERE property_id = p_id;

  -- Property users (membresia).
  DELETE FROM public.property_users WHERE property_id = p_id;

  -- Finalmente la property.
  DELETE FROM public.properties WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_property_cascade(uuid) TO authenticated;
