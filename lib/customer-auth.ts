import { SafeUser } from "@/types/auth";
import { Order } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Client-safe: used from the Navbar, checkout, and /cuenta — all client components. Cookies
// travel via credentials: "include", never a token in JS-readable storage.

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

async function parseUserResponse(res: Response): Promise<SafeUser> {
  const body = (await res.json()) as { user?: SafeUser; error?: string };
  if (!res.ok || !body.user) {
    throw new Error(body.error ?? "No se pudo completar la solicitud");
  }
  return body.user;
}

export async function registerCustomer(data: RegisterInput): Promise<SafeUser> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  await parseUserResponse(res);
  // /auth/register doesn't set the session cookie (only /auth/login does) — log in right after
  // so registering also leaves the customer signed in, in one step.
  return loginCustomer(data);
}

export async function loginCustomer(data: LoginInput): Promise<SafeUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseUserResponse(res);
}

export async function logoutCustomer(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

/** Returns null for an anonymous visitor — never throws, so callers don't need a try/catch. */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  const body = (await res.json()) as { user: SafeUser | null };
  return body.user;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  defaultAddress?: string | null;
}

export async function updateMyProfile(data: UpdateProfileInput): Promise<SafeUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseUserResponse(res);
}

export interface MyOrdersResult {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getMyOrders(): Promise<MyOrdersResult> {
  const res = await fetch(`${API_URL}/orders/mine`, { credentials: "include" });
  if (!res.ok) throw new Error("No se pudo cargar tu historial de pedidos");
  return res.json() as Promise<MyOrdersResult>;
}
