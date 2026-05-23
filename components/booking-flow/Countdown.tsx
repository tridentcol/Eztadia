"use client";

import { useEffect, useState } from "react";
import { IconClock } from "./icons";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function format(totalSeconds: number, showHours: boolean): string {
  if (totalSeconds <= 0) return showHours ? "00:00:00" : "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return showHours ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h * 60 + m)}:${pad(s)}`;
}

export function Countdown({
  expiresAt,
  showHours = false,
  warningThresholdSec = 300,
}: {
  expiresAt: string;
  showHours?: boolean;
  warningThresholdSec?: number;
}) {
  const target = new Date(expiresAt).getTime();
  const [secs, setSecs] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));

  useEffect(() => {
    const tick = () => setSecs(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const warning = secs > 0 && secs < warningThresholdSec;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-mono text-[13px] px-2.5 py-1 rounded-lg",
        warning ? "bg-[rgba(184,146,62,0.14)] text-warning" : "bg-linen text-ink",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <IconClock className="w-3.5 h-3.5 text-ink-muted" />
      Expira en <span className="oldstyle">{format(secs, showHours)}</span>
    </span>
  );
}
