"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { validateCart } from "@/lib/orders";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [stockWarnings, setStockWarnings] = useState<Record<string, number>>({});
  const [checking, setChecking] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) return;
    setChecking(true);
    setStockWarnings({});
    try {
      const result = await validateCart(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
      if (result.ok) {
        closeCart();
        router.push("/checkout");
        return;
      }
      const warnings: Record<string, number> = {};
      for (const item of result.items) {
        if (!item.ok) warnings[item.variantId] = item.available;
      }
      setStockWarnings(warnings);
    } catch {
      setStockWarnings({ _global: -1 });
    } finally {
      setChecking(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-bold">
              <ShoppingCart className="h-5 w-5" /> Tu carrito
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar carrito" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="mt-10 text-center text-muted-foreground">Tu carrito está vacío.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3 border-b border-border pb-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-sm font-medium">{item.productName}</span>
                      <span className="text-xs text-muted-foreground">{item.variantName}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                          className="rounded border border-border p-0.5 hover:border-primary"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="rounded border border-border p-0.5 hover:border-primary"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {stockWarnings[item.variantId] !== undefined && (
                        <span className="text-xs text-destructive">
                          Solo quedan {stockWarnings[item.variantId]} disponibles
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {stockWarnings._global !== undefined && (
              <p className="mt-4 text-sm text-destructive">No se pudo validar el stock. Intenta nuevamente.</p>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span className="text-primary">{formatPrice(totalPrice())}</span>
              </div>
              <Button size="lg" className="w-full" disabled={checking} onClick={handleCheckout}>
                {checking ? "Verificando stock..." : "Continuar con la compra"}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
