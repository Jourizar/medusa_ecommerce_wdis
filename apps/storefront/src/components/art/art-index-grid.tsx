"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { getCheapestVariant } from "@/lib/utils/price";
import { ArtModal } from "./art-modal";
import { ArtEmpty } from "./art-empty";
import type { MedusaProduct } from "@ecommerce/types";

interface Props {
  products: MedusaProduct[];
}

/** Minimal catalogue view: image, title, price — nothing else. */
export function ArtIndexGrid({ products }: Props) {
  const [selected, setSelected] = useState<MedusaProduct | null>(null);
  const reduce = useReducedMotion();

  if (products.length === 0) return <ArtEmpty />;

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 md:gap-y-14">
        {products.map((p, i) => {
          const { amount } = getCheapestVariant(p.variants);
          const image = p.thumbnail || p.images?.[0]?.url;
          return (
            <motion.li
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: (i % 4) * 0.06 }}
            >
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-bg-alt">
                  {image && (
                    <Image
                      src={image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 text-xs sm:text-sm uppercase tracking-wider">
                  <span className="font-bold truncate group-hover:underline underline-offset-4">
                    {p.title}
                  </span>
                  {amount !== null && (
                    <span className="shrink-0 tabular-nums text-muted">{formatPrice(amount)}</span>
                  )}
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <ArtModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
