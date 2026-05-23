import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/session";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";

export const metadata: Metadata = {
  title: "Admin · Errores — Eztadia",
};

export default async function AdminErrorsPage() {
  try {
    await requireSuperAdmin();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/login");
    if (err instanceof ForbiddenError) redirect("/forbidden");
    throw err;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
  const isConfigured = dsn.length > 0;

  return (
    <main
      id="main"
      className="max-w-[820px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
          Errores
        </h1>
        <p className="text-sm text-ink-muted m-0 max-w-[60ch] leading-[1.55]">
          Las excepciones se reportan automáticamente a Sentry. Abre el
          dashboard externo para investigar incidentes — Eztadia no replica
          los logs aquí para evitar superficie de ataque.
        </p>
      </header>

      {isConfigured ? <ConfiguredCard /> : <NotConfiguredCard />}

      <section className="mt-10">
        <h2 className="font-serif italic font-medium text-[18px] text-ink m-0 mb-3">
          Qué se reporta
        </h2>
        <ul className="list-none p-0 m-0 grid sm:grid-cols-2 gap-3">
          {WHAT_IS_REPORTED.map((item) => (
            <li
              key={item.title}
              className="bg-paper border border-rule rounded-2xl p-4"
            >
              <p className="text-[13.5px] font-medium text-ink m-0 mb-1">
                {item.title}
              </p>
              <p className="text-[12px] text-ink-muted m-0 leading-relaxed">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 bg-linen rounded-2xl p-5">
        <h2 className="font-serif italic font-medium text-[16px] text-ink m-0 mb-2">
          Qué NO se reporta
        </h2>
        <ul className="m-0 pl-5 text-[12.5px] text-ink-soft leading-[1.7]">
          <li>Contraseñas, tokens ni cookies de sesión.</li>
          <li>Credenciales de Wompi / Meta cifradas en la DB.</li>
          <li>Cuerpo completo de mensajes WhatsApp.</li>
          <li>
            Direcciones IP completas — se truncan al octeto antes de salir
            del servidor.
          </li>
        </ul>
      </section>
    </main>
  );
}

const WHAT_IS_REPORTED = [
  {
    title: "Excepciones no capturadas",
    desc: "Errores que escalan a route handlers o Server Components sin try/catch.",
  },
  {
    title: "Errores de webhook",
    desc: "Wompi y Meta — fallos de verificación HMAC, payloads malformados, idempotencia rota.",
  },
  {
    title: "Cron failures",
    desc: "Jobs programados (`expire-holds`, `sync-ical`) que terminan con exit code distinto de 0.",
  },
  {
    title: "Errores cliente",
    desc: "Excepciones JS en producción (fetch fails, errores en hydration, etc.).",
  },
];

function ConfiguredCard() {
  return (
    <section className="bg-paper border-[1.5px] border-sage rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="w-10 h-10 rounded-full bg-sage-tint inline-flex items-center justify-center text-sage shrink-0"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink m-0 mb-1">
            Sentry está configurado
          </p>
          <p className="text-[12.5px] text-ink-soft m-0 mb-4 leading-relaxed">
            DSN detectado en variables de entorno. Las nuevas excepciones se
            reportan en tiempo real.
          </p>
          <a
            href="https://sentry.io/auth/login/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-sage text-cream text-sm font-medium hover:bg-[#4F6759] transition-colors"
          >
            Abrir Sentry
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function NotConfiguredCard() {
  return (
    <section className="bg-paper border-[1.5px] border-[rgba(184,146,62,0.45)] rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0"
          style={{
            background: "rgba(184,146,62,0.14)",
            color: "var(--color-gold-dark)",
          }}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink m-0 mb-1">
            Sentry todavía no está configurado
          </p>
          <p className="text-[12.5px] text-ink-soft m-0 mb-4 leading-relaxed">
            Las excepciones se loguean a stdout pero no se persisten. Para
            recibir alertas en producción, configura{" "}
            <code className="font-mono text-[11.5px] bg-linen px-1.5 py-0.5 rounded">
              NEXT_PUBLIC_SENTRY_DSN
            </code>{" "}
            en las variables de entorno y reinicia el deploy.
          </p>
          <p className="text-[12px] text-ink-muted m-0 leading-relaxed">
            Phase F1 del blueprint incluye el wire-up completo (instrument.ts +
            ErrorBoundary global + breadcrumbs para tool use).
          </p>
        </div>
      </div>
    </section>
  );
}
