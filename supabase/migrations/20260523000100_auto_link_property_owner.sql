-- ============================================================================
-- Auto-link property owner via AFTER INSERT trigger
-- ============================================================================
-- Bug detectado en B10 RLS tests:
--   `INSERT INTO properties ... RETURNING *` falla con "violates RLS" cuando
--   se llama via PostgREST .insert().select(). La SELECT policy
--   properties_member_select exige link en property_users que NO existe aun
--   en el momento del RETURNING.
--
-- Fix: trigger SECURITY DEFINER que crea el property_users(role=owner) link
-- inmediatamente despues del INSERT en properties. Asi el SELECT subsiguiente
-- (del mismo PostgREST call) ya encuentra el link y devuelve la row.
--
-- Tambien hace que lib/db/mutations/properties.createProperty no necesite
-- insertar el link manualmente — el trigger se encarga. Pero por defensa en
-- profundidad lo dejamos en TS tambien (ON CONFLICT DO NOTHING).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_link_property_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Owner de la org dueña de esta property
  SELECT owner_id INTO v_owner_id
  FROM public.organizations
  WHERE id = NEW.organization_id;

  IF v_owner_id IS NULL THEN
    -- Sin org valida no podemos linkear. La FK de organization_id ya
    -- habria fallado antes; este es defensa por si llamamos en flow distinto.
    RETURN NEW;
  END IF;

  INSERT INTO public.property_users (
    property_id, user_id, role, invited_by, invitation_accepted_at
  ) VALUES (
    NEW.id, v_owner_id, 'owner', v_owner_id, now()
  )
  ON CONFLICT (property_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_property_created_link_owner ON public.properties;
CREATE TRIGGER on_property_created_link_owner
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_property_owner();
