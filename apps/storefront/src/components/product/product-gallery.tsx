"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SHIMMER_PLACEHOLDER } from "@/lib/utils/shimmer";
import type { MedusaImage } from "@ecommerce/types";

interface ProductGalleryProps {
  images: MedusaImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-bg-alt border-[4px] border-black shadow-[8px_8px_0_0_#000] flex items-center justify-center text-xs font-black uppercase tracking-widest text-muted">
        No image available
      </div>
    );
  }

  const goToPrevious = () =>
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () =>
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className={`relative aspect-square bg-bg-alt border-[4px] border-black shadow-[8px_8px_0_0_#000] overflow-hidden ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={(e) => {
          if (!isZoomed) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
          setOrigin({ x, y });
        }}
        onMouseLeave={() => setOrigin({ x: 50, y: 50 })}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            // Positioned so the `fill` image has a containing block.
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].url}
              alt={`${title} - Image ${activeIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "scale-[2.5]" : "scale-100"
              }`}
              style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
              placeholder={SHIMMER_PLACEHOLDER}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows + counter */}
        {images.length > 1 && (
          <>
            <span className="absolute top-3 left-3 bg-black text-white border-[2px] border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center bg-cream text-black border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:bg-accent active:shadow-none active:translate-x-[3px] transition-[box-shadow,background-color] duration-100"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={3} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center bg-cream text-black border-[3px] border-black shadow-[3px_3px_0_0_#000] hover:bg-accent active:shadow-none active:translate-x-[3px] transition-[box-shadow,background-color] duration-100"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto p-1 pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex || undefined}
              className={`relative w-20 h-20 flex-shrink-0 border-[3px] border-black overflow-hidden transition-[opacity,transform,box-shadow] duration-150 ${
                index === activeIndex
                  ? "shadow-[4px_4px_0_0_#EC69D4] -translate-x-0.5 -translate-y-0.5"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
