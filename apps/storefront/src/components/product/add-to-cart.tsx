"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Check, Zap } from "lucide-react";
import type { MedusaProduct } from "@ecommerce/types";

const LOW_STOCK_THRESHOLD = 5;

interface AddToCartButtonProps {
  product: MedusaProduct;
  variantId?: string;
}

export function AddToCartButton({ product, variantId }: AddToCartButtonProps) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const { addItem, loading } = useCart();
  const targetVariant = variantId
    ? product.variants?.find((v) => v.id === variantId)
    : product.variants?.[0];

  // Stock comes from Medusa with the product. Variants that don't track
  // inventory, or that allow backorders, are always purchasable.
  const tracksStock =
    !!targetVariant?.manage_inventory && !targetVariant.allow_backorder;
  const stock = targetVariant?.inventory_quantity ?? 0;
  const isOutOfStock = tracksStock && stock <= 0;
  const isLowStock = tracksStock && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  const handleAddToCart = async () => {
    if (!targetVariant || isOutOfStock || loading) return;

    try {
      await addItem(targetVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  // One click from product page to checkout.
  const handleBuyNow = async () => {
    if (!targetVariant || isOutOfStock || loading) return;
    setBuyingNow(true);
    try {
      await addItem(targetVariant.id, 1);
      router.push("/checkout");
    } catch (err) {
      console.error("Buy now failed:", err);
      setBuyingNow(false);
    }
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
      {isLowStock && (
        <Badge variant="warning" size="md" className="w-full justify-center">
          Only {stock} left — order soon!
        </Badge>
      )}

      <Button
        onClick={handleBuyNow}
        disabled={loading || !targetVariant}
        loading={buyingNow}
        size="lg"
        className="w-full"
      >
        <Zap className="w-5 h-5 mr-2" />
        Buy now
      </Button>

      <Button
        onClick={handleAddToCart}
        disabled={loading || !targetVariant}
        loading={loading && !buyingNow}
        variant="outline"
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
