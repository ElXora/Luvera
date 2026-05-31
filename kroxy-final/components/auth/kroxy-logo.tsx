export function KroxyLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = Math.random().toString(36).slice(2, 7);
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill={`url(#kg${id})`} />
        <path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="24" r="4" fill="white"/>
        <path d="M24 30L20 37M24 30L28 37" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <defs>
          <linearGradient id={`kg${id}`} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#5B21B6"/>
          </linearGradient>
        </defs>
      </svg>
      <span style={{ fontSize: size * 0.55, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>Kroxy</span>
    </div>
  );
}
