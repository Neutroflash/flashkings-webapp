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
