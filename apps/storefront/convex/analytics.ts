import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex analytics functions.
 * Tracks events and provides aggregation for dashboards.
 */

export const trackEvent = mutation({
  args: {
    userId: v.optional(v.string()),
    event: v.string(),
    properties: v.optional(v.any()),
    orderId: v.optional(v.string()),
    total: v.optional(v.number()),
    productId: v.optional(v.string()),
    cartId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("analytics_events", {
      userId: args.userId,
      event: args.event,
      properties: args.properties,
      orderId: args.orderId,
      total: args.total,
      productId: args.productId,
      cartId: args.cartId,
      timestamp: Date.now(),
    });
  },
});

export const getRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return ctx.db
      .query("analytics_events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getEventsByType = query({
  args: { event: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return ctx.db
      .query("analytics_events")
      .withIndex("by_event", (q) => q.eq("event", args.event))
      .order("desc")
      .take(limit);
  },
});

export const getTopProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const events = await ctx.db
      .query("analytics_events")
      .withIndex("by_event", (q) => q.eq("event", "product_view"))
      .order("desc")
      .take(200);

    const productCounts: Record<string, number> = {};
    for (const event of events) {
      if (event.productId) {
        productCounts[event.productId] = (productCounts[event.productId] || 0) + 1;
      }
    }

    return Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId, viewCount]) => ({ productId, viewCount }));
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const totalUsers = (await ctx.db.query("users").collect()).length;
    const totalEvents = (await ctx.db.query("analytics_events").collect()).length;

    const events = await ctx.db
      .query("analytics_events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(100);

    const eventsByType: Record<string, number> = {};
    for (const event of events) {
      eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
    }

    return {
      totalUsers,
      totalEvents,
      eventsByType,
      recentEvents: events.slice(0, 20),
    };
  },
});
