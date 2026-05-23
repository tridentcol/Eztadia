"use client";

import { useState } from "react";
import type { StaffMember } from "@/lib/staff";
import { RolePill } from "./RolePill";
import { IconDotsThree, IconMailInvite } from "./icons";

export function MemberCard({ member }: { member: StaffMember }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPending = member.status.kind === "pending-invite";

  return (
    <article className="flex items-center gap-4 bg-paper border border-rule rounded-2xl px-5 py-5 sm:px-6 transition-colors hover:bg-linen hover:border-rule-strong">
      <Avatar member={member} />
      <div className="flex-1 min-w-0">
        <p className="font-serif italic font-medium text-[16px] sm:text-[18px] text-ink m-0 mb-1 tracking-[-0.015em] inline-flex items-center gap-2">
          {member.fullName ? (
            member.fullName
          ) : (
            <span className="text-ink-soft">Invitación pendiente</span>
          )}
          {member.isYou && (
            <span className="bg-linen text-ink-muted text-[10px] font-medium tracking-[0.08em] uppercase px-2 py-0.5 rounded-full">
              Tú
            </span>
          )}
        </p>
        <p className="text-[12px] sm:text-[13px] text-ink-muted m-0 mb-2 truncate">{member.email}</p>
        <StatusLine member={member} />
      </div>
      <RolePill role={member.role} />
      <ActionsMenu
        isPending={isPending}
        isYou={!!member.isYou}
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        onClose={() => setMenuOpen(false)}
      />
    </article>
  );
}

function Avatar({ member }: { member: StaffMember }) {
  if (member.status.kind === "pending-invite") {
    return (
      <span
        aria-hidden
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linen text-ink-muted inline-flex items-center justify-center shrink-0"
      >
        <IconMailInvite className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center font-serif font-medium text-[15px] sm:text-[19px] tracking-[-0.01em] shrink-0"
    >
      {member.initials}
    </span>
  );
}

function StatusLine({ member }: { member: StaffMember }) {
  const s = member.status;
  if (s.kind === "active") {
    return (
      <p className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft m-0">
        <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-sage" />
        {member.fullName?.endsWith("a") ? "Activa" : "Activo"} · última conexión {s.lastSeenLabel}
      </p>
    );
  }
  if (s.kind === "inactive") {
    return (
      <p className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft m-0">
        <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-ink-muted" />
        Inactivo · última conexión {s.lastSeenLabel}
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-[7px] text-[12.5px] text-ink-soft m-0">
      <span aria-hidden className="w-[7px] h-[7px] rounded-full bg-gold" />
      Invitación enviada · expira en <span className="oldstyle">{s.expiresInDays}</span> días
    </p>
  );
}

function ActionsMenu({
  isPending,
  isYou,
  open,
  onToggle,
  onClose,
}: {
  isPending: boolean;
  isYou: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <span className="relative inline-block shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Acciones"
        className="w-9 h-9 rounded-[10px] text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center transition-colors"
      >
        <IconDotsThree className="w-4 h-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onClose}
            className="fixed inset-0 z-[20] cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-[36px] z-[25] w-[220px] bg-paper border border-rule rounded-xl p-1.5"
            style={{ boxShadow: "var(--shadow-pop, var(--shadow-soft))" }}
          >
            {!isYou && (
              <button
                role="menuitem"
                onClick={onClose}
                className="w-full text-left text-[13px] text-ink px-2.5 py-2 rounded-lg hover:bg-linen transition-colors"
              >
                Cambiar rol →
              </button>
            )}
            {isPending && (
              <button
                role="menuitem"
                onClick={onClose}
                className="w-full text-left text-[13px] text-ink px-2.5 py-2 rounded-lg hover:bg-linen transition-colors"
              >
                Reenviar invitación
              </button>
            )}
            {!isPending && !isYou && (
              <button
                role="menuitem"
                onClick={onClose}
                className="w-full text-left text-[13px] text-ink px-2.5 py-2 rounded-lg hover:bg-linen transition-colors"
              >
                Ver actividad
              </button>
            )}
            <div aria-hidden className="h-px bg-rule mx-1 my-1" />
            <button
              role="menuitem"
              onClick={onClose}
              className="w-full text-left text-[13px] text-clay px-2.5 py-2 rounded-lg hover:bg-[rgba(199,111,76,0.08)] transition-colors"
            >
              {isPending ? "Cancelar invitación" : isYou ? "Salir del equipo" : "Remover del equipo"}
            </button>
          </div>
        </>
      )}
    </span>
  );
}
