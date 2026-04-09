import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex wishlist functions.
 * Allows users to save and manage wishlist items.
 */

export const getWishlist = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const isInWishlist = query({
  args: { userId: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();
    return !!item;
  },
});

export const addToWishlist = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    productTitle: v.string(),
    productHandle: v.string(),
    thumbnailUrl: v.optional(v.string()),
    price: v.number(),
    currencyCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existing) return existing._id;

    return ctx.db.insert("wishlist", {
      userId: args.userId,
      productId: args.productId,
      productTitle: args.productTitle,
      productHandle: args.productHandle,
      thumbnailUrl: args.thumbnailUrl,
      price: args.price,
      currencyCode: args.currencyCode,
      addedAt: Date.now(),
    });
  },
});

export const removeFromWishlist = mutation({
  args: { userId: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});
