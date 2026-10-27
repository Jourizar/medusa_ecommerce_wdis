import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CALENDAR_MODULE } from "../../../../modules/calendar";
import CalendarModuleService from "../../../../modules/calendar/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: CalendarModuleService = req.scope.resolve(CALENDAR_MODULE);
  const event = await svc.retrieveCalendarEvent(req.params.id);
  res.json({ calendar_event: event });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc: CalendarModuleService = req.scope.resolve(CALENDAR_MODULE);
  const body = req.body as Record<string, unknown>;
  const event = await svc.updateCalendarEvents({
    id: req.params.id,
    ...body,
  } as any);
  res.json({ calendar_event: event });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc: CalendarModuleService = req.scope.resolve(CALENDAR_MODULE);
  await svc.deleteCalendarEvents(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
