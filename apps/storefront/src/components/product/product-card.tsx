import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format-price";
import { getLowestPrice } from "@/lib/utils/price";
import { SHIMMER_PLACEHOLDER } from "@/lib/utils/shimmer";
import type { MedusaProduct } from "@ecommerce/types";

interface ProductCardProps {
  product: MedusaProduct;
  /** Load eagerly — set for cards in the first visible row (LCP). */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const imageUrl = product.thumbnail || product.images?.[0]?.url;
  const lowestPrice = getLowestPrice(product.variants);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[3px_3px_0_0_#000] active:translate-x-1 active:translate-y-1 transition-[transform,box-shadow] duration-100"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-alt border-b-[4px] border-black">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            placeholder={SHIMMER_PLACEHOLDER}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <div className="text-center">
              <div className="text-5xl mb-2 font-black">?</div>
              <div className="text-xs font-bold uppercase tracking-widest">
                No image
              </div>
            </div>
          </div>
        )}

        {/* Collection badge */}
        {product.collection && (
          <div className="absolute top-3 left-3 bg-accent text-black border-[3px] border-black px-2 py-1 shadow-[3px_3px_0_0_#000]">
            <span className="text-[10px] font-black uppercase tracking-widest">
              {product.collection.title}
            </span>
          </div>
        )}

        {/* Price tag corner */}
        {lowestPrice !== null && (
          <div className="absolute bottom-0 right-0 bg-primary text-white border-l-[4px] border-t-[4px] border-black px-4 py-2">
            <span className="text-lg md:text-xl font-black tracking-tight">
              {formatPrice(lowestPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-black text-base text-black uppercase tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-xs text-muted mt-1 line-clamp-2 font-medium">
            {product.description}
          </p>
        )}

        <div className="mt-3 pt-3 border-t-[2px] border-black flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">
            View Details
          </span>
          <span className="text-lg font-black">→</span>
        </div>
      </div>
    </Link>
  );
}
