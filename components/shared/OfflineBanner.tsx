"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    function update() {
      setOffline(!navigator.onLine);
    }
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[60] flex items-center gap-3.5 px-6 py-3"
      style={{
        background: "var(--color-warning-tint, rgba(196,154,60,0.14))",
        borderBottom: "1px solid rgba(196,154,60,0.4)",
      }}
    >
      <svg
        className="w-5 h-5 text-warning shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M 3 16 C 3 12, 6 9, 10 9 C 11 6, 14 4, 17 5 C 20 5, 22 8, 22 11 C 22 14, 20 16, 17 16 L 8 16" />
        <path d="m 3 3 18 18" />
      </svg>
      <span className="flex-1 text-sm text-ink">
        Sin conexión. Algunas acciones no funcionarán hasta que vuelvas.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="text-[13px] font-medium text-ink-soft px-3 py-1.5 rounded-lg bg-paper border border-rule hover:bg-linen hover:text-ink transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
