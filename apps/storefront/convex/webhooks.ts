import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Webhook endpoint for receiving Stripe events mirrored from Next.js API route.
 * Creates notifications and tracks analytics based on Stripe event types.
 */

export const recordStripeEvent = mutation({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { type, data } = args;

    // Track the event
    await ctx.db.insert("analytics_events", {
      event: `stripe_${type}`,
      properties: { type, stripeEvent: data },
      timestamp: Date.now(),
    });

    // Create notifications based on event type
    if (type === "payment_intent.succeeded" && data.metadata?.userId) {
      await ctx.db.insert("notifications", {
        userId: data.metadata.userId as string,
        type: "payment_confirmed",
        title: "Payment Confirmed",
        message: "Your payment has been processed successfully.",
        read: false,
        link: data.metadata?.orderId
          ? `/account/orders/${data.metadata.orderId}`
          : undefined,
        createdAt: Date.now(),
      });
    }

    if (type === "charge.refunded" && data.metadata?.userId) {
      await ctx.db.insert("notifications", {
        userId: data.metadata.userId as string,
        type: "order_refunded",
        title: "Refund Processed",
        message: `A refund of $${((data.amount as number) / 100).toFixed(2)} has been issued.`,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});
