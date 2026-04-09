/**
 * Medusa Store API client.
 * Thin wrapper around fetch with typed responses and error handling.
 * Uses ISR caching via Next.js fetch options.
 */

import type { MedusaError } from "@ecommerce/types";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;

if (!MEDUSA_URL) {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set. Copy .env.example to .env.local and configure it."
  );
}

interface FetchOptions extends RequestInit {
  /** Cache revalidation time in seconds (ISR). Default: 60 */
  revalidate?: number;
  /** Include auth token in headers */
  token?: string;
  /** Cart session ID */
  cartId?: string;
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

  const url = `${MEDUSA_URL}/store${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
  return `${MEDUSA_URL}/store${path}`;
}
