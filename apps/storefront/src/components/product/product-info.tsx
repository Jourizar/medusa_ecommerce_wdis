import type { MedusaProduct } from "@ecommerce/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format-price";

interface ProductInfoProps {
  product: MedusaProduct;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const lowestPrice = getLowestPrice(product.variants);
  const highestPrice = getHighestPrice(product.variants);

  return (
    <div className="mb-6">
      {/* Collection / Type badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {product.collection && (
          <Badge variant="default">{product.collection.title}</Badge>
        )}
        {product.type && <Badge variant="ghost">{product.type.value}</Badge>}
        {product.tags.map((tag) => (
          <Badge key={tag.id} variant="ghost" size="sm">
            {tag.value}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-display font-bold text-text mb-3">
        {product.title}
      </h1>

      {/* Subtitle */}
      {product.subtitle && (
        <p className="text-lg text-text-muted mb-4">{product.subtitle}</p>
      )}

      {/* Price */}
      <div className="mb-6">
        {lowestPrice !== null && (
          <span className="text-2xl font-display font-bold text-text">
            {lowestPrice === highestPrice
              ? formatPrice(lowestPrice)
              : `${formatPrice(lowestPrice)} – ${formatPrice(highestPrice!)}`}
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="prose prose-invert prose-sm max-w-none text-text-muted">
          {product.description}
        </div>
      )}
    </div>
  );
}

function getLowestPrice(
  variants: MedusaProduct["variants"]
): number | null {
  if (!variants || variants.length === 0) return null;
  let lowest = Infinity;
  for (const v of variants) {
    for (const p of v.prices) {
      if (p.currency_code === "usd" && p.amount < lowest) lowest = p.amount;
    }
  }
  return lowest === Infinity ? null : lowest;
}

function getHighestPrice(
  variants: MedusaProduct["variants"]
): number | null {
  if (!variants || variants.length === 0) return null;
  let highest = -Infinity;
  for (const v of variants) {
    for (const p of v.prices) {
      if (p.currency_code === "usd" && p.amount > highest) highest = p.amount;
    }
  }
  return highest === -Infinity ? null : highest;
}
