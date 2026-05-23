"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { HeroCurveLarge } from "./icons";

export function WelcomeFinal({ ownerFirstName = "Carlos" }: { ownerFirstName?: string }) {
  const router = useRouter();
  const propertyName = useOnboardingStore((s) => s.property.name) || "tu propiedad";
  const reset = useOnboardingStore((s) => s.reset);

  useEffect(() => {
    const t = window.setTimeout(() => {
      reset();
      router.push("/dashboard");
    }, 1800);
    return () => window.clearTimeout(t);
  }, [router, reset]);

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
