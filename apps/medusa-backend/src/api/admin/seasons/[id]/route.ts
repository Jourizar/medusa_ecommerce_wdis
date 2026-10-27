import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { SEASON_MODULE } from "../../../../modules/season";
import SeasonModuleService from "../../../../modules/season/service";
import { SEASON_INTENSITIES, SEASON_PAGES } from "../../../../modules/season/presets";

type SeasonUpdate = {
  is_enabled?: boolean;
  starts_at?: Date | null;
  ends_at?: Date | null;
  particles?: boolean;
  decorations?: boolean;
  pages?: string[];
  intensity?: (typeof SEASON_INTENSITIES)[number];
};

/** Accepts only known fields with valid values. */
function parseUpdate(body: Record<string, unknown>): SeasonUpdate {
  const update: SeasonUpdate = {};
  const invalid = (msg: string) => new MedusaError(MedusaError.Types.INVALID_DATA, msg);

  for (const key of ["is_enabled", "particles", "decorations"] as const) {
    if (key in body) {
      if (typeof body[key] !== "boolean") throw invalid(`${key} must be a boolean`);
      update[key] = body[key] as boolean;
    }
  }
  for (const key of ["starts_at", "ends_at"] as const) {
    if (key in body) {
      const v = body[key];
      if (v === null || v === "") update[key] = null;
      else if (typeof v === "string" && !Number.isNaN(Date.parse(v))) update[key] = new Date(v);
      else throw invalid(`${key} must be a date or null`);
    }
  }
  if ("pages" in body) {
    const pages = body.pages;
    if (!Array.isArray(pages) || !pages.length || pages.some((p) => !SEASON_PAGES.includes(p))) {
      throw invalid(`pages must be a non-empty list of: ${SEASON_PAGES.join(", ")}`);
    }
    update.pages = pages as string[];
  }
  if ("intensity" in body) {
    if (!SEASON_INTENSITIES.includes(body.intensity as any)) {
      throw invalid(`intensity must be one of: ${SEASON_INTENSITIES.join(", ")}`);
    }
    update.intensity = body.intensity as SeasonUpdate["intensity"];
  }
  return update;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc: SeasonModuleService = req.scope.resolve(SEASON_MODULE);
  const update = parseUpdate((req.body ?? {}) as Record<string, unknown>);

  const current = await svc.retrieveSeason(req.params.id);
  const starts = "starts_at" in update ? update.starts_at : current.starts_at;
  const ends = "ends_at" in update ? update.ends_at : current.ends_at;
  if (starts && ends && new Date(starts) > new Date(ends)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "End date must be after the start date");
  }

  const season = await svc.updateSeasons({ id: req.params.id, ...update });
  const active = await svc.getActiveSeason();
  res.json({ season, active_id: active?.id ?? null });
}
