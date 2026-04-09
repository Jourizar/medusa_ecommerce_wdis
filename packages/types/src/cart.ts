export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string | null;
  thumbnail: string | null;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
}

export interface CartState {
  cartId: string | null;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

export interface CartActions {
  initializeCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}
