/**
 * Application-wide constants.
 */

export const SITE_NAME = "URBN";
export const SITE_TAGLINE = "Premium Streetwear & Urban Fashion";

export const CURRENCY = "usd";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_CART_ITEMS = 50;

export const SORT_OPTIONS = [
  { label: "Newest", value: "-created_at" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "title" },
  { label: "Name: Z-A", value: "-title" },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Cart", href: "/cart" },
] as const;

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

export const CHECKOUT_FIELDS = [
  "email",
  "firstName",
  "lastName",
  "address",
  "city",
  "postalCode",
  "country",
  "phone",
] as const;
