export function Legend() {
  return (
    <footer
      className="hidden md:flex gap-6 flex-wrap mt-5 pt-4 px-1 text-xs text-ink-soft"
      aria-label="Leyenda"
    >
      <Item label="Confirmada">
        <span className="block w-[22px] h-3.5 rounded bg-sage" />
      </Item>
      <Item label="Pago pendiente">
        <span className="block w-[22px] h-3.5 rounded bg-paper border-[1.5px] border-sage" />
      </Item>
      <Item label="Booking.com / Airbnb">
        <span
          className="block w-[22px] h-3.5 rounded border border-[rgba(199,111,76,0.3)]"
          style={{
            background:
              "repeating-linear-gradient(45deg, var(--color-paper), var(--color-paper) 3px, rgba(199,111,76,0.4) 3px, rgba(199,111,76,0.4) 5px)",
          }}
        />
      </Item>
      <Item label="Hold">
        <span className="block w-[22px] h-3.5 rounded bg-linen border-[1.5px] border-dashed border-ink-muted" />
      </Item>
      <Item label="Bloqueada">
        <span className="block w-[22px] h-3.5 rounded bg-[rgba(139,130,117,0.2)] border border-[rgba(139,130,117,0.3)]" />
      </Item>
    </footer>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      {label}
    </span>
  );
}
