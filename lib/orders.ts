import { CartValidationResult, CreateOrderResponse, Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface CheckoutFormInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

/** Client-side POST helper — sends cookies (credentials: include) so a logged-in user's order links to their account. */
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Error al consultar la API (${res.status}): ${path}`);
  }
  return data;
}

/** Non-authoritative UX check before the cart drawer routes to /checkout. */
export function validateCart(items: CartLineInput[]): Promise<CartValidationResult> {
  return apiPost<CartValidationResult>("/orders/validate-cart", { items });
}

/** "Iniciar Pago": reserves stock for 15 minutes and creates the PENDING_PAYMENT order. */
export function createOrder(form: CheckoutFormInput, items: CartLineInput[]): Promise<CreateOrderResponse> {
  return apiPost<CreateOrderResponse>("/orders", { ...form, items });
}

export function chargeOrder(orderId: string, sourceId: string): Promise<{ order: Order; status: string }> {
  return apiPost<{ order: Order; status: string }>("/payments/charge", { orderId, sourceId });
}

/** Manual Yape/Plin: does not mark the order PAID — stays PENDING_PAYMENT until an admin confirms it. */
export function submitManualPayment(
  orderId: string,
  method: "yape" | "plin",
  operationNumber: string,
): Promise<{ order: Order }> {
  return apiPost<{ order: Order }>("/payments/manual", { orderId, method, operationNumber });
}

/** Server-side fetch for the confirmation page — order status changes, so never ISR-cache it. */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`${API_URL}/orders/${orderId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = (await res.json()) as { order: Order };
  return order;
}
