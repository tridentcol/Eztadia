"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production: report to Sentry / logging service.
    console.error(error);
  }, [error]);

  const code = error.digest ? `ERR_${error.digest.slice(0, 8).toUpperCase()}` : "ERR_UNKNOWN";
  const at = new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });

  return (
    <main id="main" className="min-h-screen flex items-center justify-center bg-cream">
      <ErrorState
        variant="500"
        title="Algo se nos rompió."
        body="No es tu culpa. Ya recibimos el aviso y estamos revisando. Intenta de nuevo en un momento."
        actions={[
          { label: "Reintentar", onClick: reset, variant: "sage" },
          {
            label: "Reportar el problema",
            href: "https://wa.me/573112223344",
            variant: "ghost",
          },
        ]}
        errorCode={code}
        errorAt={at}
      />
    </main>
  );
}
