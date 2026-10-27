"use client";

import { useState } from "react";
import Image from "next/image";
import { readArtBento } from "@/lib/medusa/art";
import { ArtModal } from "./art-modal";
import type { MedusaProduct } from "@ecommerce/types";

interface Props {
  products: MedusaProduct[];
}

// Mobile only ever spans 1-2 cols. md+ uses configured 1-4.
const colSpanMobile: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-2",
  4: "col-span-2",
};
const colSpanDesktop: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};
const rowSpan: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
};

const rotations = ["-rotate-1", "rotate-0", "rotate-1"];

export function ArtBentoGrid({ products }: Props) {
  const [selected, setSelected] = useState<MedusaProduct | null>(null);

  if (products.length === 0) {
    return (
      <div className="bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#fff] p-8 md:p-12 text-center max-w-xl mx-auto">
        <p className="text-brutal text-2xl md:text-3xl text-black">
          NOTHING IN THE GALLERY YET.
        </p>
        <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted mt-3">
          Add pieces from the admin → Art panel.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="
          mx-auto
          grid grid-cols-2 md:grid-cols-4
          gap-3 sm:gap-4 md:gap-5
          auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[220px]
          max-w-5xl
        "
      >
        {products.map((p, i) => {
          const { col, row, featured } = readArtBento(p);
          const image = p.thumbnail || p.images?.[0]?.url;
          const rotate = rotations[i % rotations.length];
          const featuredBg = featured ? "bg-hotpink" : "bg-cream";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className={`
                group relative overflow-hidden text-left
                ${featuredBg}
                border-[4px] border-black
                shadow-[5px_5px_0_0_#51D6FF]
                hover:shadow-[10px_10px_0_0_#51D6FF]
                hover:-translate-x-1 hover:-translate-y-1
                active:shadow-[2px_2px_0_0_#51D6FF]
                active:translate-x-1 active:translate-y-1
                transition-[transform,box-shadow] duration-100
                ${colSpanMobile[col]} ${colSpanDesktop[col]}
                ${rowSpan[row]}
                ${rotate}
              `}
            >
              {image ? (
                <Image
                  src={image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted">
                  <span className="text-xs font-black uppercase tracking-widest">
                    No image
                  </span>
                </div>
              )}

              {/* Dither overlay on each tile for that VHS feel */}
              <div
                aria-hidden
                className="absolute inset-0 dither-overlay pointer-events-none opacity-40"
              />

              {featured && (
                <div className="absolute top-2 left-2 bg-primary text-white border-[2px] sm:border-[3px] border-black px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-[3px_3px_0_0_#000] rotate-[-3deg]">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                    ★ Featured
                  </span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-sm text-white px-2 sm:px-3 py-2 border-t-[3px] border-black">
                <h3 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-tight line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-accent mt-0.5">
                  Tap to view →
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <ArtModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
