"use client";

import { FormEvent, useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { createOrder, chargeOrder } from "@/lib/orders";

// Mirrors the backend's default STOCK_HOLD_MINUTES — visual aid only, the server enforces the real deadline.
const HOLD_MINUTES = 15;

declare global {
  interface Window {
    Culqi?: { publicKey: string; settings: (opts: unknown) => void; open: () => void };
    culqi?: () => void;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();

  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", shippingAddress: "" });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(HOLD_MINUTES * 60 * 1000);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setRemainingMs(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  useEffect(() => {
    if (!orderId || !publicKey || typeof window === "undefined" || !window.Culqi) return;
    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({ title: "Flashkings", currency: "PEN", amount: Math.round(totalPrice() * 100) });
    window.culqi = () => {
      const token = (window as unknown as { Culqi: { token?: { id: string } } }).Culqi.token;
      if (token?.id) void handlePay(token.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, publicKey]);

  async function handleStartPayment(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await createOrder(
        form,
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      );
      setOrderId(response.orderId);
      setPublicKey(response.publicKey || null);
      setDeadline(Date.now() + HOLD_MINUTES * 60 * 1000);

      if (!response.publicKey) {
        // Dev/test mode: backend is running with PAYMENT_GATEWAY=fake, no real Culqi widget to open.
        return;
      }
      window.Culqi?.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay(sourceId: string) {
    if (!orderId) return;
    setPaying(true);
    setError(null);
    try {
      const result = await chargeOrder(orderId, sourceId);
      if (result.status === "succeeded") {
        clear();
        router.push(`/pedido/${orderId}/confirmacion`);
      } else if (result.status === "failed") {
        setError("El pago fue rechazado. Vuelve a intentarlo o usa otro método.");
        setOrderId(null);
        setDeadline(null);
      } else {
        setError("El pago quedó pendiente de confirmación (Yape/Plin). Te avisaremos cuando se confirme.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pago");
    } finally {
      setPaying(false);
    }
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Button className="mt-4" onClick={() => router.push("/catalogo")}>
          Ir al catálogo
        </Button>
      </div>
    );
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      {publicKey && <Script src="https://checkout.culqi.com/js/v4" strategy="afterInteractive" />}

      <h1 className="text-3xl font-bold">Checkout</h1>

      {orderId && (
        <div
          className={cn(
            "rounded-md border px-4 py-2 text-sm",
            remainingMs > 0 ? "border-secondary text-secondary" : "border-destructive text-destructive",
          )}
        >
          {remainingMs > 0
            ? `Tu stock está reservado por ${minutes}:${seconds.toString().padStart(2, "0")} min`
            : "El tiempo de reserva expiró. Vuelve a intentarlo."}
        </div>
      )}

      {error && <div className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleStartPayment} className="flex flex-col gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Nombre completo</label>
          <input
            required
            disabled={!!orderId}
            value={form.customerName}
            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            className="h-10 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Correo electrónico</label>
          <input
            required
            type="email"
            disabled={!!orderId}
            value={form.customerEmail}
            onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
            className="h-10 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Teléfono</label>
          <input
            required
            disabled={!!orderId}
            value={form.customerPhone}
            onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            className="h-10 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Dirección de envío</label>
          <input
            required
            disabled={!!orderId}
            value={form.shippingAddress}
            onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
            className="h-10 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(totalPrice())}</span>
        </div>

        {!orderId && (
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Reservando stock..." : "Iniciar Pago"}
          </Button>
        )}

        {orderId && !publicKey && (
          <Button type="button" size="lg" disabled={paying} onClick={() => handlePay(`fake_source_${orderId}`)}>
            {paying ? "Procesando..." : "Pagar (modo de prueba)"}
          </Button>
        )}
      </form>
    </div>
  );
}
