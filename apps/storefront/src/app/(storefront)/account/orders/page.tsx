import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerForToken, getMedusaToken } from "@/lib/auth";
import { getOrders } from "@/lib/medusa/orders";
import { OrderHistory } from "@/components/account/order-history";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Your order history.",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const token = await getMedusaToken();
  const customer = token ? await getCustomerForToken(token) : null;
  // Missing or expired Medusa token — send them back through sign-in.
  if (!token || !customer) redirect("/login?callbackUrl=/account/orders");

  const orders = await getOrders(token).catch(() => []);

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <h1 className="text-brutal text-5xl md:text-6xl text-black mb-8">
        MY{" "}
        <span className="bg-accent px-3 inline-block border-[5px] border-black -rotate-1">
          ORDERS
        </span>
      </h1>
      <div className="max-w-3xl">
        <OrderHistory orders={orders} />
      </div>
    </div>
  );
}
