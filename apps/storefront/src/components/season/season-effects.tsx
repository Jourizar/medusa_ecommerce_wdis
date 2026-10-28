"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import type { ActiveSeason, SeasonPage } from "@/lib/medusa/season";
import { SEASON_THEMES, isSeasonTheme } from "./themes";

// Only downloaded when a season is actually showing.
const SeasonParticles = dynamic(() => import("./season-particles").then((m) => m.SeasonParticles), { ssr: false });
const SeasonGarland = dynamic(() => import("./season-garland").then((m) => m.SeasonGarland), { ssr: false });
const SeasonLights = dynamic(() => import("./season-lights").then((m) => m.SeasonLights), { ssr: false });
const SeasonSnowflakes = dynamic(() => import("./season-snowflakes").then((m) => m.SeasonSnowflakes), { ssr: false });

const PREVIEW_KEY = "wdis-season-preview";

function pageKey(pathname: string): SeasonPage | null {
  if (pathname === "/") return "home";
  if (pathname === "/products") return "shop";
  if (pathname.startsWith("/products/")) return "product";
  if (pathname === "/art" || pathname.startsWith("/art/")) return "art";
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return "checkout";
  return null;
}

/**
 * Renders the active season's particles and garland. `?season=<theme>` previews
 * a theme on every page for this browser tab (persisted in sessionStorage so it
 * survives navigation); `?season=off` ends the preview.
 */
export function SeasonEffects({ season }: { season: ActiveSeason | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams.get("season");
    try {
      if (param === "off" || param === "none") sessionStorage.removeItem(PREVIEW_KEY);
      else if (isSeasonTheme(param)) sessionStorage.setItem(PREVIEW_KEY, param);
      setPreview(sessionStorage.getItem(PREVIEW_KEY));
    } catch {
      setPreview(isSeasonTheme(param) ? param : null);
    }
  }, [searchParams]);

  const active: ActiveSeason | null = isSeasonTheme(preview)
    ? { theme: preview, particles: true, decorations: true, pages: ["all"], intensity: "medium" }
    : season;
  if (!active || !isSeasonTheme(active.theme)) return null;

  const visuals = SEASON_THEMES[active.theme];
  const page = pageKey(pathname);
  const particlesHere =
    active.particles && !reduce && (active.pages.includes("all") || (page !== null && active.pages.includes(page)));

  return (
    <>
      {active.decorations &&
        (visuals.lights ? <SeasonLights /> : <SeasonGarland garland={visuals.garland} />)}
      {particlesHere &&
        (visuals.particle === "snowflake" ? (
          <SeasonSnowflakes intensity={active.intensity} />
        ) : (
          <SeasonParticles kind={visuals.particle} colors={visuals.colors} intensity={active.intensity} />
        ))}
    </>
  );
}
