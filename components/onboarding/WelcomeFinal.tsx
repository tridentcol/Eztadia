"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore, slugify } from "@/lib/onboarding-store";
import { HeroCurveLarge } from "./icons";
import { createPropertyOnboardingAction } from "@/app/actions/property";

export function WelcomeFinal({ ownerFirstName = "Carlos" }: { ownerFirstName?: string }) {
  const router = useRouter();
  const org = useOnboardingStore((s) => s.org);
  const property = useOnboardingStore((s) => s.property);
  const reset = useOnboardingStore((s) => s.reset);
  const propertyName = property.name || "tu propiedad";
  const submittedRef = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    (async () => {
      const result = await createPropertyOnboardingAction({
        organizationName: org.name || "Mi organización",
        name: property.name,
        slug: property.slug || slugify(property.name),
        city: property.city || undefined,
      });
      // createPropertyOnboardingAction llama redirect() en exito.
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      // Fallback: si redirect no llego (server action en client), forzamos.
      reset();
      router.push("/dashboard");
    })();
  }, [org.name, property, reset, router]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-8 py-20">
      <HeroCurveLarge className="text-gold mb-10 welcome-draw" width={200} height={60} />
      <h1 className="font-serif italic font-medium text-[clamp(36px,6vw,48px)] text-ink m-0 mb-4 tracking-[-0.025em] leading-[1.05] welcome-fade-1">
        Listo, <em className="italic">{ownerFirstName}.</em>
      </h1>
      <p className="text-base text-ink-soft m-0 max-w-[44ch] welcome-fade-2">
        Tu{" "}
        <em className="italic font-serif font-medium text-ink not-italic-fallback" style={{ fontStyle: "italic" }}>
          {propertyName}
        </em>{" "}
        está creada. Te llevamos a tu dashboard.
      </p>
      {submitError && (
        <p className="mt-6 text-sm text-danger max-w-[44ch]" role="alert">
          {submitError}
        </p>
      )}

      <style>{`
        .welcome-draw path {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          animation: welcome-draw 1.2s cubic-bezier(0.32, 0.72, 0, 1) 200ms forwards;
        }
        @keyframes welcome-draw { to { stroke-dashoffset: 0; } }

        .welcome-fade-1 { opacity: 0; animation: welcome-fade-up 600ms cubic-bezier(0.32, 0.72, 0, 1) 600ms forwards; }
        .welcome-fade-2 { opacity: 0; animation: welcome-fade-up 600ms cubic-bezier(0.32, 0.72, 0, 1) 900ms forwards; }
        @keyframes welcome-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-draw path, .welcome-fade-1, .welcome-fade-2 {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
