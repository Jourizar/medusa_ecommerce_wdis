import { medusaFetch } from "./client";
import type { MedusaCart, MedusaCartLineItem } from "@ecommerce/types";

interface CartResponse {
  cart: MedusaCart;
}

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
  const data = await medusaFetch<CartResponse>(
    `/carts/${cartId}/line-items/${lineId}`,
    {
      method: "DELETE",
      revalidate: 0,
    }
  );
  return data.cart;
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
 * Initialize a payment session (Stripe).
 */
export async function initPaymentSession(
  cartId: string,
  providerId = "pp_stripe_stripe"
): Promise<{ cart: MedusaCart }> {
  return medusaFetch<CartResponse>(
    `/carts/${cartId}/payment-sessions`,
    {
      method: "POST",
      body: JSON.stringify({ provider_id: providerId }),
      revalidate: 0,
    }
  );
}

/**
 * Complete a cart checkout → creates an order.
 */
export async function completeCart(
  cartId: string
): Promise<MedusaCart> {
  const data = await medusaFetch<CartResponse>(
    `/carts/${cartId}/complete`,
    {
      method: "POST",
      revalidate: 0,
    }
  );
  return data.cart;
}
