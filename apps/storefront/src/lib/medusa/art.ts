import { medusaFetch } from "./client";
import { getDefaultRegionId } from "./regions";
import { ART_CATEGORY_HANDLE } from "@/lib/constants";
import type { MedusaProduct, MedusaProductListResponse } from "@ecommerce/types";

const ART_FIELDS =
  "*variants.calculated_price,*images,*options,*options.values,+thumbnail,+handle,+description,+metadata";

let cachedArtCategoryId: string | null = null;
async function getArtCategoryId(): Promise<string | null> {
  if (cachedArtCategoryId) return cachedArtCategoryId;
  const data = await medusaFetch<{
    product_categories: { id: string; handle: string }[];
  }>(`/product-categories?handle=${ART_CATEGORY_HANDLE}`).catch(() => ({
    product_categories: [],
  }));
  if (!data.product_categories?.length) return null;
  cachedArtCategoryId = data.product_categories[0].id;
  return cachedArtCategoryId;
}

export async function getArtProducts(): Promise<MedusaProduct[]> {
  const [region_id, categoryId] = await Promise.all([
    getDefaultRegionId(),
    getArtCategoryId(),
  ]);
  if (!categoryId) return [];

  const query = new URLSearchParams({
    limit: "100",
    region_id,
    fields: ART_FIELDS,
  });
  query.append("category_id[]", categoryId);

  const data = await medusaFetch<MedusaProductListResponse>(
    `/products?${query}`
  );
  return data.products;
}

export function readArtBento(product: MedusaProduct) {
  const m = (product.metadata ?? {}) as Record<string, any>;
  return {
    col: Math.max(1, Math.min(4, Number(m.art_col) || 1)),
    row: Math.max(1, Math.min(3, Number(m.art_row) || 1)),
    featured: Boolean(m.art_featured),
  };
}
