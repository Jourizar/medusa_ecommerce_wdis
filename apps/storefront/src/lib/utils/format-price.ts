/**
 * Format a price for display.
 * Handles currency symbol placement and decimal formatting.
 *
 * @param amount - Amount in cents (e.g., 1999 = $19.99)
 * @param currencyCode - ISO 4217 currency code (e.g., "usd")
 * @returns Formatted price string
 */
export function formatPrice(
  amount: number,
  currencyCode: string = "usd"
): string {
  const currencySymbols: Record<string, string> = {
    usd: "$",
    eur: "€",
    gbp: "£",
    jpy: "¥",
    cad: "C$",
    aud: "A$",
  };

  const symbol = currencySymbols[currencyCode.toLowerCase()] || "$";
  const formatted = (amount / 100).toFixed(2);

  return `${symbol}${formatted}`;
}

/**
 * Format a price range.
 */
export function formatPriceRange(
  min: number,
  max: number,
  currencyCode: string = "usd"
): string {
  if (min === max) return formatPrice(min, currencyCode);
  return `${formatPrice(min, currencyCode)} – ${formatPrice(max, currencyCode)}`;
}
