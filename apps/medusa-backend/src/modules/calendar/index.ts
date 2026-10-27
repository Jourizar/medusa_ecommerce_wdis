import { Module } from "@medusajs/framework/utils";
import CalendarModuleService from "./service";

export const CALENDAR_MODULE = "calendar";

export default Module(CALENDAR_MODULE, {
  service: CalendarModuleService,
});
