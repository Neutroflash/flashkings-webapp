"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@/types/order";
import { updateOrderStatus } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

// Mirrors ALLOWED_MANUAL_TRANSITIONS in the backend (domain/entities/Order.ts) — only shows
// the single valid next transition, since PAID/PENDING_PAYMENT/CANCELLED are system-managed.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: "IN_PREPARATION",
  IN_PREPARATION: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Marcar en preparación",
  IN_PREPARATION: "Marcar como enviado",
  SHIPPED: "Marcar como entregado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function OrderStatusActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const nextStatus = NEXT_STATUS[status];
  if (!nextStatus) return null;

  // Moving to SHIPPED triggers OrderShippedEmail with these details — ask for them here.
  const needsShippingDetails = nextStatus === "SHIPPED";

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await updateOrderStatus(
        orderId,
        nextStatus!,
        needsShippingDetails
          ? { trackingNumber: trackingNumber || undefined, courier: courier || undefined }
          : undefined,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {needsShippingDetails && (
        <div className="flex flex-wrap gap-2">
          <input
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="Courier (Olva, Shalom...)"
            className="h-9 w-48 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50"
          />
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Número de seguimiento"
            className="h-9 w-48 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50"
          />
        </div>
      )}
      <Button size="sm" disabled={loading} onClick={handleClick}>
        {loading ? "Actualizando..." : LABELS[status]}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
