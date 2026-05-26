-- ============================================================================
-- bank_accounts (1:1 con property)
-- ============================================================================
-- Datos bancarios que el owner muestra a los guests cuando eligen
-- "Transferencia bancaria" como metodo de pago. Antes hardcodeado en
-- lib/booking-flow.ts (CASA_MARINA_BANK) — bug grave multi-tenant.
--
-- Decisiones:
--   - 1:1 con property (UNIQUE constraint). Si el owner cambia banco,
--     edita el mismo registro.
--   - Datos publicos por diseño (el owner los compartiría con el guest igual).
--     No encriptar en reposo. RLS anon SELECT solo si la property is_active.
--   - account_type + holder_document_type via Postgres enums (consistente
--     con resto del schema).
--   - Si no existe row para la property → flow publico desactiva la opcion
--     "Transferencia" (decision del usuario, sesion 13).
-- ============================================================================

CREATE TYPE "BankAccountHolderDocumentType" AS ENUM ('CC', 'CE', 'NIT');
CREATE TYPE "BankAccountType"               AS ENUM ('savings', 'checking');

CREATE TABLE public.bank_accounts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id              UUID NOT NULL UNIQUE
                                REFERENCES public.properties(id) ON DELETE CASCADE,
  holder_name              TEXT NOT NULL,
  holder_document_type     "BankAccountHolderDocumentType" NOT NULL,
  holder_document_number   TEXT NOT NULL,
  bank_name                TEXT NOT NULL,
  account_type             "BankAccountType" NOT NULL,
  account_number           TEXT NOT NULL,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- anon (flow publico de pago) puede leer la cuenta si la property esta activa
CREATE POLICY "bank_accounts_anon_select_active" ON public.bank_accounts
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = bank_accounts.property_id
        AND p.is_active = true
    )
  );

-- authenticated (cualquier rol del property) puede leer
CREATE POLICY "bank_accounts_member_select" ON public.bank_accounts
  FOR SELECT TO authenticated
  USING (public.has_property_access(property_id));

-- authenticated con rol owner o manager puede insertar/actualizar/borrar
-- (reception NO — no debe poder cambiar datos de cobro)
CREATE POLICY "bank_accounts_manager_write" ON public.bank_accounts
  FOR ALL TO authenticated
  USING (public.is_property_manager_or_above(property_id))
  WITH CHECK (public.is_property_manager_or_above(property_id));

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------

ALTER TABLE public.bank_accounts ALTER COLUMN updated_at SET DEFAULT now();

DROP TRIGGER IF EXISTS bank_accounts_set_updated_at ON public.bank_accounts;
CREATE TRIGGER bank_accounts_set_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
