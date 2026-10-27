import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/medusa/products";
import { absoluteUrl } from "@/lib/site";

// Rebuild the sitemap hourly so new products get discovered quickly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ limit: "1000" }).catch(() => []);

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/art"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/art/all"), changeFrequency: "weekly", priority: 0.6 },
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.handle}`),
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
