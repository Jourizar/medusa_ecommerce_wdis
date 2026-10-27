import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { MedusaProduct } from "@ecommerce/types";

interface FeaturedProductsProps {
  products: MedusaProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="relative py-24 px-4 bg-cream border-b-[6px] border-black overflow-hidden">
      <div className="relative max-w-container mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="inline-block bg-hotpink text-black border-[3px] border-black px-3 py-1 mb-4 -rotate-2 shadow-[4px_4px_0_0_#000]">
              <span className="text-xs font-black uppercase tracking-widest">
                ★ Fresh ★
              </span>
            </div>
            <h2 className="text-brutal text-5xl md:text-7xl text-black">
              FRESH
              <br />
              DROPS.
            </h2>
            <p className="text-base font-bold uppercase tracking-wider text-muted mt-4 max-w-md">
              The latest hits from our collection
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center font-black uppercase tracking-widest text-sm border-[3px] border-black bg-accent text-black px-5 py-3 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <Reveal key={product.id} index={i}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
