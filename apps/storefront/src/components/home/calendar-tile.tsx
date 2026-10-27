"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/lib/medusa/calendar";
import { EventModal } from "./event-modal";
import { StayPostedGraffiti } from "./stay-posted-graffiti";

interface Props {
  events: CalendarEvent[];
}

const dateBlockBg: Record<CalendarEvent["accent_color"], string> = {
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
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function CalendarTile({ events }: Props) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  return (
    <>
      <article className="md:row-span-2 relative bg-cream border-[5px] border-black shadow-[8px_8px_0_0_#51D6FF] flex flex-col -rotate-1">
        <div className="bg-primary text-white border-b-[5px] border-black px-5 py-4">
          <div className="inline-block bg-accent text-black border-[3px] border-black px-2 py-0.5 mb-2 rotate-[-2deg] shadow-[3px_3px_0_0_#000]">
            <span className="text-[10px] font-black uppercase tracking-widest">
              ★ Calendar ★
            </span>
          </div>
          <h2 className="text-brutal text-4xl md:text-5xl leading-none">
            UPCOMING
            <br />
            DROPS.
          </h2>
        </div>

        <div className="flex-1 p-4 md:p-5 space-y-3 overflow-y-auto">
          {events.length === 0 ? (
            <div className="h-full min-h-[240px] flex items-center justify-center">
              <StayPostedGraffiti className="w-full max-w-md md:max-w-xl h-auto" />
            </div>
          ) : (
            events.slice(0, 5).map((e) => {
              const d = fmtDate(e.starts_at);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e)}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-hotpink"
                >
                  <article className="bg-cream border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-100 flex">
                    <div
                      className={`flex-shrink-0 w-16 md:w-20 ${dateBlockBg[e.accent_color]} border-r-[3px] border-black p-2 text-center flex flex-col justify-center`}
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest leading-none">
                        {d.month}
                      </div>
                      <div className="text-2xl md:text-3xl font-black leading-none mt-0.5">
                        {d.day}
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-wider mt-0.5 truncate">
                        {d.time}
                      </div>
                    </div>

                    {e.image_url && (
                      <div className="flex-shrink-0 w-16 md:w-20 border-r-[3px] border-black bg-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.image_url}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 p-3 min-w-0">
                      <div className="inline-block bg-black text-white px-1.5 py-0.5 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {typeLabel[e.type]}
                        </span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-black line-clamp-1">
                        {e.title}
                      </h3>
                      {e.description && (
                        <p className="text-[10px] text-muted mt-0.5 font-medium line-clamp-2">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </article>
                </button>
              );
            })
          )}
        </div>
      </article>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
