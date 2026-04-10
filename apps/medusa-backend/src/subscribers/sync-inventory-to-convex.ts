import { SubscriberConfig, SubscriberArgs } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

/**
 * Subscriber: Sync inventory changes to Convex.
 * Listens to Medusa inventory events and pushes updates to Convex
 * for real-time stock level notifications to connected clients.
 */

interface InventorySyncInput {
  productId: string;
  variantId: string;
  quantity: number;
  locationId?: string;
}

async function syncInventoryToConvex(data: InventorySyncInput) {
  const convexUrl = process.env.CONVEX_URL;
  if (!convexUrl) return;

  try {
    // Use Convex HTTP mutation API via admin key
    const res = await fetch(`${convexUrl}/api/run/inventory/updateStock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Convex ${process.env.CONVEX_ADMIN_KEY}`,
      },
      body: JSON.stringify({
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
      }),
    });

    if (!res.ok) {
      console.error(
        `[InventorySync] Failed to sync to Convex: ${res.statusText}`
      );
    }
  } catch (error) {
    console.error("[InventorySync] Convex sync error:", error);
  }
}

export default async function inventoryUpdatedHandler({
  event,
  container,
}: SubscriberArgs<InventorySyncInput>) {
  const { productId, variantId, quantity } = event.data;

  console.log(
    `[InventorySync] Syncing inventory for variant ${variantId}: ${quantity}`
  );

  await syncInventoryToConvex({ productId, variantId, quantity });
}

export const config: SubscriberConfig = {
  event: "inventory-item.updated",
  context: {
    subscriberId: "inventory-sync-to-convex",
  },
};
