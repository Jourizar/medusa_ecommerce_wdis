import Link from "next/link";
import { formatPrice } from "@/lib/utils/format-price";
import { formatStatus } from "@/lib/medusa/orders";
import type { MedusaOrder } from "@ecommerce/types";

export function OrderDetails({ order }: { order: MedusaOrder }) {
  const currency = order.currency_code;
  const address = order.shipping_address;

  return (
    <div className="space-y-6">
      <Link
        href="/account"
        className="text-xs font-black uppercase tracking-widest underline decoration-4 underline-offset-4"
      >
        ← Back to account
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-brutal text-4xl md:text-5xl">Order #{order.display_id}</h1>
          <p className="text-xs font-bold uppercase tracking-wider mt-2">
            Placed {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StatusChip label={formatStatus(order.fulfillment_status)} done={order.fulfillment_status === "fulfilled" || order.fulfillment_status === "shipped"} />
          <StatusChip label={`Payment ${formatStatus(order.payment_status).toLowerCase()}`} done={order.payment_status === "captured"} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6">
          <h2 className="text-brutal text-2xl mb-4">Items</h2>
          <div className="divide-y-[3px] divide-black">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-4 min-w-0">
                  {item.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.product_title ?? ""}
                      className="w-16 h-16 object-cover border-[3px] border-black bg-white"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-black uppercase tracking-wider text-sm truncate">
                      {item.product_title}
                    </p>
                    {item.variant_title && (
                      <p className="text-xs font-bold uppercase">{item.variant_title}</p>
                    )}
                    <p className="text-xs font-bold uppercase">Qty {item.quantity}</p>
                  </div>
                </div>
                <span className="font-black whitespace-nowrap">
                  {formatPrice(item.unit_price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#77269A] p-6 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order.item_subtotal, currency)} />
            <Row label="Shipping" value={formatPrice(order.shipping_total || 0, currency)} />
            <Row label="Tax" value={formatPrice(order.tax_total, currency)} />
            <div className="border-t-[3px] border-black pt-3 flex justify-between items-baseline">
              <span className="text-brutal text-xl">Total</span>
              <span className="text-brutal text-2xl">{formatPrice(order.total, currency)}</span>
            </div>
          </div>

          {address && (
            <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6">
              <h2 className="text-brutal text-xl mb-2">Ships to</h2>
              <address className="not-italic text-sm font-bold">
                {address.first_name} {address.last_name}
                <br />
                {address.address_1}
                {address.address_2 && (
                  <>
                    <br />
                    {address.address_2}
                  </>
                )}
                <br />
                {address.city}
                {address.province ? `, ${address.province.toUpperCase()}` : ""} {address.postal_code}
                <br />
                {address.country_code?.toUpperCase()}
              </address>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`px-3 py-1 text-xs font-black uppercase tracking-widest border-[3px] border-black ${
        done ? "bg-accent" : "bg-white"
      }`}
    >
      {label}
    </span>
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
