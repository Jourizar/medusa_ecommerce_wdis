"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils/format-price";
import { getCheapestVariant } from "@/lib/utils/price";
import type { MedusaProduct } from "@ecommerce/types";

interface Props {
  product: MedusaProduct | null;
  onClose: () => void;
}

export function ArtModal({ product, onClose }: Props) {
  const { addItem, loading } = useCart();
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      setAdded(false);
      setZoomed(false);
    };
  }, [product, onClose]);

  if (!product) return null;

  const { variantId, amount } = getCheapestVariant(product.variants);
  const image = product.thumbnail || product.images?.[0]?.url;

  const handleAdd = async () => {
    if (!variantId) return;
    try {
      await addItem(variantId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-5 md:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col overflow-hidden bg-black border-[3px] sm:border-[4px] md:border-[5px] border-black shadow-[6px_6px_0_0_#77269A] sm:shadow-[8px_8px_0_0_#77269A] md:shadow-[12px_12px_0_0_#77269A] w-full max-w-6xl h-[88dvh] sm:h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-20 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 inline-flex items-center justify-center border-[2px] sm:border-[3px] border-black bg-hotpink hover:bg-accent text-black shadow-[2px_2px_0_0_#000] sm:shadow-[3px_3px_0_0_#000]"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
        </button>

        {/* Art piece tag */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 z-20 bg-primary text-white border-[2px] sm:border-[3px] border-black px-2 py-0.5 sm:px-3 sm:py-1 -rotate-2 shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            ★ Art Piece
          </span>
        </div>

        {/* Fitted image with Amazon-style pan zoom */}
        {image ? (
          <div
            className={`relative flex-1 min-h-0 overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={() => setZoomed((z) => !z)}
            onMouseMove={(e) => {
              if (!zoomed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
              setOrigin({ x, y });
            }}
            onMouseLeave={() => setOrigin({ x: 50, y: 50 })}
          >
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="(max-width: 1200px) 96vw, 1152px"
              priority
              className={`transition-transform duration-300 ${zoomed ? "object-cover scale-[2.5]" : "object-contain scale-100"}`}
              style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-bg-alt">
            <span className="text-xs font-black uppercase tracking-widest text-muted">
              No image
            </span>
          </div>
        )}

        {/* Info bar — below the artwork so it never covers the image */}
        <div className="relative z-10 shrink-0 bg-cream border-t-[3px] sm:border-t-[4px] md:border-t-[5px] border-black">
          <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 md:gap-5">
            <div className="flex-1 min-w-0">
              <h2 className="text-brutal text-lg sm:text-xl md:text-2xl lg:text-3xl text-black mb-1 sm:mb-1.5 leading-none line-clamp-2 sm:line-clamp-1">
                {product.title}
              </h2>
              {product.description && (
                <p className="hidden sm:block text-[11px] md:text-xs lg:text-sm text-black/75 font-medium leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
              {amount !== null && (
                <div className="bg-accent border-[2px] sm:border-[3px] border-black px-2 py-1 sm:px-3 sm:py-1.5 shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-tight">
                    {formatPrice(amount)}
                  </span>
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={!variantId || loading}
                className="inline-flex items-center justify-center font-black uppercase tracking-widest border-[2px] sm:border-[3px] border-black bg-primary text-white px-2.5 py-2 sm:px-3.5 sm:py-2.5 md:px-4 md:py-3 lg:px-5 lg:py-3.5 text-[11px] sm:text-xs md:text-sm shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] md:shadow-[5px_5px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] sm:hover:shadow-[6px_6px_0_0_#000] md:hover:shadow-[7px_7px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={3} />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={3} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
