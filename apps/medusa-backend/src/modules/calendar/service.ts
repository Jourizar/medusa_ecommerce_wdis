import { MedusaService } from "@medusajs/framework/utils";
import { CalendarEvent } from "./models/calendar-event";

class CalendarModuleService extends MedusaService({
  CalendarEvent,
}) {}

export default CalendarModuleService;
