/** 3-dot pulsing loader. Inherits `currentColor`. */
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center gap-1 h-3.5 ${className}`}
    >
      {[0, 0.15, 0.3].map((delay, i) => (
        <span
          key={i}
          className="block w-[5px] h-[5px] rounded-full bg-current opacity-30"
          style={{
            animation: "dotpulse 1.2s ease-in-out infinite",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </span>
  );
}
