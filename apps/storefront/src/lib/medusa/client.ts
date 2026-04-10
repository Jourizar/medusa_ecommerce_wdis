/**
 * Medusa Store API client.
 * Thin wrapper around fetch with typed responses and error handling.
 * Uses ISR caching via Next.js fetch options.
 * 
 * Updated: 2026-04-09 — Fixed publishable key loading for SSR
 */

import type { MedusaError } from "@ecommerce/types";

interface FetchOptions extends RequestInit {
  /** Cache revalidation time in seconds (ISR). Default: 60 */
  revalidate?: number;
  /** Include auth token in headers */
  token?: string;
  /** Cart session ID */
  cartId?: string;
}

/**
 * Get Medusa backend URL from environment.
 */
function getMedusaUrl(): string {
  const url = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set. Copy .env.example to .env.local and configure it."
    );
  }
  return url;
}

/**
 * Get publishable API key from environment.
 */
function getPublishableKey(): string {
  // Non-prefixed version for server-side, NEXT_PUBLIC_ for client-side
  const key = process.env.MEDUSA_PUBLISHABLE_KEY 
    || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY 
    || "pk_465b71216d41bc1a92f67733038d75fc20cbeaae9b62d86d47511e471280d205";
  return key;
}

/**
 * Typed fetch wrapper for Medusa Store API.
 */
export async function medusaFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    revalidate = 60,
    token,
    cartId,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const url = `${getMedusaUrl()}/store${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": getPublishableKey(),
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (cartId) {
    headers["x-cart-id"] = cartId;
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      next: { revalidate },
    });

    if (!res.ok) {
      const error: MedusaError = await res.json().catch(() => ({
        type: "unknown",
        message: `HTTP ${res.status}: ${res.statusText}`,
      }));
      throw new Error(`Medusa API error: ${error.message}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch ${url}: ${String(error)}`);
  }
}

/**
 * Build Medusa API URL (for use in rewrites or server-side only calls).
 */
export function medusaUrl(path: string): string {
  return `${getMedusaUrl()}/store${path}`;
}
