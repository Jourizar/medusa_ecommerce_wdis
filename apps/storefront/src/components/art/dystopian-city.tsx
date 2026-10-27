/**
 * Layered dystopian city skyline rendered inline.
 * Two parallax layers + glowing windows + a cyan haze.
 */
export function DystopianCity() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 380"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 w-full h-[60%] md:h-[70%] pointer-events-none"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="50%" stopColor="#77269A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EC69D4" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="haze" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#51D6FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#51D6FF" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Sky gradient */}
      <rect width="1440" height="380" fill="url(#sky)" />

      {/* Sun / moon */}
      <circle cx="1080" cy="90" r="50" fill="#EC69D4" opacity="0.9" />
      <circle cx="1080" cy="90" r="80" fill="#EC69D4" opacity="0.18" />

      {/* Cyan haze near horizon */}
      <rect x="0" y="220" width="1440" height="160" fill="url(#haze)" />

      {/* BACK LAYER — distant towers */}
      <g fill="#1a0d24" opacity="0.95">
        <rect x="0" y="200" width="80" height="180" />
        <rect x="60" y="180" width="60" height="200" />
        <rect x="120" y="220" width="80" height="160" />
        <rect x="180" y="160" width="50" height="220" />
        <rect x="230" y="200" width="70" height="180" />
        <rect x="300" y="170" width="90" height="210" />
        <rect x="380" y="210" width="60" height="170" />
        <rect x="440" y="150" width="70" height="230" />
        <rect x="500" y="190" width="80" height="190" />
        <rect x="570" y="170" width="50" height="210" />
        <rect x="620" y="200" width="100" height="180" />
        <rect x="720" y="160" width="70" height="220" />
        <rect x="790" y="195" width="60" height="185" />
        <rect x="850" y="180" width="90" height="200" />
        <rect x="940" y="210" width="60" height="170" />
        <rect x="1000" y="170" width="80" height="210" />
        <rect x="1130" y="180" width="100" height="200" />
        <rect x="1230" y="200" width="60" height="180" />
        <rect x="1290" y="170" width="70" height="210" />
        <rect x="1360" y="200" width="80" height="180" />
      </g>

      {/* Tiny windows on back layer */}
      <g fill="#51D6FF" opacity="0.65">
        {Array.from({ length: 70 }).map((_, i) => {
          const x = (i * 23) % 1440;
          const y = 200 + ((i * 17) % 130);
          return <rect key={`bw${i}`} x={x} y={y} width="2" height="2" />;
        })}
      </g>

      {/* FRONT LAYER — closer, taller buildings */}
      <g fill="#000">
        <rect x="-10" y="240" width="120" height="140" />
        <rect x="100" y="200" width="90" height="180" />
        {/* spire */}
        <rect x="135" y="160" width="6" height="40" />
        <rect x="190" y="220" width="110" height="160" />
        <rect x="300" y="180" width="80" height="200" />
        {/* antenna */}
        <rect x="335" y="120" width="3" height="60" />
        <rect x="380" y="240" width="120" height="140" />
        <rect x="500" y="200" width="100" height="180" />
        {/* water tower */}
        <circle cx="540" cy="180" r="14" />
        <rect x="537" y="180" width="6" height="20" />
        <rect x="600" y="220" width="140" height="160" />
        <rect x="740" y="180" width="90" height="200" />
        <rect x="775" y="150" width="4" height="30" />
        <rect x="830" y="230" width="120" height="150" />
        <rect x="950" y="200" width="80" height="180" />
        <rect x="985" y="160" width="5" height="40" />
        <rect x="1030" y="240" width="130" height="140" />
        <rect x="1160" y="200" width="100" height="180" />
        <rect x="1260" y="220" width="120" height="160" />
        <rect x="1380" y="200" width="100" height="180" />
      </g>

      {/* Bright windows on front layer (cyan + pink mix) */}
      <g>
        {Array.from({ length: 90 }).map((_, i) => {
          const x = ((i * 31) % 1440);
          const y = 240 + ((i * 11) % 120);
          const isPink = i % 5 === 0;
          return (
            <rect
              key={`fw${i}`}
              x={x}
              y={y}
              width="3"
              height="4"
              fill={isPink ? "#EC69D4" : "#51D6FF"}
              opacity={isPink ? 0.95 : 0.85}
            />
          );
        })}
      </g>

      {/* Bottom black bedrock */}
      <rect x="0" y="370" width="1440" height="10" fill="#000" />
    </svg>
  );
}
