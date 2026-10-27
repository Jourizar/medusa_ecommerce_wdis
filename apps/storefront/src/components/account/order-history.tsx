import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { formatStatus } from "@/lib/medusa/orders";
import type { MedusaOrder } from "@ecommerce/types";

export function OrderHistory({ orders }: { orders: MedusaOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wider">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex text-xs font-black uppercase tracking-widest border-[3px] border-black bg-hotpink px-4 py-2 hover:bg-accent transition-colors"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-brutal text-2xl">Order history</h2>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex items-center justify-between gap-4 bg-cream border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-[transform,box-shadow] duration-100"
        >
          <div>
            <p className="font-black uppercase tracking-widest text-sm">
              Order #{order.display_id}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {new Date(order.created_at).toLocaleDateString()} ·{" "}
              {order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black">{formatPrice(order.total, order.currency_code)}</p>
            <p className="text-xs font-bold uppercase tracking-wider">
              {formatStatus(order.fulfillment_status)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
