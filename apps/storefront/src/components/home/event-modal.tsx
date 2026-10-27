"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Calendar, Clock, ArrowRight } from "lucide-react";
import type { CalendarEvent } from "@/lib/medusa/calendar";

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
}

const accentBg: Record<CalendarEvent["accent_color"], string> = {
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

function fmtLong(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function EventModal({ event, onClose }: Props) {
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [event, onClose]);

  if (!event) return null;

  const start = fmtLong(event.starts_at);
  const end = event.ends_at ? fmtLong(event.ends_at) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-cream border-[4px] sm:border-[5px] border-black shadow-[8px_8px_0_0_#77269A] sm:shadow-[12px_12px_0_0_#77269A]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 h-10 w-10 inline-flex items-center justify-center border-[3px] border-black bg-hotpink hover:bg-accent text-black shadow-[3px_3px_0_0_#000]"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>

        {event.image_url ? (
          <div className="relative w-full aspect-[16/9] border-b-[4px] border-black bg-black overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`w-full aspect-[16/6] border-b-[4px] border-black ${accentBg[event.accent_color]} flex items-center justify-center`}
          >
            <span className="text-brutal text-4xl sm:text-6xl text-black opacity-60">
              {typeLabel[event.type]}
            </span>
          </div>
        )}

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-block bg-black text-white border-[2px] border-black px-2 py-1 shadow-[3px_3px_0_0_#77269A]">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {typeLabel[event.type]}
              </span>
            </div>
            <div
              className={`inline-block ${accentBg[event.accent_color]} border-[2px] border-black px-2 py-1 shadow-[3px_3px_0_0_#000]`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                {start.date.split(",")[0]}
              </span>
            </div>
          </div>

          <h2 className="text-brutal text-3xl sm:text-4xl md:text-5xl text-black leading-none mb-4">
            {event.title}
          </h2>

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-black">
              <Calendar className="w-4 h-4 shrink-0" strokeWidth={3} />
              <span>{start.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-black">
              <Clock className="w-4 h-4 shrink-0" strokeWidth={3} />
              <span>
                {start.time}
                {end && ` — ${end.date === start.date ? end.time : `${end.date}, ${end.time}`}`}
              </span>
            </div>
          </div>

          {event.description && (
            <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000] mb-5">
              <p className="text-sm sm:text-base text-black font-medium leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {event.product_handle && (
            <Link
              href={`/products/${event.product_handle}`}
              className="inline-flex items-center justify-center font-black uppercase tracking-widest text-sm border-[3px] border-black bg-primary text-white px-5 py-3 shadow-[5px_5px_0_0_#000] hover:shadow-[7px_7px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100"
            >
              View Product
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
