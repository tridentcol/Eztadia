"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowRight, IconCheck } from "./icons";
import { markChecklistCelebratedAction } from "@/app/actions/onboarding-checklist";

/**
 * Banner one-shot que aparece cuando el checklist llega a 5/5. La cookie
 * eztadia.onboarding_celebrated se setea al montar — el banner queda
 * visible en este render pero no vuelve a aparecer en futuros loads.
 *
 * Diseño tierra: terracotta + serif italic, sin emojis decorativos.
 */
export function OnboardingCelebration({ propertySlug }: { propertySlug: string }) {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Best-effort, sin await: marcamos celebrated al primer render.
    markChecklistCelebratedAction().catch(() => undefined);
  }, []);

  if (closed) return null;

  return (
    <section
      aria-labelledby="onboarding-celebration-title"
      className="mb-10 rounded-[20px] border border-rule bg-paper px-7 py-7 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(199,111,76,0.04) 0%, rgba(94,138,95,0.06) 100%), var(--paper)",
      }}
    >
      <div className="flex items-start gap-5">
        <span
          aria-hidden
          className="w-12 h-12 rounded-full bg-sage text-cream inline-flex items-center justify-center flex-shrink-0"
        >
          <IconCheck className="w-6 h-6" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-terracotta mb-2">
            Listo
          </span>
          <h2
            id="onboarding-celebration-title"
            className="font-serif italic font-medium text-ink m-0 tracking-[-0.015em]"
            style={{ fontSize: 24 }}
          >
            Tu propiedad está activa.
          </h2>
          <p className="mt-2 text-sm text-ink-soft leading-[1.55] m-0 max-w-[58ch]">
            Ya tenés todo configurado. Tu página pública está recibiendo visitas — la podés
            compartir con huéspedes potenciales y empezar a recibir reservas.
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Link
              href={`/p/${propertySlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-terracotta text-cream text-sm font-medium hover:bg-clay transition-colors"
            >
              Ver página pública
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setClosed(true)}
              className="h-10 px-4 rounded-xl text-sm font-medium text-ink-soft hover:bg-linen hover:text-ink transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
