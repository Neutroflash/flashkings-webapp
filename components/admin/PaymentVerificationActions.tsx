"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderPayment } from "@/types/order";
import { confirmManualPayment, rejectManualPayment } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

const METHOD_LABELS: Record<string, string> = { yape: "Yape", plin: "Plin" };

export function PaymentVerificationActions({ orderId, payment }: { orderId: string; payment: OrderPayment }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (payment.status !== "pending_verification") return null;

  async function handleConfirm() {
    setLoading("confirm");
    setError(null);
    try {
      await confirmManualPayment(orderId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo confirmar el pago");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    setError(null);
    try {
      await rejectManualPayment(orderId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo rechazar el pago");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5">
      <div>
        <span className="text-xs uppercase tracking-wide text-yellow-400/80">Pago manual pendiente de verificación</span>
        <p className="mt-1 text-sm text-zinc-300">
          Método: <span className="font-semibold">{METHOD_LABELS[payment.provider] ?? payment.provider}</span> ·
          Número de operación: <span className="font-mono">{payment.providerChargeId}</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Revisa tu app de Yape/Plin para confirmar que la transferencia con ese número de operación llegó, por el
          monto exacto de la orden.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={loading !== null} onClick={handleConfirm}>
          {loading === "confirm" ? "Confirmando..." : "Confirmar pago"}
        </Button>
        <Button size="sm" variant="outline" disabled={loading !== null} onClick={handleReject}>
          {loading === "reject" ? "Rechazando..." : "Rechazar"}
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
