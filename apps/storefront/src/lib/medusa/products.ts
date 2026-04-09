import { medusaFetch } from "./client";
import type {
  MedusaProduct,
  MedusaProductListResponse,
  MedusaProductDetailResponse,
} from "@ecommerce/types";

/**
 * Fetch a list of products with optional filtering, sorting, and pagination.
 *
 * @param params - Query parameters
 * @param params.limit - Number of products to return (default 50)
 * @param params.offset - Pagination offset
 * @param params.order - Sort order (e.g., "-created_at", "title", "-price")
 * @param params.collection_id - Filter by collection
 * @param params.category_id - Filter by category
 * @param params.min_price - Minimum price (in cents)
 * @param params.max_price - Maximum price (in cents)
 * @param params.region_id - Region for pricing
 * @returns Array of MedusaProduct
 */
export async function getProducts(
  params: Record<string, string> = {}
): Promise<MedusaProduct[]> {
  const query = new URLSearchParams({
    limit: "50",
    offset: "0",
    ...params,
  });

  const data = await medusaFetch<MedusaProductListResponse>(
    `/products?${query}`
  );

  return data.products;
}

/**
 * Get total product count (for pagination).
 */
export async function getProductsCount(
  params: Record<string, string> = {}
): Promise<number> {
  const query = new URLSearchParams({ limit: "1", ...params });
  const data = await medusaFetch<MedusaProductListResponse>(
    `/products?${query}`
  );
  return data.count;
}

/**
 * Fetch a single product by handle.
 */
export async function getProductByHandle(
  handle: string
): Promise<MedusaProduct> {
  const data = await medusaFetch<MedusaProductListResponse>(
    `/products?handle=${encodeURIComponent(handle)}&expand=images,variants,variants.prices,options,options.values`
  );

  if (data.products.length === 0) {
    throw new Error(`Product not found: ${handle}`);
  }

  return data.products[0];
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(id: string): Promise<MedusaProduct> {
  const data = await medusaFetch<MedusaProductDetailResponse>(
    `/products/${id}?expand=images,variants,variants.prices,options,options.values`
  );

  return data.product;
}

/**
 * Fetch featured products (e.g., newest or by collection).
 */
export async function getFeaturedProducts(
  limit = 8
): Promise<MedusaProduct[]> {
  return getProducts({
    limit: limit.toString(),
    order: "-created_at",
  });
}
