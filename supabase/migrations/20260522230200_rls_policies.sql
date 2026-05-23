-- ============================================================================
-- RLS helpers + policies (las 18 tablas)
-- ============================================================================
-- Estrategia:
--   - 5 helpers en public schema (auth schema esta locked en Supabase managed).
--   - SECURITY DEFINER para que los helpers puedan leer profiles/property_users
--     ignorando las propias policies (evita recursion infinita).
--   - ENABLE RLS en todas las tablas (sin FORCE — service_role bypass intencional).
--   - Policies por tabla con CRUD diferenciado segun role en property_users.
--   - Reads publicos (anon) en properties, room_types, rooms, seasonal_rates
--     filtrados por is_active=true para el flow /p/[slug]. Writes publicos van
--     por service_role en server actions (B4).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions (en public schema; auth schema es owned por supabase_admin)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_property_access(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_users
    WHERE property_id = p_property_id
      AND user_id = auth.uid()
      AND invitation_accepted_at IS NOT NULL
  ) OR public.is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.property_role(p_property_id UUID)
RETURNS "PropertyUserRole"
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.property_users
  WHERE property_id = p_property_id
    AND user_id = auth.uid()
    AND invitation_accepted_at IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_property_manager_or_above(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR public.property_role(p_property_id) IN ('owner', 'manager');
$$;

CREATE OR REPLACE FUNCTION public.is_property_owner(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR public.property_role(p_property_id) = 'owner';
$$;

-- Helpers son llamados desde policies que corren bajo anon/authenticated.
-- Damos execute explicito.
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_property_access(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.property_role(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_manager_or_above(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_owner(UUID) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- ENABLE RLS en todas las tablas
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_rates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_holds       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ical_feeds          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_blocks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wompi_configs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_events        ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- profiles
-- ============================================================================

CREATE POLICY "profiles_self_or_admin_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- INSERT y DELETE solo via trigger handle_new_user / cascade desde auth.users.

-- ============================================================================
-- organizations
-- ============================================================================

CREATE POLICY "organizations_owner_or_admin_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "organizations_owner_insert" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "organizations_owner_update" ON public.organizations
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "organizations_admin_delete" ON public.organizations
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- properties
-- ============================================================================

CREATE POLICY "properties_member_select" ON public.properties
  FOR SELECT TO authenticated
  USING (public.has_property_access(id));

CREATE POLICY "properties_public_active_select" ON public.properties
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "properties_owner_of_org_insert" ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = properties.organization_id AND o.owner_id = auth.uid()
    ) OR public.is_super_admin()
  );

CREATE POLICY "properties_owner_update" ON public.properties
  FOR UPDATE TO authenticated
  USING (public.is_property_owner(id))
  WITH CHECK (public.is_property_owner(id));

CREATE POLICY "properties_owner_delete" ON public.properties
  FOR DELETE TO authenticated
  USING (public.is_property_owner(id));

-- ============================================================================
-- property_users
-- ============================================================================

CREATE POLICY "property_users_member_select" ON public.property_users
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id) OR user_id = auth.uid());

CREATE POLICY "property_users_owner_insert" ON public.property_users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_property_owner(property_id));

CREATE POLICY "property_users_owner_or_self_update" ON public.property_users
  FOR UPDATE TO authenticated
  USING (public.is_property_owner(property_id) OR user_id = auth.uid())
  WITH CHECK (public.is_property_owner(property_id) OR user_id = auth.uid());

CREATE POLICY "property_users_owner_or_self_delete" ON public.property_users
  FOR DELETE TO authenticated
  USING (public.is_property_owner(property_id) OR user_id = auth.uid());

-- ============================================================================
-- room_types
-- ============================================================================

CREATE POLICY "room_types_member_select" ON public.room_types
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "room_types_public_active_select" ON public.room_types
  FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = room_types.property_id AND p.is_active = true
    )
  );

CREATE POLICY "room_types_manager_insert" ON public.room_types
  FOR INSERT TO authenticated
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "room_types_manager_update" ON public.room_types
  FOR UPDATE TO authenticated
  USING (public.is_property_manager_or_above(property_id))
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "room_types_owner_delete" ON public.room_types
  FOR DELETE TO authenticated
  USING (public.is_property_owner(property_id));

-- ============================================================================
-- rooms
-- ============================================================================

CREATE POLICY "rooms_member_select" ON public.rooms
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "rooms_public_active_select" ON public.rooms
  FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = rooms.property_id AND p.is_active = true
    )
  );

CREATE POLICY "rooms_manager_insert" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "rooms_manager_update" ON public.rooms
  FOR UPDATE TO authenticated
  USING (public.is_property_manager_or_above(property_id))
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "rooms_owner_delete" ON public.rooms
  FOR DELETE TO authenticated
  USING (public.is_property_owner(property_id));

-- ============================================================================
-- seasonal_rates
-- ============================================================================

CREATE POLICY "seasonal_rates_member_select" ON public.seasonal_rates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_types rt
      WHERE rt.id = seasonal_rates.room_type_id
        AND public.has_property_access(rt.property_id)
    )
  );

