import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "flashkings-cart",
      // isOpen is transient UI state — never persist it, or a closed-tab reload would reopen the drawer.
      partialize: (state) => ({ items: state.items }),
      // Zustand's persist middleware rehydrates from localStorage synchronously by default —
      // on the client that happens before/during hydration, while SSR always rendered with the
      // default empty state. Any component reading `items`/`totalItems` (Navbar's cart badge,
      // CartDrawer, checkout) then mismatches between server and client HTML, which throws a
      // hydration error and can abort the rest of the client render (e.g. <Script> never mounts).
      // skipHydration + manual rehydrate() after mount (see components/providers/CartHydration.tsx)
      // guarantees the first client render matches the server: empty, then updates post-hydration.
      skipHydration: true,
    },
  ),
);
