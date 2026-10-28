"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "@/hooks/use-cart";
import {
  createPaymentCollection,
  getCart,
  initPaymentSession,
  listShippingOptions,
  setShippingMethod,
  updateCart,
  type CheckoutAddress,
  type ShippingOption,
  type StripePaymentSession,
} from "@/lib/medusa/cart";
import type { MedusaCart } from "@ecommerce/types";
import { PaymentStep } from "./payment-step";
import { SummaryLineItem } from "@/components/cart/summary-line-item";
import { getRegionsForCountry } from "./regions-data";

const STRIPE_PROVIDER_ID = "pp_stripe_stripe";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

type Step = "address" | "shipping" | "payment";

const emptyAddress: CheckoutAddress = {
  first_name: "",
  last_name: "",
  phone: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  country_code: "us",
  province: "",
  postal_code: "",
};

/** Keep only the address fields the cart accepts. */
function pickAddress(a: Partial<CheckoutAddress>): Partial<CheckoutAddress> {
  const out: Partial<CheckoutAddress> = {};
  for (const key of Object.keys(emptyAddress) as (keyof CheckoutAddress)[]) {
    const v = a[key];
    if (typeof v === "string") out[key] = v as never;
  }
  return out;
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function CheckoutClient() {
  const router = useRouter();
  const { cartId, items, itemCount, initializeCart } = useCart();

  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [step, setStep] = useState<Step>("address");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [paymentSession, setPaymentSession] =
    useState<StripePaymentSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure cart exists
  useEffect(() => {
    if (!cartId) initializeCart();
  }, [cartId, initializeCart]);

  // Load cart details whenever the ID changes
  useEffect(() => {
    if (!cartId) return;
    getCart(cartId).then(setCart).catch(() => setCart(null));
  }, [cartId]);

  // Signed-in customers: prefill email + last shipping address. Guests get
  // a 204 and keep the empty form.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    fetch("/api/account")
      .then((res) => (res.status === 200 ? res.json() : null))
      .then((profile) => {
        if (!profile) return;
        setSignedIn(true);
        setEmail((cur) => cur || profile.email);
        if (profile.address) {
          setAddress((cur) =>
            cur.address_1 ? cur : { ...emptyAddress, ...pickAddress(profile.address) }
          );
        } else {
          setAddress((cur) => ({
            ...cur,
            first_name: cur.first_name || profile.first_name || "",
            last_name: cur.last_name || profile.last_name || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const currency = cart?.currency_code ?? "usd";

  // Redirect if the cart is empty (unless we've just completed and cleared it)
  useEffect(() => {
    if (cart && cart.items.length === 0 && itemCount === 0) {
      router.replace("/cart");
    }
  }, [cart, itemCount, router]);

  const canSubmitAddress = useMemo(() => {
    return (
      email.trim() !== "" &&
      address.first_name.trim() !== "" &&
      address.last_name.trim() !== "" &&
      address.address_1.trim() !== "" &&
      address.city.trim() !== "" &&
      address.postal_code.trim() !== "" &&
      address.country_code.trim() !== ""
    );
  }, [email, address]);

  async function submitAddress() {
    if (!cartId || !canSubmitAddress) return;
    setBusy(true);
    setError(null);
    try {
      // Link the cart to the customer so the order lands in their history.
      if (signedIn) {
        await fetch("/api/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartId }),
        }).catch(() => {});
      }

      const updated = await updateCart(cartId, {
        email,
        shipping_address: address,
        billing_address: address,
      });
      setCart(updated);

      const options = await listShippingOptions(cartId);
      setShippingOptions(options);
      if (options.length > 0) setSelectedShippingId(options[0].id);

      // Only one way to ship? Don't make the customer click through it.
      if (options.length === 1) {
        await preparePayment(options[0].id);
      } else {
        setStep("shipping");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save address");
    } finally {
      setBusy(false);
    }
  }

  async function preparePayment(shippingOptionId: string) {
    if (!cartId) return;
    const updated = await setShippingMethod(cartId, shippingOptionId);
    setCart(updated);

    const collection = await createPaymentCollection(cartId);
    const session = await initPaymentSession(collection.id, STRIPE_PROVIDER_ID);
    setPaymentSession(session);

    setStep("payment");
  }

  async function submitShipping() {
    if (!cartId || !selectedShippingId) return;
    setBusy(true);
    setError(null);
    try {
      await preparePayment(selectedShippingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to set shipping");
    } finally {
      setBusy(false);
    }
  }

  if (!stripePromise) {
    return (
      <div className="max-w-container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-cream border-[6px] border-black shadow-[10px_10px_0_0_#77269A] p-10 text-center">
          <h1 className="text-brutal text-5xl mb-6">CHECKOUT</h1>
          <p className="text-sm font-bold uppercase tracking-wider">
            Payment is not configured. Set{" "}
            <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in{" "}
            <code>.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!cart || !cartId) {
    return (
      <div className="max-w-container mx-auto px-4 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-wider">
          Loading cart…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-brutal text-5xl md:text-6xl text-black">
          CHECK
          <span className="bg-accent text-black px-3 inline-block border-[5px] border-black -rotate-1">
            OUT
          </span>
        </h1>
        <Link
          href="/cart"
          className="text-xs font-black uppercase tracking-widest underline decoration-4 underline-offset-4"
        >
          ← Back to cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Stepper current={step} skipShipping={shippingOptions.length === 1} />

          {step === "address" && (
            <AddressStep
              email={email}
              setEmail={setEmail}
              address={address}
              setAddress={setAddress}
              busy={busy}
              canSubmit={canSubmitAddress}
              onSubmit={submitAddress}
            />
          )}

          {step === "shipping" && (
            <ShippingStep
              options={shippingOptions}
              selectedId={selectedShippingId}
              setSelectedId={setSelectedShippingId}
              currency={currency}
              busy={busy}
              onBack={() => setStep("address")}
              onSubmit={submitShipping}
            />
          )}

          {step === "payment" && paymentSession?.data.client_secret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentSession.data.client_secret,
                appearance: {
                  theme: "flat",
                  variables: {
                    colorPrimary: "#000000",
                    borderRadius: "0px",
                    fontFamily: "system-ui, sans-serif",
                  },
                },
              }}
            >
              <PaymentStep
                cartId={cartId}
                onBack={() =>
                  setStep(shippingOptions.length === 1 ? "address" : "shipping")
                }
                onSuccess={(orderId) => {
                  // The success page clears the cart. Clearing it here makes
                  // this page spin up a new empty cart and bounce to /cart
                  // before the navigation lands.
                  router.push(`/checkout/success?order_id=${orderId}`);
                }}
              />
            </Elements>
          )}

          {error && (
            <div className="bg-hotpink border-[4px] border-black p-4 shadow-[4px_4px_0_0_#000] text-sm font-bold uppercase tracking-wide">
              {error}
            </div>
          )}
        </div>

        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}

function Stepper({
  current,
  skipShipping,
}: {
  current: Step;
  skipShipping: boolean;
}) {
  const steps: { id: Step; label: string }[] = skipShipping
    ? [
        { id: "address", label: "1. Address" },
        { id: "payment", label: "2. Payment" },
      ]
    : [
        { id: "address", label: "1. Address" },
        { id: "shipping", label: "2. Shipping" },
        { id: "payment", label: "3. Payment" },
      ];
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex gap-2 flex-wrap">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div
            key={s.id}
            className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-[3px] border-black ${
              active
                ? "bg-primary text-white shadow-[3px_3px_0_0_#000]"
                : done
                ? "bg-accent text-black"
                : "bg-cream text-black"
            }`}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

function AddressStep({
  email,
  setEmail,
  address,
  setAddress,
  busy,
  canSubmit,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  address: CheckoutAddress;
  setAddress: (a: CheckoutAddress) => void;
  busy: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const set = <K extends keyof CheckoutAddress>(k: K, v: CheckoutAddress[K]) =>
    setAddress({ ...address, [k]: v });

  return (
    <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6 space-y-4">
      <h2 className="text-brutal text-2xl">Contact & Shipping</h2>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className={brutalInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="First name">
          <input
            value={address.first_name}
            autoComplete="shipping given-name"
            onChange={(e) => set("first_name", e.target.value)}
            className={brutalInput}
          />
        </Field>
        <Field label="Last name">
          <input
            value={address.last_name}
            autoComplete="shipping family-name"
            onChange={(e) => set("last_name", e.target.value)}
            className={brutalInput}
          />
        </Field>
      </div>

      <Field label="Address line 1">
        <input
          value={address.address_1}
          autoComplete="shipping address-line1"
          onChange={(e) => set("address_1", e.target.value)}
          className={brutalInput}
        />
      </Field>
      <Field label="Address line 2 (optional)">
        <input
          value={address.address_2 ?? ""}
          autoComplete="shipping address-line2"
          onChange={(e) => set("address_2", e.target.value)}
          className={brutalInput}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City">
          <input
            value={address.city}
            autoComplete="shipping address-level2"
            onChange={(e) => set("city", e.target.value)}
            className={brutalInput}
          />
        </Field>
        <Field label={address.country_code === "ca" ? "Province" : "State"}>
          <select
            value={address.province ?? ""}
            autoComplete="shipping address-level1"
            onChange={(e) => set("province", e.target.value)}
            className={brutalInput}
          >
            <option value="">Select…</option>
            {getRegionsForCountry(address.country_code).map((r) => (
              // ISO 3166-2 ("us-in"): what Medusa tax regions and pickup zones match on.
              <option key={r.code} value={`${address.country_code}-${r.code}`.toLowerCase()}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Postal code">
          <input
            value={address.postal_code}
            autoComplete="shipping postal-code"
            onChange={(e) => set("postal_code", e.target.value)}
            className={brutalInput}
          />
        </Field>
        <Field label="Country">
          <select
            value={address.country_code}
            autoComplete="shipping country"
            onChange={(e) => {
              const next = e.target.value;
              // Reset province when country changes — codes don't overlap 1:1.
              setAddress({ ...address, country_code: next, province: "" });
            }}
            className={brutalInput}
          >
            <option value="us">United States</option>
            <option value="ca">Canada</option>
          </select>
        </Field>
      </div>

      <Field label="Phone (optional)">
        <input
          value={address.phone ?? ""}
          type="tel"
          autoComplete="shipping tel"
          onChange={(e) => set("phone", e.target.value)}
          className={brutalInput}
        />
      </Field>

      <button
        type="button"
        disabled={!canSubmit || busy}
        onClick={onSubmit}
        className="w-full font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0_0_#000]"
      >
        {busy ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}

function ShippingStep({
  options,
  selectedId,
  setSelectedId,
  currency,
  busy,
  onBack,
  onSubmit,
}: {
  options: ShippingOption[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  currency: string;
  busy: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6 space-y-4">
      <h2 className="text-brutal text-2xl">Shipping method</h2>

      {options.length === 0 ? (
        <p className="text-sm font-bold uppercase tracking-wider text-muted">
          No shipping options for your address. Try a different address.
        </p>
      ) : (
        <div className="space-y-3">
          {options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center justify-between gap-3 border-[3px] border-black p-4 cursor-pointer transition ${
                selectedId === opt.id
                  ? "bg-accent shadow-[4px_4px_0_0_#000]"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={selectedId === opt.id}
                  onChange={() => setSelectedId(opt.id)}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-black uppercase tracking-widest text-sm">
                  {opt.name}
                </span>
              </div>
              <span className="font-black text-sm">
                {money(opt.amount ?? 0, currency)}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="font-black uppercase tracking-widest border-[3px] border-black bg-white text-black px-6 py-4 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!selectedId || busy}
          onClick={onSubmit}
          className="flex-1 font-black uppercase tracking-widest border-[3px] border-black bg-primary text-white px-6 py-4 shadow-[5px_5px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-[transform,box-shadow] duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Preparing payment…" : "Continue to payment"}
        </button>
      </div>
    </div>
  );
}

function OrderSummary({ cart }: { cart: MedusaCart }) {
  const currency = cart.currency_code;
  return (
    <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#77269A] p-6 h-fit sticky top-24 space-y-4">
      <h2 className="text-brutal text-2xl">Order summary</h2>

      <div className="space-y-4 max-h-80 overflow-auto pt-2 pr-2">
        {cart.items.map((item) => (
          <SummaryLineItem
            key={item.id}
            thumbnail={item.thumbnail}
            title={item.product_title}
            variantTitle={item.variant_title}
            quantity={item.quantity}
            price={money(item.unit_price * item.quantity, currency)}
          />
        ))}
      </div>

      <div className="border-t-[3px] border-black pt-3 space-y-1 text-sm">
        <Row label="Subtotal" value={money(cart.item_subtotal, currency)} />
        <Row label="Shipping" value={money(cart.shipping_total, currency)} />
        <Row label="Tax" value={money(cart.tax_total, currency)} />
      </div>

      <div className="border-t-[3px] border-black pt-3 flex justify-between items-baseline">
        <span className="text-brutal text-xl">Total</span>
        <span className="text-brutal text-2xl">
          {money(cart.total, currency)}
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-black uppercase tracking-widest mb-1">
        {label}
      </span>
      {children}
    </label>
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

const brutalInput =
  "w-full border-[3px] border-black bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-shadow";
