import { medusaFetch } from "./client";
import type { MedusaAddress, MedusaCart, MedusaCartLineItem } from "@ecommerce/types";

interface CartResponse {
  cart: MedusaCart;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type: "flat" | "calculated";
  service_zone_id: string | null;
  provider_id: string;
  data?: Record<string, unknown>;
}

export type CheckoutAddress = Omit<MedusaAddress, "id" | "customer_id" | "metadata">;

/**
 * Create a new cart.
 */
export async function createCart(
  regionId?: string,
  items?: { variant_id: string; quantity: number }[]
): Promise<MedusaCart> {
  const body: Record<string, unknown> = {};
  if (regionId) body.region_id = regionId;
  if (items && items.length > 0) body.items = items;

  const data = await medusaFetch<CartResponse>("/carts", {
    method: "POST",
    body: JSON.stringify(body),
    revalidate: 0, // Don't cache cart creation
  });

  return data.cart;
}

/**
 * Get a cart by ID.
 */
export async function getCart(cartId: string): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(`/carts/${cartId}`, {
    revalidate: 0, // Don't cache carts
  });
  return data.cart;
}

/**
 * Add a line item to a cart.
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(`/carts/${cartId}/line-items`, {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId, quantity }),
    revalidate: 0,
  });
  return data.cart;
}

/**
 * Update a line item quantity.
 */
export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(
    `/carts/${cartId}/line-items/${lineId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
      revalidate: 0,
    }
  );
  return data.cart;
}

/**
 * Remove a line item from a cart.
 */
export async function removeLineItem(
  cartId: string,
  lineId: string
): Promise<MedusaCart> {
  // DELETE returns { id, object: "line-item", deleted: true, parent: <cart> }
  const data = await medusaFetch<{ parent: MedusaCart }>(
    `/carts/${cartId}/line-items/${lineId}`,
    {
      method: "DELETE",
      revalidate: 0,
    }
  );
  return data.parent;
}

/**
 * Set shipping method on a cart.
 */
export async function setShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(
    `/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
      revalidate: 0,
    }
  );
  return data.cart;
}

/**
 * Update cart email + shipping/billing addresses.
 * In Medusa v2, cart mutations go through POST /store/carts/:id.
 */
export async function updateCart(
  cartId: string,
  payload: {
    email?: string;
    shipping_address?: CheckoutAddress;
    billing_address?: CheckoutAddress;
  }
): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(`/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify(payload),
    revalidate: 0,
  });
  return data.cart;
}

/**
 * List shipping options available to a cart (already scoped to region + address).
 */
export async function listShippingOptions(
  cartId: string
): Promise<ShippingOption[]> {
  const data = await medusaFetch<{ shipping_options: ShippingOption[] }>(
    `/shipping-options?cart_id=${cartId}`,
    { revalidate: 0 }
  );
  return data.shipping_options ?? [];
}

/**
 * Create (or reuse) a payment collection for a cart. Idempotent —
 * Medusa returns the existing collection if one is already attached.
 */
export async function createPaymentCollection(
  cartId: string
): Promise<{ id: string }> {
  const data = await medusaFetch<{
    payment_collection: { id: string };
  }>(`/payment-collections`, {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
    revalidate: 0,
  });
  return { id: data.payment_collection.id };
}

/**
 * Initialize a payment session on a payment collection.
 * Returns the session data (Stripe's `client_secret` lives in `data.client_secret`).
 */
export interface StripePaymentSession {
  id: string;
  provider_id: string;
  amount: number;
  currency_code: string;
  data: {
    client_secret?: string;
    id?: string;
    [key: string]: unknown;
  };
}

export async function initPaymentSession(
  paymentCollectionId: string,
  providerId = "pp_stripe_stripe"
): Promise<StripePaymentSession> {
  const data = await medusaFetch<{
    payment_collection: {
      id: string;
      payment_sessions: StripePaymentSession[];
    };
  }>(`/payment-collections/${paymentCollectionId}/payment-sessions`, {
    method: "POST",
    body: JSON.stringify({ provider_id: providerId }),
    revalidate: 0,
  });

  const session = data.payment_collection.payment_sessions.find(
    (s) => s.provider_id === providerId
  );
  if (!session) {
    throw new Error(`No ${providerId} payment session on collection`);
  }
  return session;
}

/**
 * Complete a cart checkout → creates an order.
 * On success the response contains { type: "order", order } — otherwise it stays as a cart.
 */
export async function completeCart(
  cartId: string
): Promise<{ type: "order"; order: { id: string; display_id: number } } | { type: "cart"; cart: MedusaCart }> {
  return medusaFetch<
    | { type: "order"; order: { id: string; display_id: number } }
    | { type: "cart"; cart: MedusaCart }
  >(`/carts/${cartId}/complete`, {
    method: "POST",
    revalidate: 0,
  });
}
