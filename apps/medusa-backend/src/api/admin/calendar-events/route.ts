import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CALENDAR_MODULE } from "../../../modules/calendar";
import CalendarModuleService from "../../../modules/calendar/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: CalendarModuleService = req.scope.resolve(CALENDAR_MODULE);
  const events = await svc.listCalendarEvents({}, { order: { starts_at: "ASC" } });
  res.json({ calendar_events: events });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc: CalendarModuleService = req.scope.resolve(CALENDAR_MODULE);
  const body = req.body as Record<string, unknown>;
  const event = await svc.createCalendarEvents(body as any);
  res.json({ calendar_event: event });
}
