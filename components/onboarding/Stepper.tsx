import { Fragment } from "react";
import type { OnboardingStep } from "@/lib/onboarding-store";

const STEPS: { step: 1 | 2; label: string; shortLabel: string }[] = [
  { step: 1, label: "Tu organización", shortLabel: "Organización" },
  { step: 2, label: "Tu propiedad", shortLabel: "Propiedad" },
];

export function OnboardingStepper({
  current,
  compact = false,
}: {
  current: OnboardingStep;
  compact?: boolean;
}) {
  const currentNum: number = current === "done" ? 3 : Number(current);

  return (
    <nav
      aria-label="Pasos del onboarding"
      className="grid items-center mb-10"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        maxWidth: compact ? 280 : 380,
      }}
    >
      {STEPS.map((s, i) => {
        const state: "done" | "current" | "future" =
          s.step < currentNum ? "done" : s.step === currentNum ? "current" : "future";
        return (
          <Fragment key={s.step}>
            <div
              className="flex flex-col items-center gap-2"
              style={{ width: compact ? 78 : 120 }}
            >
              <span
                aria-hidden
                className={[
                  "w-3 h-3 rounded-full relative",
                  state === "future"
                    ? "bg-transparent border-[1.5px] border-ink-muted"
                    : "bg-sage",
                  state === "current"
                    ? "after:content-[''] after:absolute after:-inset-[5px] after:rounded-full after:border-2 after:border-sage-tint"
                    : "",
                ].join(" ")}
              />
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={[
                  "font-medium tracking-[0.08em] uppercase whitespace-nowrap",
                  compact ? "text-[10px]" : "text-[11px]",
                  state === "future" ? "text-ink-muted" : "text-sage",
                ].join(" ")}
              >
                {compact ? s.shortLabel : s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`h-px mx-2 ${s.step < currentNum ? "bg-sage" : "bg-rule"}`}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
