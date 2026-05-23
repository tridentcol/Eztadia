"use client";

import { useEffect, useRef } from "react";

/**
 * Componente que renderiza el widget de Cloudflare Turnstile.
 *
 * Carga el script de Cloudflare on-demand, renderiza un widget en el div
 * con `data-sitekey` y dispara `onToken` cuando el visitante pasa el
 * desafio.
 *
 * Graceful degradation: si NEXT_PUBLIC_TURNSTILE_SITE_KEY no esta
 * configurada, no renderiza nada y dispara onToken("") inmediatamente
 * (para que el form no quede esperando un token que nunca llega en dev).
 *
 * No usa lucide ni shadcn. Estilos respetan paleta tierra (--cream bg,
 * --rule border).
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

export function Turnstile({
  onToken,
  className,
}: {
  /** Se llama con el token cuando se valida (o "" si no hay siteKey). */
  onToken: (token: string) => void;
  className?: string;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!siteKey) {
      // Sin site key → dejamos pasar (modo dev sin Cloudflare).
      onTokenRef.current("");
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    function renderWidget() {
      const tsContainer = containerRef.current;
      if (!tsContainer || !window.turnstile || !siteKey) return;
      widgetIdRef.current = window.turnstile.render(tsContainer, {
        sitekey: siteKey,
        theme: "light",
        appearance: "always",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else if (!document.getElementById(SCRIPT_ID)) {
      window.onloadTurnstileCallback = renderWidget;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      window.onloadTurnstileCallback = renderWidget;
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={containerRef} className={className} />;
}
