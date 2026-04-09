"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useInventory } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Check } from "lucide-react";
import type { MedusaProduct } from "@ecommerce/types";

interface AddToCartButtonProps {
  product: MedusaProduct;
  variantId?: string;
}

export function AddToCartButton({ product, variantId }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { addItem, loading } = useCart();
  const targetVariant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : product.variants[0];

  const { isOutOfStock, isLowStock, stock, isLoading: inventoryLoading } =
    useInventory(targetVariant?.id ?? null);

  const handleAddToCart = async () => {
    if (!targetVariant || isOutOfStock || loading) return;

    await addItem(targetVariant.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isOutOfStock) {
    return (
      <div className="space-y-3">
        <Badge variant="danger" size="md" className="w-full justify-center">
          Out of Stock
        </Badge>
        <Button disabled size="lg" className="w-full">
          Unavailable
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLowStock && !inventoryLoading && (
        <Badge variant="warning" size="md" className="w-full justify-center">
          Only {stock} left — order soon!
        </Badge>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={loading || !targetVariant}
        loading={loading}
        size="lg"
        className="w-full"
      >
        {added ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
