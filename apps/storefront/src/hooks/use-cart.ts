import { create } from "zustand";
import { getCart, createCart, addToCart, updateLineItem, removeLineItem } from "@/lib/medusa/cart";
import type { CartItem, CartState, CartActions } from "@ecommerce/types";

interface CartStore extends CartState, CartActions {}

export const useCart = create<CartStore>((set, get) => ({
  cartId: null,
  items: [],
  subtotal: 0,
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,

  initializeCart: async () => {
    // Check for existing cart ID in cookie
    const cartIdCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cart_id="));

    if (cartIdCookie) {
      const cartId = cartIdCookie.split("=")[1];
      try {
        const cart = await getCart(cartId);
        set({
          cartId: cart.id,
          items: mapCartItems(cart.items),
          subtotal: cart.subtotal,
          total: cart.total,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        });
      } catch {
        // Cart expired or invalid — create new one below
      }
    }

    // Create a new cart if none exists
    if (!get().cartId) {
      try {
        const newCart = await createCart();
        set({ cartId: newCart.id });
        // Set cookie for persistence
        document.cookie = `cart_id=${newCart.id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to initialize cart" });
      }
    }
  },

  addItem: async (variantId: string, quantity: number) => {
    const { cartId } = get();
    if (!cartId) {
      await get().initializeCart();
    }

    set({ loading: true, error: null });

    try {
      const updatedCart = await addToCart(
        get().cartId!,
        variantId,
        quantity
      );

      set({
        items: mapCartItems(updatedCart.items),
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        itemCount: updatedCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add item",
        loading: false,
      });
    }
  },

  updateItemQuantity: async (lineId: string, quantity: number) => {
    const { cartId } = get();
    if (!cartId) return;

    try {
      const updatedCart = await updateLineItem(cartId, lineId, quantity);
      set({
        items: mapCartItems(updatedCart.items),
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        itemCount: updatedCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to update item" });
    }
  },

  removeItem: async (lineId: string) => {
    const { cartId } = get();
    if (!cartId) return;

    try {
      const updatedCart = await removeLineItem(cartId, lineId);
      set({
        items: mapCartItems(updatedCart.items),
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        itemCount: updatedCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to remove item" });
    }
  },

  clearCart: () => {
    set({
      cartId: null,
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0,
    });
    // Clear cookie
    document.cookie = "cart_id=; path=/; max-age=0";
  },

  refreshCart: async () => {
    const { cartId } = get();
    if (!cartId) return;

    try {
      const cart = await getCart(cartId);
      set({
        items: mapCartItems(cart.items),
        subtotal: cart.subtotal,
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    } catch {
      // Cart may have been completed — clear it
      get().clearCart();
    }
  },
}));

/**
 * Map Medusa cart line items to our CartItem type.
 */
function mapCartItems(items: {
  id: string;
  product_id: string;
  variant_id?: string;
  product_title: string;
  variant_title: string | null;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  currency_code?: string;
}[]): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id || "",
    title: item.product_title,
    variantTitle: item.variant_title,
    thumbnail: item.thumbnail,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    currencyCode: item.currency_code || "usd",
  }));
}
