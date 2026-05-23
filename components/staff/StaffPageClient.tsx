"use client";

import { useState } from "react";
import type { StaffMember } from "@/lib/staff";
import { MemberCard } from "./MemberCard";
import { InviteModal } from "./InviteModal";
import { IconPlus } from "./icons";

export function StaffPageClient({ members }: { members: StaffMember[] }) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
            Tu equipo
          </h1>
          <p className="text-sm text-ink-muted m-0 max-w-[56ch]">
            Invita a quienes te ayudan a hospedar. Cada uno con permisos según su rol.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-xl text-sm font-medium text-cream bg-terracotta hover:bg-clay transition-colors"
        >
          <IconPlus className="w-[14px] h-[14px]" />
          Invitar miembro
        </button>
      </header>

      <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
        {members.map((m) => (
          <li key={m.id}>
            <MemberCard member={m} />
          </li>
        ))}
      </ul>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
