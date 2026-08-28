import { Category, PaginatedProducts, PublicProduct } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface ProductListParams {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
}

/**
 * Server-side fetch helper. Runs in Server Components, so it executes on the
 * server at request/build time (SSR/ISR) — never ships fetch logic to the client bundle.
 */
async function apiFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Error al consultar la API (${res.status}): ${path}`);
  }

  return res.json() as Promise<T>;
}

const EMPTY_PRODUCTS: PaginatedProducts = { items: [], total: 0, page: 1, pageSize: 20 };

export async function getProducts(params: ProductListParams = {}): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.featured !== undefined) query.set("featured", String(params.featured));
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));

  const queryString = query.toString();
  try {
    // Catalog listings change often (stock, new products): short revalidation window (ISR).
    return await apiFetch<PaginatedProducts>(`/products${queryString ? `?${queryString}` : ""}`, 60);
  } catch {
    // Lets `next build`/ISR revalidation survive a temporarily unreachable API (e.g. mid-deploy,
    // or a CI build with no live backend) instead of failing the whole page — same reasoning as
    // getProductBySlug/getCategories below.
    return EMPTY_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  try {
    // Matches the page's `export const revalidate = 3600` (app/producto/[slug]/page.tsx) —
    // an explicit fetch-level revalidate always wins over the segment default, so they must agree.
    const { product } = await apiFetch<{ product: PublicProduct }>(`/products/${slug}`, 3600);
    return product;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    // Categories change rarely: longer revalidation window than the product listing.
    const { categories } = await apiFetch<{ categories: Category[] }>("/categories", 3600);
    return categories;
  } catch {
    return [];
  }
}
