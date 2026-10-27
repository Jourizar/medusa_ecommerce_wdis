/**
 * Receding neon grid floor — Tron / synthwave style.
 * Renders cyan grid lines fading into a pink horizon.
 */
export function NeonFloor() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 600"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 w-full h-[55%] pointer-events-none"
    >
      <defs>
        <linearGradient id="floorFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="horizonGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#EC69D4" stopOpacity="0" />
          <stop offset="80%" stopColor="#EC69D4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#77269A" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Horizon glow */}
      <rect x="0" y="0" width="1440" height="200" fill="url(#horizonGlow)" />

      {/* Receding longitude lines (vanish toward center top) */}
      <g stroke="#51D6FF" strokeWidth="2" opacity="0.85">
        <line x1="720" y1="0" x2="-200" y2="600" />
        <line x1="720" y1="0" x2="100" y2="600" />
        <line x1="720" y1="0" x2="350" y2="600" />
        <line x1="720" y1="0" x2="560" y2="600" />
        <line x1="720" y1="0" x2="650" y2="600" />
        <line x1="720" y1="0" x2="720" y2="600" />
        <line x1="720" y1="0" x2="790" y2="600" />
        <line x1="720" y1="0" x2="880" y2="600" />
        <line x1="720" y1="0" x2="1090" y2="600" />
        <line x1="720" y1="0" x2="1340" y2="600" />
        <line x1="720" y1="0" x2="1640" y2="600" />
      </g>

      {/* Horizontal latitude lines (faded near top) */}
      <g stroke="#51D6FF" strokeWidth="1.5">
        <line x1="0" y1="180" x2="1440" y2="180" opacity="0.2" />
        <line x1="0" y1="230" x2="1440" y2="230" opacity="0.3" />
        <line x1="0" y1="290" x2="1440" y2="290" opacity="0.45" />
        <line x1="0" y1="360" x2="1440" y2="360" opacity="0.6" />
        <line x1="0" y1="440" x2="1440" y2="440" opacity="0.75" />
        <line x1="0" y1="540" x2="1440" y2="540" opacity="0.9" />
      </g>

      {/* Soft black fade over top so it doesn't compete with content */}
      <rect x="0" y="0" width="1440" height="600" fill="url(#floorFade)" />
    </svg>
  );
}
