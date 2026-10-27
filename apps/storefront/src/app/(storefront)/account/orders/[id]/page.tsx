import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getMedusaToken } from "@/lib/auth";
import { getOrder } from "@/lib/medusa/orders";
import { OrderDetails } from "@/components/account/order-details";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const token = await getMedusaToken();
  if (!token) redirect(`/login?callbackUrl=/account/orders/${id}`);

  const order = await getOrder(id, token).catch(() => null);
  if (!order) notFound();

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <OrderDetails order={order} />
    </div>
  );
}
