import { model } from "@medusajs/framework/utils";

export const CalendarEvent = model.define("calendar_event", {
  id: model.id().primaryKey(),
  title: model.text().searchable(),
  description: model.text().nullable(),
  type: model.enum(["drop", "sale", "event"]).default("drop"),
  starts_at: model.dateTime(),
  ends_at: model.dateTime().nullable(),
  product_handle: model.text().nullable(),
  image_url: model.text().nullable(),
  accent_color: model.enum(["cyan", "pink", "purple", "accent"]).default("cyan"),
  is_published: model.boolean().default(true),
});
