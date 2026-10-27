import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/medusa/products";
import { getStoreCategories } from "@/lib/medusa/categories";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Reveal } from "@/components/ui/reveal";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { getLowestPrice } from "@/lib/utils/price";
import type { MedusaProduct } from "@ecommerce/types";

const PRODUCTS_PER_PAGE = 12;
const MAX_FETCH = 200;

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    q?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  // Sorted/filtered/search views are near-duplicates of the main listing:
  // keep them crawlable for links but out of the index.
  const isVariant = Object.values(params).some(Boolean);
  return {
    title: "Shop All Products",
    description:
      "Browse our full collection of premium streetwear and urban fashion.",
    alternates: { canonical: "/products" },
    ...(isVariant && { robots: { index: false, follow: true } }),
  };
}

// Returns the lowest variant price in decimal currency units (Medusa v2's
// calculated_amount convention, e.g. 29.99).
function priceOf(p: MedusaProduct): number {
  return getLowestPrice(p.variants) ?? 0;
}

function computePriceBounds(products: MedusaProduct[]): {
  min: number;
  max: number;
} {
  if (products.length === 0) return { min: 0, max: 200 };
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of products) {
    const price = priceOf(p);
    if (price <= 0) continue;
    if (price < lo) lo = price;
    if (price > hi) hi = price;
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { min: 0, max: 200 };
  }
  // Round outward to the nearest $5 so the slider has clean stops.
  const min = Math.max(0, Math.floor(lo / 5) * 5);
  const max = Math.max(min + 5, Math.ceil(hi / 5) * 5);
  return { min, max };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const ALLOWED_SORTS = new Set([
    "-created_at",
    "created_at",
    "title",
    "-title",
    "price_asc",
    "price_desc",
  ]);
  const sort = ALLOWED_SORTS.has(params.sort ?? "") ? params.sort! : "-created_at";

  // Build backend-supported filters
  const backendFilters: Record<string, string> = {
    limit: String(MAX_FETCH),
    offset: "0",
  };

  // Sort: Medusa accepts product-field sort; price sort is post-handled
  if (sort !== "price_asc" && sort !== "price_desc") {
    backendFilters.order = sort;
  }

  if (params.category) backendFilters["category_id[]"] = params.category;
  if (params.q && params.q.trim()) backendFilters.q = params.q.trim();

  // Fetch the working set + categories in parallel
  const [allProducts, categories] = await Promise.all([
    getProducts(backendFilters).catch(() => [] as MedusaProduct[]),
    getStoreCategories(),
  ]);

  // Compute slider bounds from the full result set (price is in dollars).
  const priceBounds = computePriceBounds(allProducts);

  // URL params and calculated_amount are both in decimal currency units.
  const minPrice = Math.max(0, Number(params.min_price) || 0);
  const maxPrice = Math.max(0, Number(params.max_price) || 0);

  let filtered = allProducts;
  if (minPrice > 0 || maxPrice > 0) {
    filtered = allProducts.filter((p) => {
      const price = priceOf(p);
      if (minPrice > 0 && price < minPrice) return false;
      if (maxPrice > 0 && price > maxPrice) return false;
      return true;
    });
  }

  // Post-sort if price sort requested
  if (sort === "price_asc") {
    filtered = [...filtered].sort((a, b) => priceOf(a) - priceOf(b));
  } else if (sort === "price_desc") {
    filtered = [...filtered].sort((a, b) => priceOf(b) - priceOf(a));
  }

  const totalProducts = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  const products = filtered.slice(offset, offset + PRODUCTS_PER_PAGE);

  return (
    // -mb-20/pb-20 runs the texture under the footer's mt-20 gap; min-h keeps
    // it filling the screen (below the 92px navbar) when results are few.
    <div className="paper-texture -mb-20 pb-20 min-h-[calc(100svh-92px)]">
      <div className="max-w-container mx-auto px-4 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-brutal text-4xl md:text-5xl text-black break-words">
              {params.q ? `RESULTS FOR "${params.q.toUpperCase()}"` : "ALL PRODUCTS"}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mt-2">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="shrink-0">
            <Suspense>
              <ProductFilters
                categories={categories}
                priceMin={priceBounds.min}
                priceMax={priceBounds.max}
              />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<SkeletonGrid count={PRODUCTS_PER_PAGE} />}>
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: MedusaProduct, i) =>
                  // First row is above the fold: render eagerly, no reveal.
                  i < 4 ? (
                    <ProductCard key={product.id} product={product} priority />
                  ) : (
                    <Reveal key={product.id} index={i}>
                      <ProductCard product={product} />
                    </Reveal>
                  )
                )}
              </div>

              {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} />
              )}
            </>
          ) : (
            <div className="bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] p-8 md:p-12 text-center">
              <p className="text-brutal text-2xl md:text-3xl text-black">
                NO MATCHES.
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-muted mt-3">
                Try a different filter combination.
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
