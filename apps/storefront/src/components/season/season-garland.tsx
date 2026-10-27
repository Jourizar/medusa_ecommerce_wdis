"use client";

import { useEffect, useState } from "react";
import type { ThemeVisuals } from "./themes";

const SPAN = 64; // px between ornaments (one sag of the string)
const SAG_Y = 10; // lowest point of each sag, where ornaments hang

/**
 * Garland hanging from the bottom edge of the sticky navbar (92px tall):
 * a sagging string with an ornament at each low point, gently swaying.
 */
export function SeasonGarland({ garland }: { garland: ThemeVisuals["garland"] }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!width) return null;

  const count = Math.ceil(width / SPAN);
  let string = "M0 3";
  for (let i = 0; i < count; i++) string += ` Q${i * SPAN + SPAN / 2} ${SAG_Y * 2 - 3} ${(i + 1) * SPAN} 3`;

  return (
    <svg
      aria-hidden
      className="season-garland fixed left-0 top-[89px] z-[41] pointer-events-none"
      width={width}
      height={48}
      viewBox={`0 0 ${width} 48`}
    >
      <path d={string} fill="none" stroke={garland.string} strokeWidth={3} strokeLinecap="round" />
      {Array.from({ length: count }, (_, i) => {
        const x = i * SPAN + SPAN / 2;
        const color = garland.colors[i % garland.colors.length];
        return (
          <g
            key={i}
            className="season-sway"
            style={{
              transformOrigin: `${x}px ${SAG_Y}px`,
              animationDelay: `${(i % 5) * -0.7}s`,
              animationDuration: `${3 + (i % 3) * 0.6}s`,
            }}
          >
            <Ornament kind={garland.ornament} x={x} color={color} />
          </g>
        );
      })}
    </svg>
  );
}

function Ornament({ kind, x, color }: { kind: ThemeVisuals["garland"]["ornament"]; x: number; color: string }) {
  const stroke = { stroke: "#000", strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (kind) {
    case "bauble":
      return (
        <>
          <line x1={x} y1={SAG_Y} x2={x} y2={SAG_Y + 6} stroke="#000" strokeWidth={1.5} />
          <rect x={x - 3.5} y={SAG_Y + 5} width={7} height={5} fill="#f2c14e" {...stroke} strokeWidth={1.5} />
          <circle cx={x} cy={SAG_Y + 19} r={9} fill={color} {...stroke} />
          <ellipse cx={x - 3} cy={SAG_Y + 15.5} rx={2.5} ry={1.6} fill="#fff" opacity={0.75} />
        </>
      );
    case "pennant":
      return <path d={`M${x - 13} ${SAG_Y - 1} L${x + 13} ${SAG_Y - 1} L${x} ${SAG_Y + 22} Z`} fill={color} {...stroke} />;
    case "heart":
      return (
        <>
          <line x1={x} y1={SAG_Y} x2={x} y2={SAG_Y + 6} stroke="#000" strokeWidth={1.5} />
          <path
            d={`M${x} ${SAG_Y + 26} C${x - 14} ${SAG_Y + 16} ${x - 9} ${SAG_Y + 4} ${x} ${SAG_Y + 11} C${x + 9} ${SAG_Y + 4} ${x + 14} ${SAG_Y + 16} ${x} ${SAG_Y + 26} Z`}
            fill={color}
            {...stroke}
          />
        </>
      );
    case "star": {
      const cy = SAG_Y + 17;
      const pts = Array.from({ length: 10 }, (_, k) => {
        const r = k % 2 ? 4.5 : 10;
        const a = (Math.PI / 5) * k - Math.PI / 2;
        return `${x + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ");
      return (
        <>
          <line x1={x} y1={SAG_Y} x2={x} y2={SAG_Y + 7} stroke="#000" strokeWidth={1.5} />
          <polygon points={pts} fill={color} {...stroke} />
        </>
      );
    }
    case "egg":
      return (
        <>
          <line x1={x} y1={SAG_Y} x2={x} y2={SAG_Y + 6} stroke="#000" strokeWidth={1.5} />
          <ellipse cx={x} cy={SAG_Y + 17} rx={7.5} ry={10} fill={color} {...stroke} />
          <path
            d={`M${x - 7} ${SAG_Y + 17} l3.5 -3 l3.5 3 l3.5 -3 l3.5 3`}
            fill="none"
            stroke="#fff"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </>
      );
  }
}
