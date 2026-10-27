import { model } from "@medusajs/framework/utils";

/**
 * One row per holiday theme (see ../presets.ts). A theme shows on the
 * storefront while enabled and, if dates are set, only inside its window.
 */
export const Season = model.define("season", {
  id: model.id().primaryKey(),
  theme: model.text().unique(),
  is_enabled: model.boolean().default(false),
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
  // Falling/floating particles (snow, leaves, hearts, confetti…)
  particles: model.boolean().default(true),
  // Garland/bunting hanging under the navbar
  decorations: model.boolean().default(true),
  // Page keys that get particles: all | home | shop | product | art | checkout
  pages: model.array().nullable(),
  intensity: model.enum(["light", "medium", "heavy"]).default("medium"),
});
