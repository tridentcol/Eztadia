"use client";

import { useEffect } from "react";
import type { AdminUserDetail } from "@/lib/admin";
import { ROLE_LABEL } from "@/lib/admin";
import { RolePill, StatusPill } from "./UserPills";
import { IconClose } from "../icons";

export function UserDetailDrawer({
  detail,
  open,
  onClose,
}: {
  detail: AdminUserDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        aria-label="Cerrar detalle"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-[80] transition-opacity duration-300 ease-organic cursor-default ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.18)" }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={detail ? `Detalle de ${detail.fullName}` : "Detalle de usuario"}
        className={[
          "fixed z-[90] bg-paper flex flex-col ease-organic transition-transform duration-[320ms]",
          "left-0 right-0 bottom-0 max-h-[92vh] rounded-t-[28px]",
          "md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[480px] md:max-h-none md:rounded-none md:border-l md:border-rule",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        ].join(" ")}
        style={{
          boxShadow: open ? "var(--shadow-drawer, var(--shadow-pop))" : "none",
        }}
      >
        <span
          aria-hidden
          className="md:hidden block w-10 h-1 rounded-full bg-rule-strong mt-2.5 mb-1 mx-auto shrink-0"
        />
        {detail ? <Inner detail={detail} onClose={onClose} /> : <Skeleton onClose={onClose} />}
      </aside>
    </>
  );
}

function Inner({ detail, onClose }: { detail: AdminUserDetail; onClose: () => void }) {
  return (
    <>
      <header className="shrink-0 flex items-center justify-between gap-3 px-5 md:px-6 py-4 md:py-[18px] border-b border-rule bg-paper">
        <div className="inline-flex items-center gap-3">
          <span className="font-mono text-[12.5px] text-ink-muted tracking-[-0.01em] font-medium">
            {detail.id}
          </span>
          <StatusPill status={detail.status} />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors"
        >
          <IconClose className="w-[18px] h-[18px]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* User hero */}
        <section className="p-6">
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-tint text-sage font-serif font-medium text-[22px] mb-3"
          >
            {detail.initials}
          </span>
          <h2 className="font-serif italic font-medium text-[28px] text-ink m-0 tracking-[-0.02em] leading-[1.1]">
            {detail.fullName}
          </h2>
          <p className="text-[13px] text-ink-muted m-0 mt-1 mb-3">
            {ROLE_LABEL[detail.role]} · {detail.country}
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <Pair label="Email" value={detail.email} />
            <Pair label="Teléfono">
              <span className="oldstyle">{detail.phone}</span>
            </Pair>
            <Pair label="ID de cuenta">
              <span className="font-mono text-[12.5px] tracking-[-0.01em]">{detail.id}</span>
            </Pair>
            <Pair label="Cuenta creada">
              <span className="oldstyle">{detail.createdAtLabel}</span>
            </Pair>
            <Pair label="Última conexión">
              <span className="oldstyle">{detail.lastLoginLabel} · IP {detail.lastIp}</span>
            </Pair>
          </div>
        </section>

        {/* Properties */}
        <section className="p-6 border-t border-rule">
          <Overline>Propiedades</Overline>
          {detail.properties.length === 0 ? (
            <p className="text-sm text-ink-muted m-0">— Sin propiedades asociadas —</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {detail.properties.map((p) => (
                <a
                  key={p.id}
                  className="flex items-center gap-2.5 bg-linen rounded-xl px-3.5 py-2.5 hover:bg-[rgba(229,237,229,0.5)] transition-colors cursor-pointer"
                >
                  <span
                    aria-hidden
                    className="w-8 h-8 rounded-lg bg-cover bg-center border border-rule shrink-0"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1545158535-c3f7168c28b6?auto=format&fit=crop&w=160&q=80')",
                    }}
                  />
                  <span className="flex-1 min-w-0">
                    <p className="font-serif italic font-medium text-[15px] text-ink m-0 tracking-[-0.01em]">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-ink-muted m-0">{p.sub}</p>
                  </span>
                  <RolePill role={p.role} />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Login history */}
        <section className="p-6 border-t border-rule">
          <Overline>Histórico de logins</Overline>
          <div className="relative pl-[22px]">
            <span aria-hidden className="absolute left-[5px] top-2 bottom-2 w-px bg-rule" />
            {detail.logins.map((l, i) => (
              <div key={i} className="relative pb-[14px] last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[22px] top-1 w-[9px] h-[9px] rounded-full bg-sage border-2 border-paper"
                  style={{ boxShadow: "0 0 0 1px var(--color-rule)" }}
                />
                <p className="text-[13px] font-medium text-ink m-0">
                  {l.device} · {l.location}
                </p>
                <p
                  className="text-[11px] text-ink-muted m-0 mt-0.5"
                  style={{ fontVariantNumeric: "oldstyle-nums", fontFeatureSettings: '"onum"' }}
                >
                  {l.at} · {l.ip}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="shrink-0 flex gap-2 px-5 md:px-6 py-4 border-t border-rule bg-paper">
        <button
          type="button"
          className="flex-1 h-10 px-4 rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          Suspender
        </button>
        <button
          type="button"
          className="flex-1 h-10 px-4 rounded-xl bg-cream text-ink-soft border border-rule text-sm font-medium hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors"
        >
          Cambiar rol
        </button>
        <button
          type="button"
          className="flex-1 h-10 px-4 rounded-xl bg-transparent text-danger border border-[rgba(168,72,60,0.25)] text-sm font-medium hover:bg-[rgba(168,72,60,0.08)] transition-colors"
        >
          Audit logs
        </button>
      </footer>
    </>
  );
}

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
      {children}
    </span>
  );
}

function Pair({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
        {label}
      </span>
      <span className="text-sm text-ink">{children ?? value}</span>
    </div>
  );
}

function Skeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <header className="shrink-0 flex items-center justify-between gap-3 px-6 py-[18px] border-b border-rule bg-paper">
        <span className="h-3 w-32 rounded bg-linen" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen inline-flex items-center justify-center"
        >
          <IconClose className="w-[18px] h-[18px]" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {[64, 24, 16, 14, 14, 14].map((h, i) => (
          <span
            key={i}
            className="block rounded bg-linen"
            style={{ height: h, width: `${100 - i * 8}%` }}
            aria-hidden
          />
        ))}
      </div>
    </>
  );
}
