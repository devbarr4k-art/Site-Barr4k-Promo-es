// Provisório: redesenhado a partir da prancheta. Trocar pelo SVG final da identidade.
export function Bolt({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M19.6 1.5 6.2 17.8c-.5.6 0 1.4.7 1.4h6.4l-4.6 9.9c-.4.9.7 1.7 1.4 1L25.6 13c.6-.6.1-1.5-.7-1.5h-6.1l2.9-9.1c.3-.9-.8-1.6-1.4-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <Bolt size={size * 1.15} className="logo__bolt" />
      <span className="logo__word">ACHOU</span>
    </span>
  );
}
