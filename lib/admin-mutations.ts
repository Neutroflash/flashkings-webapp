import { InvoiceType, Order, OrderInvoice, OrderStatus, Refund, RefundReason } from "@/types/order";
import { AdminCategory, AdminProductVariant } from "@/types/admin";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Client-safe: no next/headers import, so this can be imported from "use client" components
// (InventoryTable/OrderStatusActions) — the browser sends cookies automatically via credentials: "include".

/** Same /auth/logout endpoint the customer account area uses (it doesn't distinguish by role,
 * just clears the auth cookies) — named separately here since it's called from the admin sidebar. */
export async function logoutAdmin(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function updateProductVariant(
  variantId: string,
  data: { price?: number; costPrice?: number; stock?: number; isActive?: boolean },
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
  /** null = shared image (fallback for any variant with none of its own). */
  productVariantId?: string | null;
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

// name/description/brand/categoryId/isFeatured only — slug and variant SKUs are permanently
// immutable (URL/SEO continuity and inventory-trace continuity, respectively), so the backend
// doesn't even accept them here.
export interface UpdateProductInput {
  name?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  isFeatured?: boolean;
}

export async function updateProduct(productId: string, data: UpdateProductInput): Promise<void> {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo actualizar el producto");
  }
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface CreateCategoryResult {
  id: string;
  name: string;
  slug: string;
}

export async function createCategory(data: CreateCategoryInput): Promise<CreateCategoryResult> {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { category?: CreateCategoryResult; error?: string };
  if (!res.ok || !body.category) {
    throw new Error(body.error ?? "No se pudo crear la categoría");
  }
  return body.category;
}

export interface CreateProductVariantInput {
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  brand: string;
  categoryId: string;
  isFeatured?: boolean;
  variants: CreateProductVariantInput[];
}

export interface CreateProductResult {
  id: string;
  slug: string;
}

export async function createProduct(data: CreateProductInput): Promise<CreateProductResult> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { product?: CreateProductResult; error?: string };
  if (!res.ok || !body.product) {
    throw new Error(body.error ?? "No se pudo crear el producto");
  }
  return body.product;
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

export interface IssueInvoiceInput {
  type: InvoiceType;
  documentType: string;
  documentNumber: string;
  businessName?: string;
}

export async function issueInvoice(orderId: string, data: IssueInvoiceInput): Promise<OrderInvoice> {
  const res = await fetch(`${API_URL}/admin/orders/${orderId}/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { invoice?: OrderInvoice; error?: string };
  if (!res.ok || !body.invoice) {
    throw new Error(body.error ?? "No se pudo emitir el comprobante");
  }
  return body.invoice;
}

export interface RefundOrderInput {
  /** Omitido = se devuelve todo el saldo pendiente de la orden. */
  amount?: number;
  items?: { orderItemId: string; quantity: number }[];
  reasonCode: string;
  reasonText?: string;
  isManual?: boolean;
  restock?: boolean;
  /** Devolver también el flete. Si se omite, el servidor lo sugiere según el motivo. */
  refundShipping?: boolean;
}

export async function refundOrder(orderId: string, data: RefundOrderInput): Promise<{ refund: Refund; order: Order }> {
  const res = await fetch(`${API_URL}/admin/orders/${orderId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { refund?: Refund; order?: Order; error?: string };
  if (!res.ok || !body.refund || !body.order) {
    throw new Error(body.error ?? "No se pudo registrar el reembolso");
  }
  return { refund: body.refund, order: body.order };
}

/** Emite ante SUNAT la nota de crédito que documenta un reembolso ya hecho. */
export async function issueCreditNote(refundId: string): Promise<OrderInvoice> {
  const res = await fetch(`${API_URL}/admin/orders/refunds/${refundId}/credit-note`, {
    method: "POST",
    credentials: "include",
  });
  const body = (await res.json()) as { invoice?: OrderInvoice; error?: string };
  if (!res.ok || !body.invoice) {
    throw new Error(body.error ?? "No se pudo emitir la nota de crédito");
  }
  return body.invoice;
}

/** Catálogo 09 de SUNAT, servido por el backend para no duplicarlo acá. */
export async function fetchRefundReasons(): Promise<RefundReason[]> {
  const res = await fetch(`${API_URL}/admin/orders/refunds/reasons`, { credentials: "include" });
  if (!res.ok) return [];
  const body = (await res.json()) as { reasons?: RefundReason[] };
  return body.reasons ?? [];
}

/** Baja/alta lógica de un producto. Un producto con ventas no se puede borrar — se desactiva. */
export async function setProductActive(productId: string, isActive: boolean): Promise<void> {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo cambiar el estado del producto");
  }
}

export async function setVariantActive(variantId: string, isActive: boolean): Promise<void> {
  await updateProductVariant(variantId, { isActive });
}

/** Borra de verdad. Solo funciona si nunca se vendió; si tiene ventas devuelve 409. */
export async function deleteProduct(productId: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/${productId}`, { method: "DELETE", credentials: "include" });
  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo borrar el producto");
  }
}

export interface AddVariantInput {
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  attributes?: Record<string, unknown>;
}

export async function addProductVariant(productId: string, data: AddVariantInput): Promise<AdminProductVariant> {
  const res = await fetch(`${API_URL}/products/${productId}/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { variant?: AdminProductVariant; error?: string };
  if (!res.ok || !body.variant) {
    throw new Error(body.error ?? "No se pudo agregar la variante");
  }
  return body.variant;
}

export async function deleteProductVariant(variantId: string): Promise<void> {
  const res = await fetch(`${API_URL}/products/variants/${variantId}`, { method: "DELETE", credentials: "include" });
  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo borrar la variante");
  }
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const res = await fetch(`${API_URL}/categories/admin`, { credentials: "include" });
  if (!res.ok) return [];
  const body = (await res.json()) as { categories?: AdminCategory[] };
  return body.categories ?? [];
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string | null },
): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo actualizar la categoría");
  }
}

/** Solo categorías vacías. Con productos devuelve 409 pidiendo reasignarlos primero. */
export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok && res.status !== 204) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo borrar la categoría");
  }
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Sube una imagen DIRECTO a Cloudinary: el backend solo firma la operación, el archivo nunca pasa
 * por él. Es deliberado — hacer de intermediario de subidas en un servicio de 512 MB de RAM es la
 * forma más rápida de tumbarlo.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const sigRes = await fetch(`${API_URL}/products/images/upload-signature`, { credentials: "include" });
  if (!sigRes.ok) {
    const body = (await sigRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "No se pudo preparar la subida");
  }
  const sig = (await sigRes.json()) as UploadSignature;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const upload = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!upload.ok) {
    throw new Error("Cloudinary rechazó la imagen");
  }
  const result = (await upload.json()) as { secure_url?: string };
  if (!result.secure_url) {
    throw new Error("Cloudinary no devolvió una URL");
  }
  return result.secure_url;
}

export async function respondComplaint(complaintId: string, providerResponse: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/complaints/${complaintId}/respond`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ providerResponse }),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error ?? "No se pudo registrar la respuesta");
  }
}
