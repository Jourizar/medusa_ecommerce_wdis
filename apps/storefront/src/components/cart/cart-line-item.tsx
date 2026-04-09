"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils/format-price";
import { cn } from "@/lib/utils/cn";
import type { CartItem } from "@ecommerce/types";

interface CartLineItemProps {
  item: CartItem;
  compact?: boolean;
}

export function CartLineItem({ item, compact = false }: CartLineItemProps) {
  const { updateItemQuantity, removeItem, loading } = useCart();

  return (
    <div
      className={cn(
        "flex gap-4",
        compact ? "items-center" : "items-start p-4 glass rounded-xl"
      )}
    >
      {/* Thumbnail */}
      {item.thumbnail && (
        <Link
          href={`/products/${item.productId}`}
          className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface"
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
          href={`/products/${item.productId}`}
          className="text-sm font-medium text-text hover:text-primary transition-colors line-clamp-2"
        >
          {item.title}
        </Link>

        {item.variantTitle && (
          <p className="text-xs text-text-muted mt-0.5">{item.variantTitle}</p>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            disabled={loading || item.quantity <= 1}
            onClick={() =>
              updateItemQuantity(item.id, item.quantity - 1)
            }
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="text-sm font-medium text-text w-6 text-center">
            {item.quantity}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            disabled={loading || item.quantity >= 50}
            onClick={() =>
              updateItemQuantity(item.id, item.quantity + 1)
            }
          >
            <Plus className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-text-muted hover:text-danger"
            disabled={loading}
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-sm font-display font-bold text-text">
          {formatPrice(item.unitPrice * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <p className="text-xs text-text-muted mt-0.5">
            {formatPrice(item.unitPrice)} each
          </p>
        )}
      </div>
    </div>
  );
}
