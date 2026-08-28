import { cookies } from "next/headers";
import { AdminProduct } from "@/types/admin";
import { Order, OrderStatus } from "@/types/order";
import { SafeUser } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Server Component fetch helper for admin data. Next's server-side `fetch` does not
 * auto-attach the browser's cookies, so the incoming request's Cookie header is forwarded
 * explicitly. Always `cache: "no-store"` — admin data must never be ISR-cached.
 *
 * Server-only (imports next/headers) — client components must import mutations from
 * lib/admin-mutations.ts instead, or the whole module (including this import) ships to the browser.
 */
async function adminFetch<T>(path: string): Promise<T> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al consultar la API admin (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const { user } = await adminFetch<{ user: SafeUser | null }>("/auth/me");
    return user;
  } catch {
    return null;
  }
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { items } = await adminFetch<{ items: AdminProduct[] }>("/products?pageSize=100");
  return items;
}

export interface PaginatedAdminOrders {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAdminOrders(status?: OrderStatus): Promise<PaginatedAdminOrders> {
  const query = status ? `?status=${status}` : "";
  return adminFetch<PaginatedAdminOrders>(`/admin/orders${query}`);
}

export async function getAdminOrderById(orderId: string): Promise<Order | null> {
  try {
    const { order } = await adminFetch<{ order: Order }>(`/admin/orders/${orderId}`);
    return order;
  } catch {
    return null;
  }
}
