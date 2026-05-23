-- ============================================================================
-- Properties: SELECT policy alternativa "via organizations" (defensive)
-- ============================================================================
-- Aun con el trigger auto_link_property_owner, hay un timing donde PostgREST
-- INSERT...RETURNING evalua la SELECT policy ANTES de que el AFTER trigger
-- haya creado el property_users link. Resultado: error "violates RLS" al
-- hacer INSERT().select().single() desde un client autenticado.
--
-- Fix: agregamos policy SELECT que dispara si el user es owner de la org.
-- Esto cubre el caso recien-creado y no debilita seguridad: solo permite ver
-- a quien ya seria capaz de insertar la misma propiedad.
-- ============================================================================

CREATE POLICY "properties_org_owner_select" ON public.properties
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = properties.organization_id
        AND o.owner_id = auth.uid()
    )
  );
