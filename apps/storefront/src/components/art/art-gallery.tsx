"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { readArtBento } from "@/lib/medusa/art";
import { formatPrice } from "@/lib/utils/format-price";
import { getCheapestVariant } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";
import { ArtModal } from "./art-modal";
import { ArtEmpty } from "./art-empty";
import type { MedusaProduct } from "@ecommerce/types";

interface Props {
  products: MedusaProduct[];
}

/**
 * Scroll-driven gallery walk: one "wall" per piece. Each piece wipes in in
 * grayscale, settles from a tilt, turns to full color and drops its shadow
 * as it reaches the middle of the viewport, while the image drifts inside
 * its frame for depth. Static under prefers-reduced-motion.
 */
export function ArtGallery({ products }: Props) {
  const [selected, setSelected] = useState<MedusaProduct | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  if (products.length === 0) {
    return (
      <section className="bg-black px-4 py-16 md:py-24">
        <ArtEmpty />
      </section>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed top-0 inset-x-0 z-50 h-1.5 bg-accent origin-left"
        style={{ scaleX: progress }}
      />

      <div className="relative bg-black text-white overflow-x-clip">
        {products.map((p, i) => (
          <GalleryPiece
            key={p.id}
            product={p}
            index={i}
            total={products.length}
            onOpen={() => setSelected(p)}
          />
        ))}

        <section className="relative py-24 md:py-36 px-4 text-center border-t-[4px] border-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            End of the wall
          </p>
          <h2 className="text-brutal text-4xl md:text-6xl mt-4">
            See it all at once
          </h2>
          <Link
            href="/art/all"
            className="inline-block mt-8 px-6 py-3 text-sm font-black uppercase tracking-widest bg-hotpink text-black border-[3px] border-black shadow-[5px_5px_0_0_#51D6FF] hover:shadow-[8px_8px_0_0_#51D6FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-100"
          >
            All {products.length} pieces →
          </Link>
        </section>
      </div>

      <ArtModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function GalleryPiece({
  product,
  index,
  total,
  onOpen,
}: {
  product: MedusaProduct;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Smooth out wheel steps so pieces glide rather than jump.
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const flip = index % 2 === 1;
  const { featured } = readArtBento(product);
  const { amount } = getCheapestVariant(product.variants);
  const image = product.thumbnail || product.images?.[0]?.url;
  const number = String(index + 1).padStart(2, "0");

  // 0 = section top hits viewport bottom, 0.5 = section centered, 1 = gone.
  // Pieces land just before center and hold still until ~0.6.
  const inset = useTransform(p, [0.05, 0.42], [28, 0]);
  const clipPath = useTransform(inset, (v) => `inset(${v}% ${v / 2}% ${v}% ${v / 2}%)`);
  const frameY = useTransform(p, [0, 0.42, 0.6, 1], [140, 0, 0, -120]);
  const frameRotate = useTransform(p, [0.05, 0.42], [flip ? 5 : -5, 0]);
  const frameScale = useTransform(p, [0.05, 0.42, 0.65, 1], [0.82, 1, 1, 0.92]);
  const shadowOffset = useTransform(p, [0.3, 0.46], [0, 14]);
  const shadowOpacity = useTransform(p, [0.28, 0.4], [0, 1]);
  const imageY = useTransform(p, [0, 1], ["-8%", "8%"]);
  // Grayscale while entering, full color by the time the piece lands.
  const grayscale = useTransform(p, [0.1, 0.42], [1, 0]);
  const filter = useTransform(grayscale, (g) => `grayscale(${g})`);
  const captionX = useTransform(p, [0.2, 0.48], [flip ? -80 : 80, 0]);
  const captionOpacity = useTransform(p, [0.22, 0.42, 0.65, 0.85], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] md:min-h-[120vh] flex items-center pt-40 pb-24"
    >
      <div
        className={cn(
          "relative w-full max-w-container mx-auto px-6 sm:px-10 flex flex-col items-center gap-12 md:gap-20 md:justify-center",
          flip ? "md:flex-row-reverse" : "md:flex-row"
        )}
      >
        <motion.button
          type="button"
          onClick={onOpen}
          aria-label={`View ${product.title}`}
          style={reduce ? undefined : { y: frameY, rotate: frameRotate, scale: frameScale }}
          className={cn(
            "group relative shrink-0 aspect-[4/5] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-accent",
            featured
              ? "w-[min(84vw,calc((100svh-15rem)*0.8))] md:w-[min(44vw,calc((100svh-15rem)*0.8))] max-w-2xl"
              : "w-[min(78vw,calc((100svh-14rem)*0.8))] md:w-[min(36vw,calc((100svh-14rem)*0.8))] max-w-xl"
          )}
        >
          {/* Shadow block drops out from behind once the piece lands */}
          <motion.div
            aria-hidden
            className={cn(
              "absolute inset-0 border-[4px] border-black",
              featured ? "bg-hotpink" : "bg-accent"
            )}
            style={reduce ? { x: 14, y: 14 } : { x: shadowOffset, y: shadowOffset, opacity: shadowOpacity }}
          />

          <motion.div
            className="absolute inset-0 overflow-hidden border-[4px] border-black bg-bg-alt"
            style={reduce ? undefined : { clipPath }}
          >
            {image ? (
              <motion.div
                className="absolute inset-x-0 -top-[12%] -bottom-[12%]"
                style={reduce ? undefined : { y: imageY, filter }}
              >
                <Image
                  src={image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 84vw, 44vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted">
                <span className="text-xs font-black uppercase tracking-widest">No image</span>
              </div>
            )}
            <div aria-hidden className="absolute inset-0 dither-overlay pointer-events-none opacity-30" />
          </motion.div>

          {featured && (
            <div className="absolute -top-4 -left-4 z-10 bg-primary text-white border-[3px] border-black px-2 py-1 shadow-[3px_3px_0_0_#000] -rotate-3">
              <span className="text-[10px] font-black uppercase tracking-widest">★ Featured</span>
            </div>
          )}
        </motion.button>

        <motion.div
          style={reduce ? undefined : { x: captionX, opacity: captionOpacity }}
          className={cn("w-full md:w-[30vw] max-w-sm", flip ? "md:text-right" : "")}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            No. {number} / {String(total).padStart(2, "0")}
          </p>
          <h2 className="text-brutal text-4xl md:text-6xl mt-3 break-words">{product.title}</h2>
          <div className={cn("mt-6 flex items-center gap-5", flip ? "md:justify-end" : "")}>
            {amount !== null && (
              <span className="bg-accent text-black border-[3px] border-black px-3 py-1 text-xl font-black tracking-tight shadow-[4px_4px_0_0_#EC69D4]">
                {formatPrice(amount)}
              </span>
            )}
            <button
              type="button"
              onClick={onOpen}
              className="text-xs font-black uppercase tracking-widest underline underline-offset-4 decoration-2 hover:text-hotpink"
            >
              View piece →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
