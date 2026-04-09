"use client";

import { ReactNode, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { initializeCart } = useCart();

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  return <>{children}</>;
}
