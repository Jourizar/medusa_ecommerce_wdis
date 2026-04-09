import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for custom app data.
 * Medusa handles commerce (products, carts, orders).
 * Convex handles: user profiles, analytics, wishlist, notifications, inventory cache.
 */
export default defineSchema({
  // User profiles (linked to Medusa customer by medusaCustomerId)
  users: defineTable({
    medusaCustomerId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        newsletter: v.optional(v.boolean()),
        currency: v.optional(v.string()),
        language: v.optional(v.string()),
      })
    ),
  })
    .index("by_medusa_id", ["medusaCustomerId"])
    .index("by_email", ["email"]),

  // Analytics events (page views, add-to-cart, purchases, etc.)
  analytics_events: defineTable({
    userId: v.optional(v.string()),
    event: v.string(), // "page_view", "add_to_cart", "checkout_start", "purchase_complete"
    properties: v.optional(v.any()),
    orderId: v.optional(v.string()),
    total: v.optional(v.number()),
    productId: v.optional(v.string()),
    cartId: v.optional(v.string()),
    timestamp: v.number(), // Unix ms
  })
    .index("by_event", ["event"])
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_order", ["orderId"])
    .index("by_timestamp", ["timestamp"]),

  // Inventory cache (mirrored from Medusa for real-time pushes)
  inventory: defineTable({
    productId: v.string(),
    variantId: v.string(),
    quantity: v.number(),
    lowStockThreshold: v.optional(v.number()),
  })
    .index("by_product", ["productId"])
    .index("by_variant", ["variantId"]),

  // Wishlist items
  wishlist: defineTable({
    userId: v.string(),
    productId: v.string(),
    productTitle: v.string(),
    productHandle: v.string(),
    thumbnailUrl: v.optional(v.string()),
    price: v.number(),
    currencyCode: v.string(),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_and_product", ["userId", "productId"]),

  // Notifications (pushed to user dashboard in real-time)
  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // "order_shipped", "back_in_stock", "price_drop", "order_delivered"
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_created", ["createdAt"]),
});
