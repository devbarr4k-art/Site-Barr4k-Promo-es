// Símbolo do canvas de marca: check que vira seta ("achou!"), sobre lima.
type MarkProps = { size?: number; round?: boolean; className?: string };

export function Bolt({ size = 28, round = false, className = "" }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      {round ? (
        <circle cx="32" cy="32" r="32" fill="#C6FF00" />
      ) : (
        <rect width="64" height="64" rx="18" fill="#C6FF00" />
      )}
      <path d="M14 34 L26 46 L48 21" fill="none" stroke="#0A0A0A" strokeWidth="7" strokeLinecap="square" />
      <path d="M35 19.5 H50 V34.5" fill="none" stroke="#0A0A0A" strokeWidth="7" strokeLinecap="square" />
    </svg>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <Bolt size={size * 1.2} className="logo__mark" />
      <span className="logo__word">ACHOU</span>
    </span>
  );
}
