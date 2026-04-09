import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex user functions.
 * Manages user profiles linked to Medusa customers.
 */

export const getUser = query({
  args: { medusaCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_medusa_id", (q) =>
        q.eq("medusaCustomerId", args.medusaCustomerId)
      )
      .first();
    return user;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const createOrUpdateUser = mutation({
  args: {
    medusaCustomerId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_medusa_id", (q) =>
        q.eq("medusaCustomerId", args.medusaCustomerId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      medusaCustomerId: args.medusaCustomerId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      avatarUrl: args.avatarUrl,
    });
  },
});
