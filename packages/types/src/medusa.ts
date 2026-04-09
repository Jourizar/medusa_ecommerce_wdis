// Medusa product types aligned with Medusa v2 Store API
export interface MedusaImage {
  id: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface MedusaMoneyAmount {
  id: string;
  currency_code: string;
  amount: number;
  min_quantity?: number;
  max_quantity?: number;
}

export interface MedusaProductVariant {
  id: string;
  title: string;
  sku: string | null;
  ean: string | null;
  upc: string | null;
  barcode: string | null;
  hs_code: string | null;
  mid_code: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  origin_country: string | null;
  material: string | null;
  allow_backorder: boolean;
  manage_inventory: boolean;
  inventory_quantity: number;
  prices: MedusaMoneyAmount[];
  options: { id: string; value: string; option_id: string }[];
  product_id: string;
  metadata?: Record<string, unknown>;
}

export interface MedusaProductOption {
  id: string;
  title: string;
  values: { id: string; value: string; option_id: string }[];
  product_id: string;
  metadata?: Record<string, unknown>;
}

export interface MedusaProduct {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  handle: string;
  is_giftcard: boolean;
  status: "draft" | "proposed" | "published" | "rejected";
  thumbnail: string | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  hs_code: string | null;
  origin_country: string | null;
  mid_code: string | null;
  material: string | null;
  collection_id: string | null;
  type_id: string | null;
  discountable: boolean;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata?: Record<string, unknown>;
  images: MedusaImage[];
  options: MedusaProductOption[];
  variants: MedusaProductVariant[];
  type: { id: string; value: string } | null;
  collection: { id: string; title: string; handle: string } | null;
  tags: { id: string; value: string }[];
}

export interface MedusaProductListResponse {
  products: MedusaProduct[];
  count: number;
  offset: number;
  limit: number;
}

export interface MedusaProductDetailResponse {
  product: MedusaProduct;
}

// Cart types
export interface MedusaCartLineItem {
  id: string;
  cart_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  variant_id: string;
  product_id: string;
  product_title: string;
  product_description: string | null;
  product_subtitle: string | null;
  product_type: string | null;
  product_collection: string | null;
  product_handle: string;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_title: string | null;
  variant_option_values: Record<string, unknown> | null;
  includes_tax: boolean;
  tax_lines: { id: string; rate: number; code: string; name: string }[];
  adjustments: { id: string; amount: number; description: string; discount_id: string | null; promotion_id: string | null }[];
  compare_at_unit_price: number | null;
  is_customizable: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MedusaShippingMethod {
  id: string;
  cart_id: string;
  shipping_option_id: string;
  name: string;
  description: string;
  price: number;
  includes_tax: boolean;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface MedusaCart {
  id: string;
  email: string | null;
  billing_address: MedusaAddress | null;
  shipping_address: MedusaAddress | null;
  items: MedusaCartLineItem[];
  shipping_methods: MedusaShippingMethod[];
  region_id: string;
  currency_code: string;
  total: number;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  discount_tax_total: number;
  original_total: number;
  original_tax_total: number;
  gift_card_total: number;
  gift_card_tax_total: number;
  shipping_total: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  payment_collection?: {
    id: string;
    payment_sessions: MedusaPaymentSession[];
  };
  customer_id: string | null;
  type: string;
  sales_channel_id: string | null;
  metadata?: Record<string, unknown>;
}

export interface MedusaAddress {
  id: string | null;
  customer_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  company: string | null;
  address_1: string;
  address_2: string | null;
  city: string;
  country_code: string;
  province: string | null;
  postal_code: string;
  metadata?: Record<string, unknown>;
}

export interface MedusaPaymentSession {
  id: string;
  amount: number;
  currency_code: string;
  provider_id: string;
  data: Record<string, unknown>;
  context: Record<string, unknown> | null;
  status: string;
  authorized_at: string | null;
}

// Order types
export interface MedusaOrder {
  id: string;
  status: "pending" | "completed" | "archived" | "canceled" | "requires_action";
  fulfillment_status: "not_fulfilled" | "fulfilled" | "shipped" | "partially_shipped" | "canceled" | "returned" | "partially_returned";
  payment_status: "awaiting" | "captured" | "partially_refunded" | "refunded" | "canceled" | "requires_action";
  display_id: number;
  cart_id: string | null;
  customer_id: string | null;
  email: string;
  billing_address: MedusaAddress | null;
  shipping_address: MedusaAddress | null;
  items: MedusaCartLineItem[];
  shipping_methods: MedusaShippingMethod[];
  region_id: string;
  currency_code: string;
  total: number;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  gift_card_total: number;
  shipping_total: number;
  refunded_total: number;
  paid_total: number;
  fulfillment_status_label: string;
  payment_status_label: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  summary: {
    paid_total: number;
    refunded_total: number;
    pending_difference: number;
  };
}

// Customer / Auth types
export interface MedusaCustomer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  has_account: boolean;
  orders: MedusaOrder[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface MedusaAuthResponse {
  customer: MedusaCustomer;
}

// Region / Currency
export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  tax_code: string | null;
  tax_rate: number | null;
  tax_inclusive: boolean;
  payment_providers: { id: string; is_enabled: boolean }[];
  fulfillment_providers: { id: string; is_enabled: boolean }[];
  countries: { iso_2: string; iso_3: string; num_code: string; name: string; display_name: string }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  metadata?: Record<string, unknown>;
}

// API error
export interface MedusaError {
  type: string;
  message: string;
}
