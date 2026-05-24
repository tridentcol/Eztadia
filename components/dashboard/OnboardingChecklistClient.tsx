"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChecklistItem, ChecklistStatus } from "@/lib/db/queries/onboarding-checklist";
import { IconCheck, IconArrowRight } from "./icons";
import { RoomTypeFormDrawer } from "@/components/rooms/RoomTypeFormDrawer";
import { dismissOnboardingChecklistAction } from "@/app/actions/onboarding-checklist";

/**
 * Client wrapper del OnboardingChecklist: maneja drawers contextuales para
 * items que tienen form inline (hoy: roomType) y dismiss persistente via
 * cookie. Items sin drawer caen al navigation via Link.
 *
 * Server pasa status precomputado + propertyId. El client refresca la pagina
 * tras una accion exitosa para que getChecklistStatus se recompute.
 */
export function OnboardingChecklistClient({
  status,
  propertyId,
}: {
  status: ChecklistStatus;
  propertyId: string;
}) {
  const [openDrawer, setOpenDrawer] = useState<ChecklistItem["key"] | null>(null);
  const [dismissing, setDismissing] = useState(false);

  if (status.allDone) return null;

  const progressPct = Math.round((status.completedCount / status.totalCount) * 100);

  function handleItemClick(item: ChecklistItem, e: React.MouseEvent) {
    if (item.done) return;
    if (item.key === "roomType") {
      e.preventDefault();
      setOpenDrawer("roomType");
    }
  }

  async function handleDismiss() {
    setDismissing(true);
    await dismissOnboardingChecklistAction();
    // Action revalida /dashboard — el componente desaparece tras el refresh.
  }

  return (
    <>
      <section
        aria-labelledby="onboarding-checklist-title"
        className="mb-10 rounded-[20px] border border-rule bg-paper px-7 py-6"
      >
        <header className="flex items-start justify-between gap-6 mb-5">
          <div>
            <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-2">
              Empecemos
            </span>
            <h2
              id="onboarding-checklist-title"
              className="font-serif italic font-medium text-ink m-0 tracking-[-0.015em]"
              style={{ fontSize: 22 }}
            >
              Configura tu propiedad.
            </h2>
            <p className="mt-2 text-sm text-ink-soft leading-[1.5] m-0 max-w-[52ch]">
              Estos cinco pasos te dejan listo para recibir tu primera reserva. Hazlos cuando quieras
              — el orden no importa.
            </p>
          </div>
          <div className="text-right whitespace-nowrap">
            <div className="font-serif italic font-medium text-ink text-[28px] leading-none tracking-[-0.015em]">
              <span className="oldstyle">{status.completedCount}</span>
              <span className="text-ink-muted">
                {" / "}
                <span className="oldstyle">{status.totalCount}</span>
              </span>
            </div>
            <div className="mt-1 text-[11px] tracking-[0.08em] uppercase text-ink-muted">listos</div>
          </div>
        </header>

        <div
          className="h-1 rounded-full bg-linen overflow-hidden mb-6"
          role="progressbar"
          aria-valuenow={status.completedCount}
          aria-valuemin={0}
          aria-valuemax={status.totalCount}
        >
          <div
            className="h-full bg-sage transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="m-0 p-0 list-none flex flex-col">
          {status.items.map((item, i) => (
            <li key={item.key} className={i === 0 ? "" : "border-t border-rule"}>
              <Link
                href={item.href}
                onClick={(e) => handleItemClick(item, e)}
                className="group flex items-center gap-4 py-4 -mx-2 px-2 rounded-md hover:bg-cream transition-colors"
              >
                <ChecklistDot done={item.done} />
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      "text-[15px] m-0 leading-tight",
                      item.done ? "text-ink-muted line-through" : "text-ink font-medium",
                    ].join(" ")}
                  >
                    {item.label}
                  </p>
                  {!item.done && (
                    <p className="mt-1 text-[13px] text-ink-soft leading-[1.5] m-0">
                      {item.description}
                    </p>
                  )}
                </div>
                {!item.done && (
                  <IconArrowRight className="w-4 h-4 text-ink-muted group-hover:text-sage transition-colors flex-shrink-0" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-4 border-t border-rule flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={dismissing}
            className="text-[12.5px] font-medium text-ink-muted hover:text-ink-soft transition-colors disabled:opacity-50"
          >
            {dismissing ? "Escondiendo…" : "Esconder por ahora"}
          </button>
        </div>
      </section>

      <RoomTypeFormDrawer
        open={openDrawer === "roomType"}
        onClose={() => setOpenDrawer(null)}
        propertyId={propertyId}
      />
    </>
  );
}

function ChecklistDot({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "w-6 h-6 rounded-full flex-shrink-0 inline-flex items-center justify-center",
        done ? "bg-sage text-cream" : "border-[1.5px] border-rule-strong bg-paper",
      ].join(" ")}
    >
      {done && <IconCheck className="w-3.5 h-3.5" strokeWidth={2} />}
    </span>
  );
}
