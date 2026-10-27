"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselImage } from "@/lib/medusa/carousel";

interface Props {
  slides: CarouselImage[];
}

const SHIFT_PERCENT = 110;

export function HeroCarousel({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), 4500);
    return () => clearInterval(id);
  }, [paused, n]);

  if (n === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + n) % n);
  const goNext = () => setIndex((i) => (i + 1) % n);

  return (
    <div
      className="relative mx-auto mt-14 md:mt-20 w-full max-w-5xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured looks"
    >
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] overflow-hidden">
        {slides.map((slide, i) => {
          let offset = i - index;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;

          const abs = Math.abs(offset);
          const visible = abs <= 1;

          const translatePct = offset * SHIFT_PERCENT;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.5;
          const rotate = offset === 0 ? 0 : offset < 0 ? -3 : 3;
          const opacity = visible ? 1 : 0;
          const z = 10 - abs;
          const shadow =
            abs === 0
              ? "shadow-[12px_12px_0_0_#000]"
              : "shadow-[6px_6px_0_0_#000]";

          const tileClasses = `group absolute top-1/2 left-1/2 block w-[64%] sm:w-[42%] md:w-[34%] aspect-[3/4] overflow-hidden bg-cream border-[4px] border-black transition-[transform,opacity,box-shadow] duration-700 ease-out will-change-transform ${shadow}`;
          const tileStyle = {
            transform: `translate(-50%, -50%) translateX(${translatePct}%) rotate(${rotate}deg) scale(${scale})`,
            opacity,
            zIndex: z,
            pointerEvents: (visible ? "auto" : "none") as "auto" | "none",
          };

          const inner = (
            <Image
              src={slide.image_url}
              alt={slide.alt_text ?? ""}
              fill
              sizes="(max-width:640px) 64vw, (max-width:768px) 42vw, 34vw"
              priority={i < 3}
              className="object-cover"
              unoptimized={slide.image_url.startsWith("data:")}
            />
          );

          return slide.href ? (
            <Link
              key={slide.id}
              href={slide.href}
              tabIndex={abs === 0 ? 0 : -1}
              aria-hidden={!visible}
              aria-label={slide.alt_text ?? undefined}
              className={tileClasses}
              style={tileStyle}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={slide.id}
              aria-hidden={!visible}
              className={tileClasses}
              style={tileStyle}
            >
              {inner}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={goPrev}
        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 inline-flex items-center justify-center border-[3px] border-black bg-cream hover:bg-accent shadow-[4px_4px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[calc(50%+2px)] transition-[transform,background-color,box-shadow]"
      >
        <ChevronLeft className="w-6 h-6" strokeWidth={3} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={goNext}
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 inline-flex items-center justify-center border-[3px] border-black bg-cream hover:bg-accent shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:-translate-y-[calc(50%+2px)] transition-[transform,background-color,box-shadow]"
      >
        <ChevronRight className="w-6 h-6" strokeWidth={3} />
      </button>

      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-3 border-[2px] border-black transition-all ${
              i === index ? "w-10 bg-primary" : "w-4 bg-cream hover:bg-accent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
