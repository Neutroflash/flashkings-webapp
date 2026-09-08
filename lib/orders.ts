import { CartValidationResult, CreateOrderResponse, Order } from "@/types/order";

// Este módulo se consume desde los dos lados: el checkout y el carrito son componentes de
// cliente, pero getOrderById corre en el Server Component de la confirmación. Cada uno necesita
// su propia URL — ver lib/api-url.ts.
import { CLIENT_API_URL as API_URL, SERVER_API_URL } from "@/lib/api-url";

export interface CartLineInput {
  variantId: string;
  quantity: number;
}

export interface CheckoutFormInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  /** Calle y referencia. La ubicación que tarifa el envío son los tres campos siguientes. */
  shippingAddress: string;
  shippingDepartment: string;
  shippingProvince: string;
  shippingDistrict: string;
}

export interface ShippingQuote {
  zone: "LIMA_METROPOLITANA" | "PROVINCIA";
  cost: number;
}

/** Cotiza el flete para mostrarlo antes de pagar. El servidor lo vuelve a calcular al crear la
 * orden — esto es solo para que el cliente vea el total real mientras llena el formulario. */
export async function quoteShipping(department: string, province: string): Promise<ShippingQuote | null> {
  const params = new URLSearchParams({ department, province });
  const res = await fetch(`${API_URL}/orders/shipping/quote?${params.toString()}`);
  if (!res.ok) return null;
  return (await res.json()) as ShippingQuote;
}

export async function fetchDepartments(): Promise<string[]> {
  const res = await fetch(`${API_URL}/orders/shipping/departments`);
  if (!res.ok) return [];
  const body = (await res.json()) as { departments?: string[] };
  return body.departments ?? [];
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

/** Server-side fetch for the confirmation page — order status changes, so never ISR-cache it.
 * Usa SERVER_API_URL: acá no hay origen contra el cual resolver una ruta relativa. */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`${SERVER_API_URL}/orders/${orderId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { order } = (await res.json()) as { order: Order };
  return order;
}
