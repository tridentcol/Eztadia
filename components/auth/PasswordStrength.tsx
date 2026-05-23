export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export function computeStrength(pw: string): StrengthLevel {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s) as StrengthLevel;
}

const LABELS: Record<StrengthLevel, string> = {
  0: "Mínimo 8 caracteres · Mezcla letras y números",
  1: "Algo más, por favor.",
  2: "Vamos por buen camino.",
  3: "Casi.",
  4: "Contraseña sólida.",
};

export function PasswordStrength({ password }: { password: string }) {
  const level = computeStrength(password);
  return (
    <div>
      <div className="grid grid-cols-4 gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={[
              "h-[3px] rounded-full",
              i < level ? toneFor(level, i) : "bg-rule",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="text-[11px] text-ink-muted m-0">{LABELS[level]}</p>
    </div>
  );
}

function toneFor(level: StrengthLevel, _i: number): string {
  if (level <= 2) return "bg-warning";
  if (level === 3) return "bg-gold";
  return "bg-sage";
}
