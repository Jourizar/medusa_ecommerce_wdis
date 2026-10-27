import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerForToken, getMedusaToken } from "@/lib/auth";
import { getOrders } from "@/lib/medusa/orders";
import { OrderHistory } from "@/components/account/order-history";
import { ProfileCard } from "@/components/account/profile-card";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your profile and orders.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const token = await getMedusaToken();
  const customer = token ? await getCustomerForToken(token) : null;
  // Missing or expired Medusa token — send them back through sign-in.
  if (!token || !customer) redirect("/login?callbackUrl=/account");

  const orders = await getOrders(token).catch(() => []);

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <h1 className="text-brutal text-5xl md:text-6xl text-black mb-8">
        MY{" "}
        <span className="bg-accent px-3 inline-block border-[5px] border-black -rotate-1">
          ACCOUNT
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside>
          <ProfileCard
            name={[customer.first_name, customer.last_name].filter(Boolean).join(" ")}
            email={customer.email}
          />
        </aside>
        <div className="lg:col-span-2">
          <OrderHistory orders={orders} />
        </div>
      </div>
    </div>
  );
}
