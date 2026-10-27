import type { SeasonTheme } from "@/lib/medusa/season";

export type ParticleKind = "snow" | "leaf" | "heart" | "confetti" | "petal";

export type ThemeVisuals = {
  particle: ParticleKind;
  colors: string[];
  /** Garland style hanging under the navbar */
  garland: {
    string: string;
    ornament: "bauble" | "pennant" | "heart" | "star" | "egg";
    colors: string[];
  };
};

export const SEASON_THEMES: Record<SeasonTheme, ThemeVisuals> = {
  christmas: {
    particle: "snow",
    colors: ["#ffffff"],
    garland: { string: "#1f5c2e", ornament: "bauble", colors: ["#d7263d", "#f2c14e", "#51D6FF", "#EC69D4"] },
  },
  halloween: {
    particle: "leaf",
    colors: ["#e8751a", "#c4471b", "#a0522d", "#f2a541"],
    garland: { string: "#1a1a1a", ornament: "pennant", colors: ["#f07a1a", "#111111", "#8a3cc7"] },
  },
  valentines: {
    particle: "heart",
    colors: ["#EC69D4", "#ff3b6b", "#ff8fab", "#d7263d"],
    garland: { string: "#b3125a", ornament: "heart", colors: ["#ff3b6b", "#EC69D4", "#ffffff"] },
  },
  new_year: {
    particle: "confetti",
    colors: ["#f2c14e", "#d9d9d9", "#EC69D4", "#51D6FF", "#77269A"],
    garland: { string: "#2b2b2b", ornament: "star", colors: ["#f2c14e", "#d9d9d9"] },
  },
  easter: {
    particle: "petal",
    colors: ["#ffd6e8", "#c8f2d9", "#fff1a8", "#d8c9ff", "#bfe9ff"],
    garland: { string: "#8fbf8f", ornament: "egg", colors: ["#ffb3d1", "#a8e6c1", "#fff08a", "#c9b6ff", "#9fdcff"] },
  },
  independence_day: {
    particle: "confetti",
    colors: ["#d7263d", "#ffffff", "#1d4ed8"],
    garland: { string: "#1a1a1a", ornament: "pennant", colors: ["#d7263d", "#ffffff", "#1d4ed8"] },
  },
};

export const isSeasonTheme = (v: string | null | undefined): v is SeasonTheme =>
  !!v && v in SEASON_THEMES;
