import { NextRequest, NextResponse } from "next/server";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe webhook handler.
 * Medusa's Stripe plugin is the primary webhook consumer, but we also
 * listen here to mirror events to Convex for analytics and notifications.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing stripe signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: { type: string; data: { object: Record<string, unknown> } };

  try {
    // In production, verify with stripe.webhooks.constructEvent
    // For now, parse JSON directly (replace with proper verification)
    event = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook body" },
      { status: 400 }
    );
  }

  // Mirror events to Convex
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    await fetch(`${convexUrl}/api/run/webhooks/recordStripeEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: event.type,
        data: event.data.object,
      }),
    });
  } catch (error) {
    console.error("[Stripe Webhook] Failed to mirror to Convex:", error);
    // Don't fail the webhook — Medusa handles the primary flow
  }

  return NextResponse.json({ received: true });
}
