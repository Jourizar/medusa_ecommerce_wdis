import { medusaFetch } from "./client";
import type { MedusaOrder } from "@ecommerce/types";

interface OrderResponse {
  order: MedusaOrder;
}

interface OrdersResponse {
  orders: MedusaOrder[];
  count: number;
  offset: number;
  limit: number;
}

const ORDER_FIELDS = "*items,*shipping_address,*shipping_methods,+item_subtotal";

/**
 * Fetch an order by ID. Pass the customer token when viewing from the
 * account area so Medusa scopes the lookup to that customer.
 */
export async function getOrder(id: string, token?: string): Promise<MedusaOrder> {
  const data = await medusaFetch<OrderResponse>(
    `/orders/${id}?fields=${encodeURIComponent(ORDER_FIELDS)}`,
    { token, revalidate: 0 }
  );
  return data.order;
}

/**
 * Fetch the authenticated customer's orders, newest first.
 * Medusa's store API scopes orders to the logged-in customer.
 */
export async function getOrders(token: string): Promise<MedusaOrder[]> {
  const data = await medusaFetch<OrdersResponse>(
    `/orders?order=-created_at&limit=50&fields=${encodeURIComponent("*items")}`,
    { token, revalidate: 0 }
  );
  return data.orders;
}

/** "partially_shipped" → "Partially shipped" */
export function formatStatus(status: string | null | undefined): string {
  if (!status) return "";
  const text = status.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