CREATE POLICY "seasonal_rates_public_select" ON public.seasonal_rates
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.room_types rt
      JOIN public.properties p ON p.id = rt.property_id
      WHERE rt.id = seasonal_rates.room_type_id
        AND rt.is_active = true
        AND p.is_active = true
    )
  );

CREATE POLICY "seasonal_rates_manager_write" ON public.seasonal_rates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_types rt
      WHERE rt.id = seasonal_rates.room_type_id
        AND public.is_property_manager_or_above(rt.property_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.room_types rt
      WHERE rt.id = seasonal_rates.room_type_id
        AND public.is_property_manager_or_above(rt.property_id)
    )
  );

-- ============================================================================
-- bookings
-- ============================================================================

CREATE POLICY "bookings_member_select" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "bookings_member_insert" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (public.has_property_access(property_id));

CREATE POLICY "bookings_member_update" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_property_access(property_id))
  WITH CHECK (public.has_property_access(property_id));

CREATE POLICY "bookings_manager_delete" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.is_property_manager_or_above(property_id));

-- ============================================================================
-- booking_holds
-- ============================================================================
-- INSERTs van por create_booking_hold() (SECURITY DEFINER) llamado desde
-- server actions con service_role. Por eso aqui NO hay policy de INSERT.

CREATE POLICY "booking_holds_member_select" ON public.booking_holds
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "booking_holds_member_update" ON public.booking_holds
  FOR UPDATE TO authenticated
  USING (public.has_property_access(property_id))
  WITH CHECK (public.has_property_access(property_id));

CREATE POLICY "booking_holds_manager_delete" ON public.booking_holds
  FOR DELETE TO authenticated
  USING (public.is_property_manager_or_above(property_id));

-- ============================================================================
-- payments
-- ============================================================================
-- Solo manager+ ve montos. Reception puede ver bookings pero no pagos.

CREATE POLICY "payments_manager_select" ON public.payments
  FOR SELECT TO authenticated
  USING (public.is_property_manager_or_above(property_id));

CREATE POLICY "payments_manager_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "payments_manager_update" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_property_manager_or_above(property_id))
  WITH CHECK (public.is_property_manager_or_above(property_id));

CREATE POLICY "payments_owner_delete" ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_property_owner(property_id));

-- ============================================================================
-- ical_feeds
-- ============================================================================

CREATE POLICY "ical_feeds_member_select" ON public.ical_feeds
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "ical_feeds_manager_write" ON public.ical_feeds
  FOR ALL TO authenticated
  USING (public.is_property_manager_or_above(property_id))
  WITH CHECK (public.is_property_manager_or_above(property_id));

-- ============================================================================
-- external_blocks
-- ============================================================================
-- Insertados por cron de sync iCal (service_role). Solo lectura para members.

CREATE POLICY "external_blocks_member_select" ON public.external_blocks
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "external_blocks_manager_delete" ON public.external_blocks
  FOR DELETE TO authenticated
  USING (public.is_property_manager_or_above(property_id));

-- ============================================================================
-- wompi_configs · whatsapp_configs (1:1 con property, contienen secrets)
-- ============================================================================

CREATE POLICY "wompi_configs_owner_select" ON public.wompi_configs
  FOR SELECT TO authenticated
  USING (public.is_property_owner(property_id));

CREATE POLICY "wompi_configs_owner_write" ON public.wompi_configs
  FOR ALL TO authenticated
  USING (public.is_property_owner(property_id))
  WITH CHECK (public.is_property_owner(property_id));

CREATE POLICY "whatsapp_configs_owner_select" ON public.whatsapp_configs
  FOR SELECT TO authenticated
  USING (public.is_property_owner(property_id));

CREATE POLICY "whatsapp_configs_owner_write" ON public.whatsapp_configs
  FOR ALL TO authenticated
  USING (public.is_property_owner(property_id))
  WITH CHECK (public.is_property_owner(property_id));

-- ============================================================================
-- whatsapp_messages
-- ============================================================================

CREATE POLICY "whatsapp_messages_member_select" ON public.whatsapp_messages
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

CREATE POLICY "whatsapp_messages_member_insert" ON public.whatsapp_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.has_property_access(property_id));

-- ============================================================================
-- email_logs
-- ============================================================================

CREATE POLICY "email_logs_member_select" ON public.email_logs
  FOR SELECT TO authenticated
  USING (
    (property_id IS NULL AND public.is_super_admin())
    OR (property_id IS NOT NULL AND public.has_property_access(property_id))
  );

-- ============================================================================
-- audit_logs
-- ============================================================================

CREATE POLICY "audit_logs_member_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    (property_id IS NULL AND public.is_super_admin())
    OR (property_id IS NOT NULL AND public.has_property_access(property_id))
    OR actor_id = auth.uid()
  );

-- ============================================================================
-- login_events
-- ============================================================================

CREATE POLICY "login_events_self_select" ON public.login_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());
