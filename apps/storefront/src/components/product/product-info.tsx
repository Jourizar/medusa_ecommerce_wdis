import type { MedusaProduct } from "@ecommerce/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format-price";
import { getLowestPrice, getHighestPrice } from "@/lib/utils/price";

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
        {product.type && <Badge variant="accent">{product.type.value}</Badge>}
        {(product.tags ?? []).map((tag) => (
          <Badge key={tag.id} variant="accent" size="sm">
            {tag.value}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-brutal text-4xl md:text-6xl text-black mb-4 break-words">
        {product.title}
      </h1>

      {/* Subtitle */}
      {product.subtitle && (
        <p className="text-sm font-bold uppercase tracking-widest text-muted mb-4">{product.subtitle}</p>
      )}

      {/* Price */}
      <div className="mb-6">
        {lowestPrice !== null && (
          <span className="inline-block bg-accent text-black border-[3px] border-black px-3 py-1 text-2xl md:text-3xl font-black tracking-tight shadow-[4px_4px_0_0_#EC69D4] -rotate-1">
            {lowestPrice === highestPrice
              ? formatPrice(lowestPrice)
              : `${formatPrice(lowestPrice)} – ${formatPrice(highestPrice!)}`}
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="text-sm md:text-base font-medium leading-relaxed text-black/75 max-w-prose">
          {product.description}
        </div>
      )}
    </div>
  );
}
