import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex notification functions.
 * Real-time notifications pushed to user dashboard.
 */

export const getNotifications = query({
  args: { userId: v.string(), unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q;

    if (args.unreadOnly) {
      q = ctx.db
        .query("notifications")
        .withIndex("by_user_and_read", (q) =>
          q.eq("userId", args.userId).eq("read", false)
        );
    } else {
      q = ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId));
    }

    return q.order("desc").take(50);
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    return notifications.length;
  },
});

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      link: args.link,
      createdAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});
