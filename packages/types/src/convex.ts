import { Infer } from "convex/values";
import type { Doc } from "../convex/_generated/dataModel";

// Convex table document types (auto-inferred from schema)
export type User = Doc<"users">;
export type AnalyticsEvent = Doc<"analytics_events">;
export type Inventory = Doc<"inventory">;
export type WishlistItem = Doc<"wishlist">;
export type Notification = Doc<"notifications">;

// Input types for Convex mutations
export interface CreateUserInput {
  medusaCustomerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface TrackEventInput {
  userId?: string;
  event: string;
  properties?: Record<string, unknown>;
  orderId?: string;
  total?: number;
  productId?: string;
  cartId?: string;
}

export interface WishlistItemInput {
  userId: string;
  productId: string;
  productTitle: string;
  productHandle: string;
  thumbnailUrl?: string;
  price: number;
  currencyCode: string;
}

// Dashboard aggregations
export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentEvents: AnalyticsEvent[];
  topProducts: { productId: string; viewCount: number }[];
}

export interface UserDashboardData {
  user: User;
  wishlistCount: number;
  notificationCount: number;
  recentActivity: AnalyticsEvent[];
}
