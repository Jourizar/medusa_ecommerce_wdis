"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartLineItem } from "./cart-line-item";
import { formatPrice } from "@/lib/utils/format-price";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ctaPrimary =
  "inline-flex items-center justify-center w-full font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-3 text-sm shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100";

const ctaSecondary =
  "inline-flex items-center justify-center w-full font-black uppercase tracking-widest border-[3px] border-black bg-cream text-black px-6 py-3 text-sm shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 active:shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100";

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-cream border-l-[6px] border-black flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary text-white border-b-[4px] border-black">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" strokeWidth={3} />
                <h2 className="text-lg font-black uppercase tracking-widest">
                  Cart ({itemCount})
                </h2>
              </div>
              <button
                aria-label="Close cart"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 inline-flex items-center justify-center border-[3px] border-black bg-hotpink text-black hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto bg-bg-alt px-4 py-5">
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartLineItem key={item.id} item={item} compact />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-cream border-[4px] border-black mb-4">
                    <ShoppingBag className="w-10 h-10 text-black" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-black">
                    Your cart is empty
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t-[4px] border-black bg-cream px-5 py-4 space-y-3">
                <div className="flex items-center justify-between bg-accent border-[3px] border-black px-3 py-2">
                  <span className="text-xs font-black uppercase tracking-widest text-black">
                    Subtotal
                  </span>
                  <span className="text-xl font-black text-black">
                    {formatPrice(total)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => onOpenChange(false)}
                  className={ctaPrimary}
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={() => onOpenChange(false)}
                  className={ctaSecondary}
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
