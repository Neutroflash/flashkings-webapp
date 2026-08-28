import { cookies } from "next/headers";
import { SafeUser } from "@/types/auth";
import { Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Server Component fetch helper for the customer account area — same reasoning as
 * lib/admin-api.ts's adminFetch (Next's server-side fetch doesn't auto-attach the browser's
 * cookies), but for any authenticated user, not just ADMIN. Server-only (imports next/headers) —
 * client components (the profile form, the login/register pages) use lib/customer-auth.ts instead.
 */
async function customerFetch<T>(path: string): Promise<T> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Error al consultar la API (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

/** null for an anonymous visitor — used by /cuenta to decide whether to redirect to /cuenta/ingresar. */
export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const { user } = await customerFetch<{ user: SafeUser | null }>("/auth/me");
    return user;
  } catch {
    return null;
  }
}

export interface MyOrdersResult {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export function getMyOrdersServer(): Promise<MyOrdersResult> {
  return customerFetch<MyOrdersResult>("/orders/mine");
}
