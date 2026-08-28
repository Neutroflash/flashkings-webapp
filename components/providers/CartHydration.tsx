"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

// Pairs with `skipHydration: true` in store/cart-store.ts. Rehydrating here, inside a
// post-mount effect, guarantees the first client render matches the server-rendered HTML
// (both start from the store's default empty state) — the real localStorage cart data lands
// as a normal state update right after, not during hydration, so it never triggers React's
// hydration-mismatch error.
export function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
