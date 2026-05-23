"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Drawer base reusable. Mismo pattern visual que BookingDetailDrawer:
 * - Mobile: bottom sheet (rounded-top)
 * - Desktop: right slide 480px
 * - Backdrop button para cerrar
 * - Esc + body scroll lock cuando open
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
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
        aria-label="Cerrar"
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
        aria-label={title}
        className={[
          "fixed z-[90] bg-paper flex flex-col ease-organic transition-transform duration-[320ms]",
          "left-0 right-0 bottom-0 max-h-[92vh] rounded-t-[28px]",
          "md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[480px] md:max-h-none md:rounded-none md:border-l md:border-rule",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        ].join(" ")}
        style={{ boxShadow: open ? "var(--shadow-drawer, var(--shadow-pop))" : "none" }}
      >
        <span
          aria-hidden
          className="md:hidden block w-10 h-1 rounded-full bg-rule-strong mt-2.5 mb-1 mx-auto shrink-0"
        />

        <header className="shrink-0 flex items-start justify-between gap-3 px-5 md:px-6 py-4 md:py-[18px] border-b border-rule bg-paper">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif italic font-medium text-[20px] text-ink m-0 tracking-[-0.01em] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12.5px] text-ink-muted m-0 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-ink-soft hover:bg-linen transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-rule bg-paper px-5 md:px-6 py-3.5">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}
