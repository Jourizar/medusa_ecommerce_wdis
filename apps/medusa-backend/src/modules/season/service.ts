import { MedusaService } from "@medusajs/framework/utils";
import { Season } from "./models/season";
import { SEASON_THEMES } from "./presets";

class SeasonModuleService extends MedusaService({
  Season,
}) {
  /** Creates a row for any theme that doesn't have one yet. */
  async ensurePresets() {
    const existing = await this.listSeasons({}, { select: ["theme"] });
    const have = new Set(existing.map((s) => s.theme));
    const missing = SEASON_THEMES.filter((t) => !have.has(t));
    if (missing.length) {
      await this.createSeasons(missing.map((theme) => ({ theme, pages: ["all"] })));
    }
  }

  /**
   * The season to show right now: enabled and inside its date window.
   * If several match, the one with the latest start date wins, so a dated
   * theme (e.g. New Year, Dec 31–Jan 1) overrides an open-ended one.
   */
  async getActiveSeason(now = new Date()) {
    const enabled = await this.listSeasons({ is_enabled: true });
    const live = enabled.filter(
      (s) =>
        (!s.starts_at || new Date(s.starts_at) <= now) &&
        (!s.ends_at || new Date(s.ends_at) >= now)
    );
    live.sort(
      (a, b) =>
        (b.starts_at ? new Date(b.starts_at).getTime() : 0) -
        (a.starts_at ? new Date(a.starts_at).getTime() : 0)
    );
    return live[0] ?? null;
  }
}

export default SeasonModuleService;
