"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format-price";

interface CartSummaryProps {
  total: number;
}

export function CartSummary({ total }: CartSummaryProps) {
  return (
    <div className="lg:col-span-1">
      <div className="glass rounded-2xl p-6 sticky top-24 space-y-6">
        <h2 className="text-xl font-display font-bold text-text">
          Order Summary
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span className="text-text">{formatPrice(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Shipping</span>
            <span className="text-text-muted">Calculated at checkout</span>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-text">Total</span>
              <span className="text-2xl font-display font-bold text-text">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>

        <Button
          variant="ghost"
          asChild
          className="w-full"
        >
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
