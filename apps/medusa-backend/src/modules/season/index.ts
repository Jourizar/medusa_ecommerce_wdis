import { Module } from "@medusajs/framework/utils";
import SeasonModuleService from "./service";

export const SEASON_MODULE = "season";

export default Module(SEASON_MODULE, {
  service: SeasonModuleService,
});
