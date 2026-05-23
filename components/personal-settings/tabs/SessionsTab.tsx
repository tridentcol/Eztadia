"use client";

import { useState } from "react";
import type { ActiveSession } from "@/lib/personal-settings";
import { IconDesktop, IconMobile, IconBrowsers } from "../icons";

export function SessionsTab({ sessions: initial }: { sessions: ActiveSession[] }) {
  const [sessions, setSessions] = useState(initial);

  function closeOne(id: string) {
    setSessions((arr) => arr.filter((s) => s.id !== id));
  }
  function closeAllOthers() {
    setSessions((arr) => arr.filter((s) => s.isCurrent));
  }

  const others = sessions.filter((s) => !s.isCurrent);

  return (
    <>
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
          Sesiones activas
        </h1>
        <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
          Dispositivos donde tu cuenta tiene la sesión iniciada. Si ves alguna que no reconoces, ciérrala.
        </p>
      </header>

      <ul className="list-none p-0 m-0 flex flex-col gap-2.5 max-w-[720px]">
        {sessions.map((s) => (
          <li key={s.id}>
            <SessionCard session={s} onClose={() => closeOne(s.id)} />
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <button
          type="button"
          onClick={closeAllOthers}
          className="mt-6 inline-flex items-center justify-center h-10 px-[18px] rounded-xl bg-transparent text-danger border border-danger text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
        >
          Cerrar todas las demás sesiones
        </button>
      )}
    </>
  );
}

function SessionCard({
  session,
  onClose,
}: {
  session: ActiveSession;
  onClose: () => void;
}) {
  const Icon =
    session.device === "desktop"
      ? IconDesktop
      : session.device === "mobile"
        ? IconMobile
        : IconBrowsers;
  return (
    <article className="flex items-center gap-4 bg-paper border border-rule rounded-2xl px-5 sm:px-6 py-5">
      <span className="w-10 h-10 inline-flex items-center justify-center text-ink-soft shrink-0">
        <Icon className="w-7 h-7" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif italic font-medium text-[17px] text-ink m-0 mb-0.5 tracking-[-0.01em]">
          {session.label}
        </p>
        <p className="text-[13px] text-ink-soft m-0 mb-1">
          {session.location} · IP <span className="oldstyle">{session.ip}</span>
        </p>
        {session.isCurrent ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.08em] bg-sage-tint text-sage border border-[rgba(92,117,103,0.18)]">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage" />
            Esta sesión
          </span>
        ) : (
          <p className="text-[12px] text-ink-muted m-0">
            Última actividad {session.lastActiveLabel}
          </p>
        )}
      </div>
      {!session.isCurrent && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-transparent text-clay border border-[rgba(168,72,60,0.25)] text-[13px] font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors shrink-0"
        >
          Cerrar sesión
        </button>
      )}
    </article>
  );
}
