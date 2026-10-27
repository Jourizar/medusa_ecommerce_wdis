import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { SEASON_MODULE } from "../../../modules/season";
import SeasonModuleService from "../../../modules/season/service";

/** The season currently live on the storefront, or null. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: SeasonModuleService = req.scope.resolve(SEASON_MODULE);
  const season = await svc.getActiveSeason();
  res.json({
    season: season && {
      theme: season.theme,
      particles: season.particles,
      decorations: season.decorations,
      pages: season.pages ?? ["all"],
      intensity: season.intensity,
    },
  });
}
