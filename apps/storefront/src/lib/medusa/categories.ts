import { medusaFetch } from "./client";
import { ART_CATEGORY_HANDLE } from "@/lib/constants";

export type ProductCategory = {
  id: string;
  name: string;
  handle: string;
};

export async function getStoreCategories(): Promise<ProductCategory[]> {
  const data = await medusaFetch<{
    product_categories: ProductCategory[];
  }>(`/product-categories?fields=id,name,handle&limit=100`).catch(() => ({
    product_categories: [],
  }));
  // Hide the internal "art" category from the shop sidebar — it has its own page.
  return data.product_categories.filter(
    (c) => c.handle !== ART_CATEGORY_HANDLE
  );
}
