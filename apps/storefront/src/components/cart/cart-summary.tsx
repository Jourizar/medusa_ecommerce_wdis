"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";

interface CartSummaryProps {
  total: number;
}

export function CartSummary({ total }: CartSummaryProps) {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24 bg-cream border-[4px] border-black shadow-[8px_8px_0_0_#77269A] p-6 space-y-5">
        <h2 className="text-2xl font-black uppercase tracking-tight text-black border-b-[3px] border-black pb-3">
          Order Summary
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-muted">
              Subtotal
            </span>
            <span className="font-black text-black">{formatPrice(total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-muted">
              Shipping
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              At checkout
            </span>
          </div>

          <div className="border-t-[3px] border-black pt-3 mt-3">
            <div className="flex items-center justify-between bg-accent border-[3px] border-black px-3 py-2">
              <span className="text-sm font-black uppercase tracking-widest text-black">
                Total
              </span>
              <span className="text-2xl font-black text-black">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/checkout"
          className="inline-flex items-center justify-center w-full font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100"
        >
          Proceed to Checkout →
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center justify-center w-full font-black uppercase tracking-widest border-[3px] border-black bg-cream text-black px-6 py-3 hover:bg-accent transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
