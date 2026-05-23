"use client";

import { useState } from "react";
import { PSEBadge } from "./icons";

/**
 * Boton "Pagar con PSE". Al click, pega a /api/booking/[holdId]/pse-link y
 * redirige al checkout de Wompi con la URL devuelta. Manejo de errores
 * inline (banner debajo del boton).
 */
export function PSEButton({
  holdId,
  slug,
}: {
  holdId: string;
  slug: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/booking/${holdId}/pse-link?slug=${encodeURIComponent(slug)}`,
        { method: "POST" },
      );
      const data = (await res.json()) as { url?: string; error?: string; message?: string };
      if (!res.ok || !data.url) {
        setError(
          data.message ??
            (data.error === "wompi_not_configured"
              ? "Wompi no esta configurado para esta propiedad. Contactanos para procesar tu reserva."
              : "No pudimos iniciar el pago. Intenta de nuevo o contactanos."),
        );
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Hubo un problema de conexion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="w-full h-16 bg-sage text-cream rounded-[16px] mt-10 inline-flex items-center justify-center gap-3 font-serif font-medium text-[19px] tracking-[-0.01em] hover:bg-[#4F6759] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <PSEBadge variant="white" />
        {loading ? "Generando enlace…" : "Pagar ahora con PSE"}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-3 text-xs text-danger border border-danger/30 bg-danger/5 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}
    </>
  );
}
