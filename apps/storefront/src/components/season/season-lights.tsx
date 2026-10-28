"use client";

// One bulb per 52px (12px bulb + 2×20px margin); enough for a 2600px-wide screen.
const BULBS = 50;

/** String of twinkling Christmas lights hanging under the navbar (styles in globals.css). */
export function SeasonLights() {
  return (
    <ul aria-hidden className="lightrope">
      {Array.from({ length: BULBS }, (_, i) => (
        <li key={i} />
      ))}
    </ul>
  );
}
