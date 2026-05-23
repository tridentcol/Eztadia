"use client";

import { useState } from "react";
import {
  NOTIFICATION_EVENTS,
  type NotificationChannel,
  type NotificationPrefs,
  type NotificationEventKey,
} from "@/lib/personal-settings";
import { ToggleSwitch } from "@/components/property-settings/primitives";
import { IconMail, IconWhatsApp, IconBell } from "../icons";

const CHANNELS: { key: NotificationChannel; label: string; Icon: typeof IconMail }[] = [
  { key: "email", label: "Email", Icon: IconMail },
  { key: "whatsapp", label: "WhatsApp", Icon: IconWhatsApp },
  { key: "inapp", label: "In-app", Icon: IconBell },
];

export function NotificationsTab({ initial }: { initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initial);

  function toggle(event: NotificationEventKey, channel: NotificationChannel) {
    setPrefs((p) => ({
      ...p,
      [event]: { ...p[event], [channel]: !p[event][channel] },
    }));
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 mb-2.5 tracking-[-0.02em] leading-[1.1]">
          Qué quieres saber
        </h1>
        <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
          Elige qué te notificamos y cómo. Los toggles guardan automáticamente.
        </p>
      </header>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-left px-3 py-3.5 border-b border-rule text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted"
              >
                Evento
              </th>
              {CHANNELS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="px-3 py-3.5 border-b border-rule text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted text-center"
                  style={{ width: 110 }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_EVENTS.map((ev) => (
              <tr key={ev.key}>
                <td className="px-3 py-4 border-b border-rule align-middle">
                  <p className="text-sm font-medium text-ink m-0 mb-0.5">{ev.title}</p>
                  <p className="text-xs text-ink-muted m-0 leading-[1.45]">{ev.subtitle}</p>
                </td>
                {CHANNELS.map((c) => (
                  <td
                    key={c.key}
                    className="px-3 py-4 border-b border-rule text-center align-middle"
                  >
                    <ToggleSwitch
                      checked={prefs[ev.key][c.key]}
                      onChange={() => toggle(ev.key, c.key)}
                      ariaLabel={`${ev.title} — ${c.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-2.5">
        {NOTIFICATION_EVENTS.map((ev) => (
          <article key={ev.key} className="bg-paper border border-rule rounded-2xl p-4">
            <p className="text-sm font-medium text-ink m-0 mb-1">{ev.title}</p>
            <p className="text-xs text-ink-muted m-0 mb-3.5 leading-[1.45]">{ev.subtitle}</p>
            <div className="flex flex-col gap-2.5">
              {CHANNELS.map(({ key, label, Icon }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-soft">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                  <ToggleSwitch
                    checked={prefs[ev.key][key]}
                    onChange={() => toggle(ev.key, key)}
                    ariaLabel={`${ev.title} — ${label}`}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
