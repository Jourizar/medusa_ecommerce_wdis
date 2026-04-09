"use client";

import { useQuery } from "convex/react";
import { convex } from "@/lib/convex/api";

/**
 * Real-time inventory hook.
 * Returns stock level for a given product variant.
 * Automatically updates when Convex receives inventory sync events from Medusa.
 *
 * @param variantId - The Medusa variant ID to check stock for
 * @returns Object with stock info
 */
export function useInventory(variantId: string | null) {
  const stockData = useQuery(
    convex.inventory.getStockLevelByVariant,
    variantId ? { variantId } : "skip"
  );

  if (!variantId || stockData === undefined) {
    return {
      stock: undefined,
      isLowStock: false,
      isOutOfStock: false,
      isLoading: true,
    };
  }

  const quantity = stockData?.quantity ?? 0;
  const threshold = stockData?.lowStockThreshold ?? 5;

  return {
    stock: quantity,
    isLowStock: quantity > 0 && quantity <= threshold,
    isOutOfStock: quantity === 0,
    isLoading: false,
  };
}
