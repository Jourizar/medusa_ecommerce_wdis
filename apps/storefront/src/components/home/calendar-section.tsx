import Link from "next/link";
import type { CalendarEvent } from "@/lib/medusa/calendar";

interface Props {
  events: CalendarEvent[];
}

const colorBg: Record<CalendarEvent["accent_color"], string> = {
  cyan: "bg-accent",
  pink: "bg-hotpink",
  purple: "bg-primary text-white",
  accent: "bg-accent",
};

const typeLabel: Record<CalendarEvent["type"], string> = {
  drop: "★ DROP",
  sale: "% SALE",
  event: "● EVENT",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return { month, day: d.getDate(), time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
}

export function CalendarSection({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="relative bg-cream border-b-[6px] border-black overflow-hidden">
      {/* Background dot fields */}
      <div
        aria-hidden
        className="absolute top-0 left-0 hidden md:block dots-lg text-hotpink dots-fade-r opacity-50 pointer-events-none"
        style={{ width: "30%", height: "60%" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 dots text-black dots-fade-l opacity-20 pointer-events-none"
        style={{ width: "50%", height: "45%" }}
      />

      <div className="relative max-w-container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="inline-block bg-primary text-white border-[3px] border-black px-3 py-1 mb-4 rotate-[-2deg] shadow-[4px_4px_0_0_#000]">
              <span className="text-xs font-black uppercase tracking-widest">
                ★ Mark Your Calendar ★
              </span>
            </div>
            <h2 className="text-brutal text-5xl md:text-7xl text-black">
              UPCOMING
              <br />
              <span className="bg-accent text-black px-3 inline-block border-[5px] border-black rotate-[-1deg]">
                DROPS
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((e, i) => {
            const d = fmtDate(e.starts_at);
            const rotate = i % 3 === 0 ? "rotate-[-1deg]" : i % 3 === 1 ? "rotate-[1deg]" : "rotate-0";
            return (
              <CalendarCard
                key={e.id}
                event={e}
                month={d.month}
                day={d.day}
                time={d.time}
                rotate={rotate}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CalendarCard({
  event,
  month,
  day,
  time,
  rotate,
}: {
  event: CalendarEvent;
  month: string;
  day: number;
  time: string;
  rotate: string;
}) {
  const card = (
    <article
      className={`relative bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100 ${rotate}`}
    >
      <div className="flex">
        {/* Date block */}
        <div
          className={`flex-shrink-0 w-24 ${colorBg[event.accent_color]} border-r-[4px] border-black p-3 text-center flex flex-col justify-center`}
        >
          <div className="text-xs font-black uppercase tracking-widest leading-none">
            {month}
          </div>
          <div className="text-5xl font-black leading-none mt-1">{day}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider mt-1">
            {time}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4">
          <div className="inline-block bg-black text-white border-[2px] border-black px-2 py-0.5 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest">
              {typeLabel[event.type]}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-black line-clamp-2">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-xs text-muted mt-1 font-medium line-clamp-2">
              {event.description}
            </p>
          )}
          {event.product_handle && (
            <div className="mt-3 inline-block">
              <span className="text-[10px] font-black uppercase tracking-widest border-b-[2px] border-black">
                View product →
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );

  if (event.product_handle) {
    return (
      <Link href={`/products/${event.product_handle}`} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
