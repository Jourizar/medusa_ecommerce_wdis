import { medusaFetch } from "./client";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  type: "drop" | "sale" | "event";
  starts_at: string;
  ends_at: string | null;
  product_handle: string | null;
  image_url: string | null;
  accent_color: "cyan" | "pink" | "purple" | "accent";
  is_published: boolean;
};

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const data = await medusaFetch<{ calendar_events: CalendarEvent[] }>(
    `/calendar-events`
  );
  return data.calendar_events;
}
