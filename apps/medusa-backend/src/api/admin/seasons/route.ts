import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { SEASON_MODULE } from "../../../modules/season";
import SeasonModuleService from "../../../modules/season/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: SeasonModuleService = req.scope.resolve(SEASON_MODULE);
  await svc.ensurePresets();
  const [seasons, active] = await Promise.all([
    svc.listSeasons({}, { order: { created_at: "ASC" } }),
    svc.getActiveSeason(),
  ]);
  res.json({ seasons, active_id: active?.id ?? null });
}
