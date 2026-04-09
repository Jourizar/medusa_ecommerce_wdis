import { Navbar } from "@/components/layout/navbar";
import { CheckoutFormClient } from "./checkout-form-client";

export const metadata = {
  title: "Checkout",
  description: "Complete your order.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 min-h-screen bg-bg">
        <CheckoutFormClient />
      </main>
    </>
  );
}
