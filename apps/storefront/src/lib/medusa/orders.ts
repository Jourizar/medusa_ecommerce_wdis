import { medusaFetch } from "./client";
import type { MedusaOrder, MedusaRegion } from "@ecommerce/types";

interface OrderResponse {
  order: MedusaOrder;
}

interface OrdersResponse {
  orders: MedusaOrder[];
  count: number;
  offset: number;
  limit: number;
}

/**
 * Fetch an order by ID.
 */
export async function getOrder(id: string): Promise<MedusaOrder> {
  const data = await medusaFetch<OrderResponse>(`/orders/${id}`);
  return data.order;
}

/**
 * Fetch orders by email (customer order lookup).
 */
export async function getOrdersByEmail(
  email: string
): Promise<MedusaOrder[]> {
  const data = await medusaFetch<OrdersResponse>(`/orders?email=${encodeURIComponent(email)}`);
  return data.orders;
}

/**
 * Fetch available regions.
 */
export async function getRegions(): Promise<MedusaRegion[]> {
  const data = await medusaFetch<{ regions: MedusaRegion[] }>("/regions");
  return data.regions;
}
