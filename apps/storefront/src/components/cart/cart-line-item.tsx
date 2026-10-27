"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import type { CartItem } from "@ecommerce/types";

interface CartLineItemProps {
  item: CartItem;
  compact?: boolean;
}

const iconBtn =
  "h-9 w-9 inline-flex items-center justify-center border-[3px] border-black bg-cream text-black hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors";

export function CartLineItem({ item, compact = false }: CartLineItemProps) {
  const { updateItemQuantity, removeItem, loading } = useCart();
  // Product pages are routed by handle; fall back to the listing if we don't have one.
  const productUrl = item.productHandle ? `/products/${item.productHandle}` : "/products";

  return (
    <div
      className={cn(
        "flex gap-4 bg-cream border-[4px] border-black",
        compact ? "p-3 shadow-[4px_4px_0_0_#000]" : "p-4 shadow-[5px_5px_0_0_#000]"
      )}
    >
      {/* Thumbnail */}
      {item.thumbnail && (
        <Link
          href={productUrl}
          className="relative w-20 h-20 flex-shrink-0 border-[3px] border-black overflow-hidden bg-bg-alt"
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={productUrl}
          className="text-sm font-black uppercase tracking-tight text-black hover:text-primary transition-colors line-clamp-2"
        >
          {item.title}
        </Link>

        {item.variantTitle && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
            {item.variantTitle}
          </p>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            className={iconBtn}
            disabled={loading || item.quantity <= 1}
            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="w-3.5 h-3.5" strokeWidth={3} />
          </button>

          <span className="text-sm font-black text-black w-7 text-center">
            {item.quantity}
          </span>

          <button
            type="button"
            aria-label="Increase quantity"
            className={iconBtn}
            disabled={loading || item.quantity >= 50}
            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </button>

          <button
            type="button"
            aria-label="Remove item"
            className="ml-auto h-9 w-9 inline-flex items-center justify-center border-[3px] border-black bg-hotpink text-black hover:bg-primary hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
            disabled={loading}
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-base font-black text-black">
          {formatPrice(item.unitPrice * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
            {formatPrice(item.unitPrice)} ea
          </p>
        )}
      </div>
    </div>
  );
}
