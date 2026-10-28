"use client";

import { useState } from "react";

const COUNT = { light: 12, medium: 24, heavy: 40 } as const;
const GLYPHS = ["❅", "❆", "❄"];

/**
 * Unicode snowflakes that fall and sway (styles in globals.css). Each flake
 * gets its own column, size, speed and start offset; negative delays mean the
 * screen is already snowing on load instead of filling from the top.
 */
export function SeasonSnowflakes({ intensity }: { intensity: keyof typeof COUNT }) {
  const [flakes] = useState(() =>
    Array.from({ length: COUNT[intensity] }, (_, i) => {
      const fall = 8 + Math.random() * 7;
      return {
        glyph: GLYPHS[i % GLYPHS.length],
        left: ((i + Math.random()) / COUNT[intensity]) * 100,
        size: 0.9 + Math.random() * 0.9,
        fall,
        shake: 2.5 + Math.random() * 1.5,
        delay: -Math.random() * fall,
      };
    })
  );

  return (
    <div aria-hidden>
      {flakes.map((f, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}em`,
            animationDuration: `${f.fall}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <span style={{ animationDuration: `${f.shake}s`, animationDelay: `${f.delay}s` }}>{f.glyph}</span>
        </div>
      ))}
    </div>
  );
}
