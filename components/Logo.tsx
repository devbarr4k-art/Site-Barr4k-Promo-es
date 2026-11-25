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
      <path d="M15 33.5 L26.5 45 L47.5 21.5" fill="none" stroke="#0A0A0A" strokeWidth="6.5" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M35.5 20 H48.5 V33" fill="none" stroke="#0A0A0A" strokeWidth="6.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <Bolt size={Math.round(size * 1.1)} className="logo__mark" />
      <span className="logo__word">ACHOU</span>
    </span>
  );
}
