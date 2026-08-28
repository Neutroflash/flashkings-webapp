import { OrderStatus } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Client-safe: no next/headers import, so this can be imported from "use client" components
// (InventoryTable/OrderStatusActions) — the browser sends cookies automatically via credentials: "include".

export async function updateProductVariant(
  variantId: string,
  data: { price?: number; costPrice?: number; stock?: number },
): Promise<void> {
  const res = await fetch(`${API_URL}/products/variants/${variantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo actualizar la variante");
  }
}

export interface UpdateOrderStatusShippingDetails {
  trackingNumber?: string;
  courier?: string;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  shippingDetails?: UpdateOrderStatusShippingDetails,
): Promise<void> {
  const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, ...shippingDetails }),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo actualizar el estado de la orden");
  }
}
