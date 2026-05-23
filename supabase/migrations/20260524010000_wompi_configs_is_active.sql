-- Agrega columna is_active a wompi_configs.
-- Permite a un owner pausar pagos PSE sin perder las credenciales — útil
-- cuando Wompi rechaza la cuenta temporalmente o durante mantenimiento.
--
-- Aplicada vía MCP apply_migration "wompi_configs_is_active" el 2026-05-23.
-- Este archivo replica la sentencia en el repo para que `supabase db reset`
-- y `supabase db push` desde clean funcionen.

ALTER TABLE public.wompi_configs
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
