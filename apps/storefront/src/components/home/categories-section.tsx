import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CalendarEvent } from "@/lib/medusa/calendar";
import { CalendarTile } from "./calendar-tile";

interface Props {
  events: CalendarEvent[];
}

const tiles = [
  {
    title: "Merch",
    subtitle: "Streetwear · Drops · Essentials",
    href: "/products",
    cta: "Shop Merch",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1400&q=80",
    sticker: "bg-accent",
    rotate: "-rotate-1",
  },
  {
    title: "Art",
    subtitle: "Paintings · Limited Prints · Originals",
    href: "/art",
    cta: "Enter Gallery",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400&q=80",
    sticker: "bg-hotpink",
    rotate: "rotate-1",
  },
] as const;

export function CategoriesSection({ events }: Props) {
  return (
    <section className="relative py-20 px-4 bg-black border-b-[6px] border-black overflow-hidden">
      <div className="relative max-w-container mx-auto grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-8 md:gap-10">
        {/* Calendar — spans both rows on desktop */}
        <CalendarTile events={events} />

        {/* Row 1: Merch */}
        <TileCard tile={tiles[0]} />

        {/* Row 2: Art */}
        <TileCard tile={tiles[1]} />
      </div>
    </section>
  );
}

function TileCard({ tile }: { tile: (typeof tiles)[number] }) {
  return (
    <article
      className={`group relative bg-cream border-[5px] border-black shadow-[8px_8px_0_0_#fff] hover:shadow-[12px_12px_0_0_#fff] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-150 ${tile.rotate} flex flex-col`}
    >
      <div className="relative aspect-[5/3] overflow-hidden border-b-[5px] border-black bg-bg-alt">
        <Image
          src={tile.image}
          alt={tile.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className={`absolute top-3 left-3 ${tile.sticker} text-black border-[3px] border-black px-2 py-0.5 shadow-[4px_4px_0_0_#000] -rotate-2`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            ★ {tile.title}
          </span>
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h3 className="text-brutal text-3xl md:text-4xl text-black">
            {tile.title.toUpperCase()}.
          </h3>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted mt-1.5">
            {tile.subtitle}
          </p>
        </div>

        <Link
          href={tile.href}
          className="inline-flex items-center justify-center self-start sm:self-auto font-black uppercase tracking-widest text-xs sm:text-sm border-[3px] border-black bg-primary text-white px-4 py-2.5 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100 whitespace-nowrap"
        >
          {tile.cta}
          <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
        </Link>
      </div>
    </article>
  );
}
