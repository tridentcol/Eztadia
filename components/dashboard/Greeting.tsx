import { greetingFor, subtitleFor, type OwnerSnapshot } from "@/lib/dashboard";

export function Greeting({ snapshot, now }: { snapshot: OwnerSnapshot; now: Date }) {
  const { phrase, longDate } = greetingFor(now);
  const subtitle = subtitleFor(snapshot);

  return (
    <section aria-labelledby="greet-title" className="mb-14">
      <h1
        id="greet-title"
        className="font-serif font-medium text-ink m-0 mb-2.5 tracking-[-0.02em]"
        style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1 }}
      >
        {phrase}, <em className="italic">{snapshot.owner.firstName}</em>.
      </h1>
      <p className="text-base text-ink-muted m-0 max-w-[70ch]">
        Hoy es <span className="text-ink-soft font-medium">{longDate}</span>. {subtitle.split(/(\d+\s+(?:cosas?|cosa)\s+pendientes?|un check-in en \d+\s+(?:horas?|hora))/).map((seg, i) => {
          if (i % 2 === 1) return <strong key={i} className="text-ink-soft font-medium">{seg}</strong>;
          return <span key={i}>{seg}</span>;
        })}
      </p>
    </section>
  );
}
