"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrder } from "@/lib/medusa/orders";
import { completeCart } from "@/lib/medusa/cart";
import { SummaryLineItem } from "@/components/cart/summary-line-item";
import { useCart } from "@/hooks/use-cart";
import type { MedusaOrder } from "@ecommerce/types";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function readCartId(): string | null {
  const row = document.cookie.split("; ").find((r) => r.startsWith("cart_id="));
  return row ? row.split("=")[1] : null;
}

export function SuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const redirectStatus = params.get("redirect_status");
  const [orderId, setOrderId] = useState(params.get("order_id"));
  const [order, setOrder] = useState<MedusaOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(
    !params.get("order_id") && redirectStatus === "succeeded"
  );

  // Redirect-based payment methods (bank redirects, some wallets) return here
  // with ?payment_intent=…&redirect_status=… and no order yet — finish it.
  useEffect(() => {
    if (!completing) return;
    const cartId = readCartId();
    if (!cartId) {
      setError("We couldn't find your cart — if you were charged, please contact support.");
      setCompleting(false);
      return;
    }
    completeCart(cartId)
      .then((result) => {
        if (result.type !== "order") throw new Error("Order could not be finalized — please contact support.");
        setOrderId(result.order.id);
        router.replace(`/checkout/success?order_id=${result.order.id}`);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to finalize order"))
      .finally(() => setCompleting(false));
  }, [completing, router]);

  // Clear the cart only once there is an order, so a failed payment keeps it.
  useEffect(() => {
    if (!orderId) return;
    document.cookie = "cart_id=; path=/; max-age=0";
    useCart.getState().clearCart();
    getOrder(orderId)
      .then(setOrder)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load order")
      );
  }, [orderId]);

  if (!orderId) {
    const message = completing
      ? "Finalizing your order…"
      : error ??
        (redirectStatus && redirectStatus !== "succeeded"
          ? "Payment was not completed. Your cart has been kept."
          : "Missing order id.");
    return (
      <div className="max-w-container mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-bold uppercase tracking-wider">{message}</p>
        {!completing && redirectStatus && (
          <Link
            href="/checkout"
            className="inline-flex text-xs font-black uppercase tracking-widest border-[3px] border-black bg-hotpink px-4 py-2 hover:bg-accent transition-colors"
          >
            Back to checkout
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-cream border-[6px] border-black shadow-[10px_10px_0_0_#77269A] p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent border-[4px] border-black -rotate-3 mb-4">
            <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={3} />
          </div>
          <h1 className="text-brutal text-4xl md:text-5xl">
            ORDER{" "}
            <span className="bg-hotpink text-black px-2 border-[4px] border-black inline-block -rotate-1">
              CONFIRMED
            </span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-wider mt-3 text-muted">
            A receipt is on its way to your inbox.
          </p>
        </div>

        {error && (
          <div className="bg-hotpink border-[4px] border-black p-4 shadow-[4px_4px_0_0_#000] text-sm font-bold uppercase tracking-wide mb-4">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-4 border-t-[3px] border-black pt-4">
            <div className="flex justify-between">
              <span className="font-bold uppercase tracking-wider text-xs">
                Order number
              </span>
              <span className="font-black">#{order.display_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold uppercase tracking-wider text-xs">
                Email
              </span>
              <span className="font-black">{order.email}</span>
            </div>

            <div className="border-t-[3px] border-black pt-5 space-y-4 max-h-80 overflow-auto pr-2">
              {order.items.map((item) => (
                <SummaryLineItem
                  key={item.id}
                  thumbnail={item.thumbnail}
                  title={item.product_title}
                  variantTitle={item.variant_title}
                  quantity={item.quantity}
                  price={money(item.unit_price * item.quantity, order.currency_code)}
                />
              ))}
            </div>

            <div className="border-t-[3px] border-black pt-3 space-y-1 text-sm">
              <Row
                label="Subtotal"
                value={money(order.item_subtotal, order.currency_code)}
              />
              <Row
                label="Shipping"
                value={money(order.shipping_total, order.currency_code)}
              />
              <Row
                label="Tax"
                value={money(order.tax_total, order.currency_code)}
              />
            </div>

            <div className="border-t-[3px] border-black pt-3 flex justify-between items-baseline">
              <span className="text-brutal text-xl">Total paid</span>
              <span className="text-brutal text-2xl">
                {money(order.total, order.currency_code)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 inline-flex items-center justify-center font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100"
          >
            Keep shopping
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center font-black uppercase tracking-widest border-[3px] border-black bg-white text-black px-6 py-4 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-bold uppercase tracking-wider text-xs">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}
