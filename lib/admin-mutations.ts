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

export interface ProductImageInput {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export async function addProductImage(productId: string, data: ProductImageInput): Promise<void> {
  const res = await fetch(`${API_URL}/products/${productId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo agregar la imagen");
  }
}

export async function updateProductImage(
  imageId: string,
  data: Partial<ProductImageInput>,
): Promise<void> {
  const res = await fetch(`${API_URL}/products/images/${imageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo actualizar la imagen");
  }
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/images/${imageId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo eliminar la imagen");
  }
}

async function postAdminAction(path: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, { method: "POST", credentials: "include" });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "La acción no se pudo completar");
  }
}

/** Confirms a manual Yape/Plin payment after the admin verifies the transfer in their own app. */
export function confirmManualPayment(orderId: string): Promise<void> {
  return postAdminAction(`/admin/orders/${orderId}/confirm-payment`);
}

/** Rejects a manual Yape/Plin payment claim — releases the held stock instead of leaving it locked. */
export function rejectManualPayment(orderId: string): Promise<void> {
  return postAdminAction(`/admin/orders/${orderId}/reject-payment`);
}
