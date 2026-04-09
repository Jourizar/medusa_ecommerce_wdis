import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format-price";
import type { MedusaOrder } from "@ecommerce/types";

interface OrderDetailsProps {
  order: MedusaOrder;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/account">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">
            Order #{order.display_id}
          </h1>
          <p className="text-text-muted mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge
            variant={
              order.fulfillment_status === "fulfilled"
                ? "success"
                : "warning"
            }
          >
            {order.fulfillment_status_label}
          </Badge>
          <Badge
            variant={
              order.payment_status === "captured" ? "success" : "default"
            }
          >
            {order.payment_status_label}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-display font-bold text-text mb-4">
          Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-4">
                {item.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt={item.product_title}
                    className="w-16 h-16 rounded-lg object-cover bg-surface"
                  />
                )}
                <div>
                  <p className="font-medium text-text">
                    {item.product_title}
                  </p>
                  {item.variant_title && (
                    <p className="text-sm text-text-muted">
                      {item.variant_title}
                    </p>
                  )}
                  <p className="text-sm text-text-muted">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-display font-bold text-text">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span className="text-text">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Shipping</span>
          <span className="text-text">{formatPrice(order.shipping_total || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Tax</span>
          <span className="text-text">{formatPrice(order.tax_total)}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-medium text-text">Total</span>
          <span className="text-2xl font-display font-bold text-text">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-display font-bold text-text mb-3">
            Shipping Address
          </h2>
          <address className="not-italic text-text-muted">
            {order.shipping_address.first_name}{" "}
            {order.shipping_address.last_name}
            <br />
            {order.shipping_address.address_1}
            {order.shipping_address.address_2 && (
              <>
                <br />
                {order.shipping_address.address_2}
              </>
            )}
            <br />
            {order.shipping_address.city},{" "}
            {order.shipping_address.postal_code}
            <br />
            {order.shipping_address.country_code.toUpperCase()}
          </address>
        </div>
      )}
    </div>
  );
}
