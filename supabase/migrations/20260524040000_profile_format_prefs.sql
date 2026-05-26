-- ============================================================================
-- profiles: date_format + number_format prefs
-- ============================================================================
-- El tab "Idioma y region" en /dashboard/settings necesita persistir
-- preferencias de formato del usuario. locale ya existe en profiles desde
-- B2. Agregamos los otros dos como text con CHECK constraint en lugar de
-- enum (mas facil de extender sin migration nueva — solo basta ALTER el
-- CHECK).
--
-- RLS: profiles.update ya existe (id = auth.uid()). No requiere policy
-- nueva.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_format text NOT NULL DEFAULT 'dmy'
    CHECK (date_format IN ('dmy', 'mdy', 'iso'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS number_format text NOT NULL DEFAULT 'comma-decimal'
    CHECK (number_format IN ('comma-decimal', 'dot-decimal'));
