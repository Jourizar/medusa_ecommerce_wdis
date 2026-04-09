import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex inventory functions.
 * Provides real-time stock level queries and mutations
 * (called by Medusa subscriber on inventory changes).
 */

export const getStockLevel = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      productId: args.productId,
      totalQuantity: total,
      variants: items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        lowStockThreshold: i.lowStockThreshold ?? 5,
      })),
    };
  },
});

export const getStockLevelByVariant = query({
  args: { variantId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
      .first();

    return item
      ? {
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold ?? 5,
        }
      : null;
  },
});

export const updateStock = mutation({
  args: {
    productId: v.string(),
    variantId: v.string(),
    quantity: v.number(),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: args.quantity,
        lowStockThreshold: args.lowStockThreshold ?? existing.lowStockThreshold,
      });
      return existing._id;
    }

    return ctx.db.insert("inventory", {
      productId: args.productId,
      variantId: args.variantId,
      quantity: args.quantity,
      lowStockThreshold: args.lowStockThreshold ?? 5,
    });
  },
});

export const getAllStock = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("inventory").collect();
  },
});
