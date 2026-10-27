import { NextRequest, NextResponse } from "next/server";
import { getCustomerForToken, getMedusaToken } from "@/lib/auth";
import { getMedusaUrl, getPublishableKey } from "@/lib/medusa/client";

function storeHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-publishable-api-key": getPublishableKey(),
  };
}

/**
 * Checkout prefill for signed-in customers: their email and the shipping
 * address from their most recent order. Guests get 204.
 */
export async function GET() {
  const token = await getMedusaToken();
  if (!token) return new NextResponse(null, { status: 204 });

  const customer = await getCustomerForToken(token);
  if (!customer) return new NextResponse(null, { status: 204 });

  const ordersRes = await fetch(
    `${getMedusaUrl()}/store/orders?limit=1&order=-created_at&fields=*shipping_address`,
    { headers: storeHeaders(token), cache: "no-store" }
  );
  const lastAddress = ordersRes.ok
    ? ((await ordersRes.json()).orders?.[0]?.shipping_address ?? null)
    : null;

  return NextResponse.json({
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    address: lastAddress,
  });
}

/**
 * Attach the current cart to the signed-in customer so the order shows up
 * in their history. No-op for guests.
 */
export async function POST(req: NextRequest) {
  const token = await getMedusaToken();
  if (!token) return new NextResponse(null, { status: 204 });

  const { cartId } = (await req.json().catch(() => ({}))) as { cartId?: string };
  if (!cartId?.startsWith("cart_")) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const res = await fetch(`${getMedusaUrl()}/store/carts/${cartId}/customer`, {
    method: "POST",
    headers: storeHeaders(token),
    cache: "no-store",
  });

  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 400 });
}
