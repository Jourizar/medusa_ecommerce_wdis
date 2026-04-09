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
