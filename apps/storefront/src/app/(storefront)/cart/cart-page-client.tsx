"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function CartPageClient() {
  const { items, total, loading } = useCart();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-48" />
          <div className="h-32 bg-surface rounded" />
          <div className="h-32 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-text-muted mb-4" />
        <h1 className="text-3xl font-display font-bold text-text mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-text-muted mb-8">
          Looks like you have not added anything to your cart yet.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-text mb-8">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary / Checkout CTA */}
        <CartSummary total={total} />
      </div>
    </div>
  );
}
