import { medusaFetch } from "./client";
import type { MedusaRegion } from "@ecommerce/types";

/**
 * Fetch available regions (for shipping and pricing).
 */
export async function getRegions(): Promise<MedusaRegion[]> {
  const data = await medusaFetch<{ regions: MedusaRegion[] }>("/regions");
  return data.regions;
}

/**
 * Fetch a single region by ID.
 */
export async function getRegion(id: string): Promise<MedusaRegion> {
  const data = await medusaFetch<{ region: MedusaRegion }>(`/regions/${id}`);
  return data.region;
}

let cachedDefaultRegionId: string | null = null;
export async function getDefaultRegionId(): Promise<string> {
  if (cachedDefaultRegionId) return cachedDefaultRegionId;
  const regions = await getRegions();
  const usd = regions.find((r) => r.currency_code === "usd") ?? regions[0];
  if (!usd) {
    throw new Error(
      "No regions configured in Medusa. Run the seed script or create a region in the admin."
    );
  }
  cachedDefaultRegionId = usd.id;
  return cachedDefaultRegionId;
}
