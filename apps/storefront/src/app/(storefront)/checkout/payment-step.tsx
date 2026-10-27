"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { completeCart } from "@/lib/medusa/cart";

// Only show the test-card hint with test keys — never to real customers.
const IS_STRIPE_TEST_MODE =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_") ?? false;

/**
 * Payment step — renders Stripe's Payment Element inside the parent's
 * <Elements> provider (which was configured with the payment session's
 * client_secret).
 */
export function PaymentStep({
  cartId,
  onBack,
  onSuccess,
}: {
  cartId: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setBusy(false);
      return;
    }

    // Confirm the PaymentIntent without redirecting — we complete the cart ourselves.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setBusy(false);
      return;
    }

    if (
      paymentIntent?.status !== "succeeded" &&
      paymentIntent?.status !== "requires_capture"
    ) {
      setError(`Payment did not complete (status: ${paymentIntent?.status})`);
      setBusy(false);
      return;
    }

    try {
      const result = await completeCart(cartId);
      if (result.type === "order") {
        onSuccess(result.order.id);
      } else {
        setError("Order could not be finalized — please contact support.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6 space-y-4">
      <h2 className="text-brutal text-2xl">Payment</h2>
      <div className="border-[3px] border-black bg-white p-4">
        <PaymentElement />
      </div>

      {IS_STRIPE_TEST_MODE && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Test card: 4242 4242 4242 4242 · Any future date · Any CVC · Any ZIP
        </p>
      )}

      {error && (
        <div className="bg-hotpink border-[4px] border-black p-3 shadow-[4px_4px_0_0_#000] text-sm font-bold uppercase tracking-wide">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="font-black uppercase tracking-widest border-[3px] border-black bg-white text-black px-6 py-4 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={pay}
          disabled={!stripe || busy}
          className="flex-1 font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Processing…" : "Pay now"}
        </button>
      </div>
    </div>
  );
}
