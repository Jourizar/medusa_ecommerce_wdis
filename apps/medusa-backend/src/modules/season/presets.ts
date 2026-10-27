/**
 * The holiday themes the storefront knows how to draw. The admin Seasons page
 * creates a row for each on first load; the storefront owns the visuals.
 */
export const SEASON_THEMES = [
  "christmas",
  "halloween",
  "valentines",
  "new_year",
  "easter",
  "independence_day",
] as const;

export type SeasonTheme = (typeof SEASON_THEMES)[number];

export const SEASON_PAGES = ["all", "home", "shop", "product", "art", "checkout"] as const;

export const SEASON_INTENSITIES = ["light", "medium", "heavy"] as const;
