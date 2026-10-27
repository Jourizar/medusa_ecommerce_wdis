import { Suspense } from "react";
import { SuccessClient } from "./success-client";

export const metadata = {
  title: "Order confirmed",
  description: "Thanks for your order.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-container mx-auto px-4 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-wider">
            Loading order…
          </p>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
