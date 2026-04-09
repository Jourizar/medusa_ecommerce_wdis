import { notFound } from "next/navigation";
import { getOrder } from "@/lib/medusa/orders";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OrderDetails } from "@/components/account/order-details";
import type { MedusaOrder } from "@ecommerce/types";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 8)}`,
    description: `View details for order ${id.slice(0, 8)}.`,
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order: MedusaOrder | null = await getOrder(id).catch(() => null);

  if (!order) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <OrderDetails order={order} />
        </div>
      </main>
      <Footer />
    </>
  );
}
