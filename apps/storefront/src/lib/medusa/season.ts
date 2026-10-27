import { medusaFetch } from "./client";

export type SeasonTheme =
  | "christmas"
  | "halloween"
  | "valentines"
  | "new_year"
  | "easter"
  | "independence_day";

export type SeasonPage = "all" | "home" | "shop" | "product" | "art" | "checkout";

export type ActiveSeason = {
  theme: SeasonTheme;
  particles: boolean;
  decorations: boolean;
  pages: SeasonPage[];
  intensity: "light" | "medium" | "heavy";
};

/** The season live right now (toggled in admin → Seasons), or null. */
export async function getActiveSeason(): Promise<ActiveSeason | null> {
  const data = await medusaFetch<{ season: ActiveSeason | null }>(`/season`, {
    revalidate: 30,
  });
  return data.season;
}
