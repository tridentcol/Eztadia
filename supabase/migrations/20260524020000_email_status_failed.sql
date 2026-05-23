-- Agrega valor 'failed' al enum EmailStatus.
--
-- Motivo (sesion 8 · E4 Resend wire-up): el wrapper sendEmail() necesita
-- registrar intentos que NO llegaron a salir (Resend devolvio error, faltaba
-- API key, etc) con un estado distinto a 'bounced' (que significa rebote
-- del destinatario despues de salir).
--
-- Operacion additive — no rompe nada existente.

ALTER TYPE "EmailStatus" ADD VALUE IF NOT EXISTS 'failed';
