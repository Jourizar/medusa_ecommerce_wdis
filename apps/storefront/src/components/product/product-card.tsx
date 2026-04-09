"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format-price";
import type { MedusaProduct } from "@ecommerce/types";

interface ProductCardProps {
  product: MedusaProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.thumbnail || product.images?.[0]?.url;
  const lowestPrice = getLowestPrice(product.variants);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link href={`/products/${product.handle}`}>
        <Card hoverable glass className="group h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-surface">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted/30">
                No image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.collection && (
                <Badge variant="default" size="sm">
                  {product.collection.title}
                </Badge>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-medium text-text text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {product.description && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="mt-auto pt-3">
              {lowestPrice !== null && (
                <span className="text-lg font-display font-bold text-text">
                  {formatPrice(lowestPrice)}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/**
 * Get the lowest price from all variants.
 */
function getLowestPrice(
  variants: MedusaProduct["variants"]
): number | null {
  if (!variants || variants.length === 0) return null;

  let lowest = Infinity;
  for (const variant of variants) {
    for (const price of variant.prices) {
      if (price.currency_code === "usd" && price.amount < lowest) {
        lowest = price.amount;
      }
    }
  }

  return lowest === Infinity ? null : lowest;
}
