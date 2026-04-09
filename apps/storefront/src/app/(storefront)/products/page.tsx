import { Suspense } from "react";
import { getProducts, getProductsCount } from "@/lib/medusa/products";
import { getRegions } from "@/lib/medusa/regions";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { SortDropdown } from "@/components/product/sort-dropdown";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonGrid } from "@/components/ui/skeleton";
import type { MedusaProduct, MedusaRegion } from "@ecommerce/types";

const PRODUCTS_PER_PAGE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: "Shop All Products",
    description: "Browse our full collection of premium streetwear and urban fashion.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sort = params.sort || "-created_at";
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  // Build filter query
  const filters: Record<string, string> = {
    limit: PRODUCTS_PER_PAGE.toString(),
    offset: offset.toString(),
    order: sort,
  };

  if (params.category) filters.collection_id = params.category;
  if (params.min_price) filters.min_price = params.min_price;
  if (params.max_price) filters.max_price = params.max_price;

  const [products, totalProducts] = await Promise.all([
    getProducts(filters).catch(() => [] as MedusaProduct[]),
    getProductsCount(filters).catch(() => 0),
  ]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-text">
                All Products
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""}
              </p>
            </div>

            <Suspense>
              <SortDropdown />
            </Suspense>
          </div>

          {/* Products */}
          <Suspense fallback={<SkeletonGrid count={PRODUCTS_PER_PAGE} />}>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product: MedusaProduct) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={totalPages} />
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-text-muted text-lg">
                  No products found matching your filters.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
