import { PublicProduct } from "@/types/product";

import { CLIENT_API_URL as API_URL } from "@/lib/api-url";

// Capped tight — this feeds a live dropdown, not a results page. "Ver todos los resultados"
// (in SearchBox) is what takes the shopper to the full, paginated /catalogo search.
const LIVE_RESULTS_LIMIT = 6;

// Client-safe: called on every keystroke (debounced) from the Navbar's search box.
export async function searchProductsLive(query: string): Promise<PublicProduct[]> {
  const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&pageSize=${LIVE_RESULTS_LIMIT}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items: PublicProduct[] };
  return data.items;
}
