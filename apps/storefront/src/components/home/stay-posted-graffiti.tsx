import { useId } from "react";

/**
 * Graffiti tag shown when the calendar has no events: "STAY POSTED FOR NEW
 * DROPS" in drippy 3D spray lettering with a winking smiley. Inline SVG so
 * it inherits the site font and stays crisp at any size. `textLength` pins
 * each line's width so the composition holds regardless of font metrics.
 */
export function StayPostedGraffiti({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const rough = `rough-${id}`;
  const haze = `haze-${id}`;

  const font = {
    fontFamily: "var(--font-display), var(--font-sans), sans-serif",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  } as const;

  // Each line is drawn three times: offset black block (3D), thick black
  // outline, then the color fill — classic piece layering.
  const line = (
    text: string,
    x: number,
    y: number,
    size: number,
    length: number,
    fill: string
  ) => (
    <g key={text} style={font} fontSize={size}>
      <text x={x + 7} y={y + 7} textLength={length} lengthAdjust="spacingAndGlyphs" fill="#000">
        {text}
      </text>
      <text
        x={x}
        y={y}
        textLength={length}
        lengthAdjust="spacingAndGlyphs"
        fill={fill}
        stroke="#000"
        strokeWidth={9}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {text}
      </text>
      <text
        x={x}
        y={y}
        textLength={length}
        lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="#fff"
        strokeWidth={1.5}
        strokeOpacity={0.7}
        strokeDasharray="6 10"
      >
        {text}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="Stay posted for new drops ;)"
      className={className}
    >
      <defs>
        {/* Wobbles edges so it reads as sprayed, not typeset */}
        <filter id={rough} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>
        <filter id={haze} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* Overspray clouds behind the piece */}
      <g filter={`url(#${haze})`} opacity="0.45">
        <ellipse cx="150" cy="120" rx="140" ry="70" fill="#EC69D4" />
        <ellipse cx="330" cy="180" rx="70" ry="60" fill="#51D6FF" />
      </g>

      <g filter={`url(#${rough})`} transform="rotate(-5 210 150) skewX(-6)">
        {line("STAY POSTED", 34, 78, 50, 286, "#51D6FF")}
        {line("FOR NEW", 58, 132, 44, 182, "#fff1e8")}

        {/* Drips under DROPS, drawn before so the letters sit on top */}
        <g fill="#EC69D4" stroke="#000" strokeWidth="3">
          <path d="M72 218 v26 a6 6 0 0 0 12 0 v-26 z" />
          <path d="M150 218 v42 a6 6 0 0 0 12 0 v-42 z" />
          <path d="M236 218 v18 a5 5 0 0 0 10 0 v-18 z" />
        </g>
        {line("DROPS", 30, 222, 96, 262, "#EC69D4")}
      </g>

      {/* Winking smiley */}
      <g filter={`url(#${rough})`} transform="rotate(12 352 188)">
        <path d="M344 228 v22 a6 6 0 0 0 12 0 v-20 z" fill="#51D6FF" stroke="#000" strokeWidth="3" />
        <circle cx="357" cy="193" r="46" fill="#000" />
        <circle cx="352" cy="188" r="44" fill="#51D6FF" stroke="#000" strokeWidth="6" />
        {/* open eye */}
        <ellipse cx="336" cy="174" rx="6" ry="10" fill="#000" />
        {/* wink */}
        <path d="M358 176 q11 -12 22 0" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
        {/* grin + tongue */}
        <path d="M326 196 q26 30 54 0" fill="#000" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        <path d="M352 210 q10 14 18 -4" fill="#EC69D4" stroke="#000" strokeWidth="3" />
      </g>

      {/* Spray sparkles + specks */}
      <g fill="#fff1e8" stroke="#000" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M392 52 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5 z" />
        <path d="M18 250 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" />
      </g>
      <g fill="#000">
        <circle cx="300" cy="40" r="2.5" />
        <circle cx="312" cy="30" r="1.5" />
        <circle cx="290" cy="270" r="2" />
        <circle cx="40" cy="30" r="1.8" />
        <circle cx="404" cy="250" r="2.2" />
      </g>
    </svg>
  );
}
