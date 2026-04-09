/**
 * Convex API wrapper for the storefront.
 * Re-exports the generated API object for cleaner imports.
 */

import { api } from "../../../convex/_generated/api";

export const convex = api;

// Type-safe helpers
export type ConvexApi = typeof api;
export type ConvexFunctionPath = keyof typeof api;
