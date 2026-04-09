import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartPageClient } from "./cart-page-client";

export const metadata = {
  title: "Your Cart",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen">
        <CartPageClient />
      </main>
      <Footer />
    </>
  );
}
