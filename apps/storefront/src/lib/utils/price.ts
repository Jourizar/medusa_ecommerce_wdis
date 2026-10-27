import type { MedusaProduct } from "@ecommerce/types";

/**
 * Price helpers for Medusa v2 products.
 * `calculated_price.calculated_amount` is only present when the product was
 * fetched with `*variants.calculated_price` and a region_id, so both helpers
 * tolerate missing data and return null.
 */

type Variants = MedusaProduct["variants"];

function calculatedAmount(variant: unknown): number | null {
  const amount = (variant as { calculated_price?: { calculated_amount?: unknown } })
    ?.calculated_price?.calculated_amount;
  return typeof amount === "number" ? amount : null;
}

export function getLowestPrice(variants: Variants): number | null {
  let lowest = Infinity;
  for (const v of variants ?? []) {
    const amount = calculatedAmount(v);
    if (amount !== null && amount < lowest) lowest = amount;
  }
  return lowest === Infinity ? null : lowest;
}

export function getHighestPrice(variants: Variants): number | null {
  let highest = -Infinity;
  for (const v of variants ?? []) {
    const amount = calculatedAmount(v);
    if (amount !== null && amount > highest) highest = amount;
  }
  return highest === -Infinity ? null : highest;
}

/** Lowest-priced variant, for defaulting add-to-cart. */
export function getCheapestVariant(variants: Variants): {
  variantId: string | null;
  amount: number | null;
} {
  let best: { variantId: string | null; amount: number } = {
    variantId: null,
    amount: Infinity,
  };
  for (const v of variants ?? []) {
    const amount = calculatedAmount(v);
    if (amount !== null && amount < best.amount) {
      best = { variantId: v.id, amount };
    }
  }
  if (best.variantId === null) {
    // No priced variants — fall back to the first one so add-to-cart still works.
    const first = variants?.[0];
    return { variantId: first?.id ?? null, amount: null };
  }
  return { variantId: best.variantId, amount: best.amount };
}
