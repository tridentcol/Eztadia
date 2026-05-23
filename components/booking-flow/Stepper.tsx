import { Fragment } from "react";

export type Step = "fechas" | "datos" | "pago";

const STEPS: { key: Step; label: string }[] = [
  { key: "fechas", label: "Fechas" },
  { key: "datos", label: "Datos" },
  { key: "pago", label: "Pago" },
];

export function Stepper({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label="Pasos de la reserva"
      className="max-w-[480px] mx-auto mt-10 mb-8 px-4 grid items-center"
      style={{ gridTemplateColumns: "auto 1fr auto 1fr auto" }}
    >
      {STEPS.map((s, i) => {
        const state: "done" | "current" | "future" =
          i < idx ? "done" : i === idx ? "current" : "future";
        return (
          <Fragment key={s.key}>
            <div className="flex flex-col items-center gap-2 w-[90px]">
              <span
                className={[
                  "w-3 h-3 rounded-full relative",
                  state === "future"
                    ? "bg-transparent border-[1.5px] border-ink-muted"
                    : "bg-sage",
                  state === "current"
                    ? "after:content-[''] after:absolute after:-inset-[5px] after:rounded-full after:border-2 after:border-sage-tint"
                    : "",
                ].join(" ")}
                aria-hidden
              />
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={`text-[11px] font-medium tracking-[0.08em] uppercase whitespace-nowrap ${
                  state === "future" ? "text-ink-muted" : "text-sage"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`h-px mx-2 ${i < idx ? "bg-sage" : "bg-rule"}`}
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
