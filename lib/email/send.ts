import "server-only";
import { Resend } from "resend";
import type { ReactElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type EmailStatus = Database["public"]["Enums"]["EmailStatus"];

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Eztadia <onboarding@resend.dev>";

let cachedResend: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(RESEND_API_KEY);
  return cachedResend;
}

/**
 * Best-effort sendEmail. NUNCA tira — los flows que la invocan
 * (booking hold, payment confirm, webhook) no deben romperse si el email
 * falla. Cada intento queda registrado en email_logs (con status `failed`
 * si Resend devuelve error o `sent`/`bounced` segun respuesta).
 *
 * Si RESEND_API_KEY no esta configurada, se loggea `failed` con motivo
 * y se retorna { resendId: null } sin interrumpir.
 *
 * `template` es el slug que identifica la plantilla (p.ej. "booking-pending-payment")
 * para filtros en /admin/emails.
 */
export async function sendEmail(args: {
  to: string;
  template: string;
  subject: string;
  react: ReactElement;
  propertyId?: string | null;
}): Promise<{ resendId: string | null; status: EmailStatus }> {
  const admin = createAdminClient();
  const resend = getResend();

  if (!resend) {
    await logEmail(admin, {
      to: args.to,
      template: args.template,
      subject: args.subject,
      propertyId: args.propertyId ?? null,
      status: "failed",
      resendId: null,
    });
    return { resendId: null, status: "failed" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      react: args.react,
    });
    if (error || !data) {
      await logEmail(admin, {
        to: args.to,
        template: args.template,
        subject: args.subject,
        propertyId: args.propertyId ?? null,
        status: "failed",
        resendId: null,
      });
      return { resendId: null, status: "failed" };
    }
    await logEmail(admin, {
      to: args.to,
      template: args.template,
      subject: args.subject,
      propertyId: args.propertyId ?? null,
      status: "sent",
      resendId: data.id ?? null,
    });
    return { resendId: data.id ?? null, status: "sent" };
  } catch {
    await logEmail(admin, {
      to: args.to,
      template: args.template,
      subject: args.subject,
      propertyId: args.propertyId ?? null,
      status: "failed",
      resendId: null,
    });
    return { resendId: null, status: "failed" };
  }
}

async function logEmail(
  admin: ReturnType<typeof createAdminClient>,
  row: {
    to: string;
    template: string;
    subject: string;
    propertyId: string | null;
    status: EmailStatus;
    resendId: string | null;
  },
): Promise<void> {
  await admin.from("email_logs").insert({
    to_email: row.to,
    template: row.template,
    subject: row.subject,
    property_id: row.propertyId,
    status: row.status,
    resend_id: row.resendId,
  });
}
