"use client";

import { FormEvent, useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, cn } from "@/lib/utils";
import { createOrder, chargeOrder, submitManualPayment } from "@/lib/orders";

// Mirrors the backend's default STOCK_HOLD_MINUTES — visual aid only, the server enforces the real deadline.
const HOLD_MINUTES = 15;

// Flashkings' own Yape/Plin account — same source as the floating WhatsApp button's number.
// A manual transfer isn't tied to Culqi at all, so this doesn't need a "real" merchant QR format
// (Yape/Plin's own scannable QR is a proprietary bank-network standard we don't have access to) —
// the phone number is the actually actionable piece; the QR just encodes it for a quick scan.
const STORE_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "51999999999";
const STORE_PHONE_DISPLAY = STORE_PHONE.startsWith("51") ? `+51 ${STORE_PHONE.slice(2)}` : STORE_PHONE;

type PaymentMethod = "card" | "yape_plin";

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (opts: unknown) => void;
      open: () => void;
      close: () => void;
      token?: { id: string };
      error?: { user_message?: string; merchant_message?: string };
    };
    culqi?: () => void;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();

  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", shippingAddress: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [culqiReady, setCulqiReady] = useState(false);
  const [culqiScriptError, setCulqiScriptError] = useState(false);
  const [scriptRetryKey, setScriptRetryKey] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(HOLD_MINUTES * 60 * 1000);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Yape/Plin state
  const [manualMethod, setManualMethod] = useState<"yape" | "plin">("yape");
  const [operationNumber, setOperationNumber] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setRemainingMs(Math.max(0, deadline - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  // Belt-and-suspenders cleanup: Culqi.close() *should* remove its own overlay (confirmed against
  // Culqi's own official checkout-v4 demo, which calls it the same way), but in practice it can
  // leave a stray node behind — especially right before a client-side route change interrupts
  // whatever closing transition it was mid-way through. This force-hides anything Culqi injected,
  // as a fallback that doesn't depend on the SDK's own cleanup actually finishing in time.
  function forceHideCulqiOverlay() {
    document.querySelectorAll('[id*="culqi" i], [class*="culqi" i]').forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  }

  function openCulqiWidget() {
    if (!publicKey || !window.Culqi) return;
    window.Culqi.publicKey = publicKey;
    window.Culqi.settings({ title: "Flashkings", currency: "PEN", amount: Math.round(totalPrice() * 100) });
    // Culqi renders its own modal outside React's control (injected straight into the DOM), so
    // it never closes on its own once the user submits a card inside it — not even once we
    // navigate away client-side. We close it explicitly the moment we get a result back, then
    // take over all further feedback (the "Confirmando tu pago..." banner below) on our own page,
    // so the customer isn't left staring at a stale widget while our backend confirms the charge.
    window.culqi = () => {
      const culqi = window.Culqi;
      culqi?.close();
      // A tick after close() so its own transition/cleanup gets a chance to run before our
      // force-hide fallback and the rest of the flow (navigation) kick in.
      setTimeout(forceHideCulqiOverlay, 50);
      if (culqi?.token?.id) {
        void handlePay(culqi.token.id);
      } else if (culqi?.error) {
        setError(culqi.error.user_message ?? culqi.error.merchant_message ?? "No se pudo procesar la tarjeta.");
      }
    };
    window.Culqi.open();
  }

  // Auto-opens once an order exists (card method only) AND the script has actually finished
  // loading (tracked via <Script onLoad>, not assumed) — calling window.Culqi.open() before the
  // script loads is a silent no-op (optional chaining swallows it). The manual "Abrir pago"
  // button below is the fallback if this doesn't fire (e.g. a popup blocker).
  useEffect(() => {
    if (paymentMethod !== "card" || !orderId || !publicKey || !culqiReady) return;
    openCulqiWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, orderId, publicKey, culqiReady]);

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
        forceHideCulqiOverlay();
        // Gives Culqi's own close animation a moment to finish before we swap the page out from
        // under it — the "Confirmando tu pago..." banner is already visible, so this reads as
        // part of the confirmation step, not a random stall.
        await new Promise((resolve) => setTimeout(resolve, 400));
        forceHideCulqiOverlay();
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

  async function handleSubmitManual(e: FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setSubmittingManual(true);
    setError(null);
    try {
      await submitManualPayment(orderId, manualMethod, operationNumber.trim());
      clear();
      router.push(`/pedido/${orderId}/confirmacion`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el número de operación");
    } finally {
      setSubmittingManual(false);
    }
  }

  async function copyPhone() {
    await navigator.clipboard.writeText(STORE_PHONE_DISPLAY);
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 1500);
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
      {/* Loaded unconditionally (not gated on publicKey) so it's ready by the time an order
          exists, instead of racing the order-creation request. `key` forces a real remount
          (and a fresh network request) when the user clicks "Reintentar" after a load failure. */}
      <Script
        key={scriptRetryKey}
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={() => {
          setCulqiReady(true);
          setCulqiScriptError(false);
        }}
        onError={() => setCulqiScriptError(true)}
      />

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

      {paying && (
        <div className="flex items-center gap-3 rounded-md border border-secondary bg-secondary/10 px-4 py-3 text-sm text-secondary">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          Confirmando tu pago con el banco... no cierres ni recargues esta página.
        </div>
      )}

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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Método de pago</label>
          <Tabs
            value={paymentMethod}
            // Locked once the order exists — switching methods mid-flow would leave a reserved
            // order behind with no way to pay it through the newly-selected tab.
            onValueChange={(v) => !orderId && setPaymentMethod(v as PaymentMethod)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="card" disabled={!!orderId}>
                Tarjeta
              </TabsTrigger>
              <TabsTrigger value="yape_plin" disabled={!!orderId}>
                Yape / Plin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              {orderId && !publicKey && !paying && (
                <Button type="button" size="lg" className="w-full" onClick={() => handlePay(`fake_source_${orderId}`)}>
                  Pagar (modo de prueba)
                </Button>
              )}

              {orderId && publicKey && !culqiScriptError && !paying && (
                <Button type="button" size="lg" className="w-full" disabled={!culqiReady} onClick={openCulqiWidget}>
                  {culqiReady ? "Abrir pago" : "Cargando pasarela..."}
                </Button>
              )}

              {orderId && publicKey && culqiScriptError && !paying && (
                <div className="flex flex-col items-start gap-2 rounded-md border border-destructive px-4 py-3 text-sm text-destructive">
                  <p>
                    No se pudo cargar la pasarela de pago (checkout.culqi.com). Revisa la pestaña Network de tu
                    navegador, desactiva bloqueadores de anuncios/scripts para ese dominio, o prueba tu conexión.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCulqiScriptError(false);
                      setScriptRetryKey((k) => k + 1);
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              {!orderId && (
                <p className="text-sm text-muted-foreground">
                  Pago seguro con tarjeta de crédito o débito vía Culqi.
                </p>
              )}
            </TabsContent>

            <TabsContent value="yape_plin">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-center backdrop-blur-md">
                <QRCodeSVG value={STORE_PHONE_DISPLAY} size={160} bgColor="transparent" fgColor="#facc15" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Transfiere el total exacto a</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">{STORE_PHONE_DISPLAY}</span>
                    <button
                      type="button"
                      onClick={copyPhone}
                      aria-label="Copiar número"
                      className="text-zinc-500 hover:text-yellow-400"
                    >
                      {phoneCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="max-w-sm text-xs text-zinc-500">
                  Escanea el código o abre tu app de Yape/Plin y transfiere manualmente al número de arriba. Luego
                  ingresa el número de operación de tu comprobante abajo.
                </p>
              </div>

              {orderId && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="manualMethod"
                        checked={manualMethod === "yape"}
                        onChange={() => setManualMethod("yape")}
                      />
                      Pagué con Yape
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="manualMethod"
                        checked={manualMethod === "plin"}
                        onChange={() => setManualMethod("plin")}
                      />
                      Pagué con Plin
                    </label>
                  </div>
                  <input
                    required
                    value={operationNumber}
                    onChange={(e) => setOperationNumber(e.target.value)}
                    placeholder="Número de operación de tu comprobante"
                    className="h-10 rounded-md border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  />
                  <Button
                    type="button"
                    size="lg"
                    disabled={submittingManual || operationNumber.trim().length < 4}
                    onClick={handleSubmitManual}
                  >
                    {submittingManual ? "Enviando..." : "Ya transferí, enviar comprobante"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Tu pedido queda reservado. Verificaremos la transferencia y confirmaremos tu pedido — te
                    avisaremos por correo.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
      </form>
    </div>
  );
}
