"use client";

import { useState } from "react";
import { ProductVariants } from "./product-variants";
import { AddToCartButton } from "./add-to-cart";
import type { MedusaProduct } from "@ecommerce/types";

interface PurchasePanelProps {
  product: MedusaProduct;
}

/**
 * Client-side bridge between the variant selector and the add-to-cart
 * button. Without this, the two render as unrelated siblings and
 * add-to-cart always falls back to the first variant.
 */
export function PurchasePanel({ product }: PurchasePanelProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    undefined
  );

  return (
    <>
      <ProductVariants product={product} onVariantChange={setSelectedVariantId} />
      <AddToCartButton product={product} variantId={selectedVariantId} />
    </>
  );
}
