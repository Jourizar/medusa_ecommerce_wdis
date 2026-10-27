"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { ShoppingBag } from "lucide-react";

export function CartPageClient() {
  const { items, total, loading } = useCart();

  if (loading) {
    return (
      <div className="max-w-container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-bg-alt border-[3px] border-black w-48" />
          <div className="h-32 bg-bg-alt border-[3px] border-black" />
          <div className="h-32 bg-bg-alt border-[3px] border-black" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto bg-cream border-[5px] border-black shadow-[10px_10px_0_0_#77269A] p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-hotpink border-[4px] border-black mb-6 -rotate-3">
            <ShoppingBag className="w-10 h-10 text-black" strokeWidth={3} />
          </div>
          <h1 className="text-brutal text-4xl md:text-5xl text-black mb-4">
            CART IS EMPTY.
          </h1>
          <p className="text-sm font-bold uppercase tracking-wider text-muted mb-8">
            Time to find something fresh.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-8 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <h1 className="text-brutal text-5xl md:text-7xl text-black mb-10">
        YOUR{" "}
        <span className="bg-accent text-black px-3 inline-block border-[5px] border-black -rotate-1">
          CART
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </div>

        <CartSummary total={total} />
      </div>
    </div>
  );
}
