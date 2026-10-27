import { CartPageClient } from "./cart-page-client";

export const metadata = {
  title: "Your Cart",
  description: "Review your cart and proceed to checkout.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartPageClient />;
}
