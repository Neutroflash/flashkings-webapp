import { useEffect, useState } from "react";
import { PublicProduct } from "@/types/product";
import { searchProductsLive } from "@/lib/search";

const DEBOUNCE_MS = 250;

/**
 * Debounced live search, filtering as soon as there's a first character — no Enter needed.
 * Guards against out-of-order responses (a slow request for an earlier keystroke resolving
 * after a newer one) with a `cancelled` flag, since the debounce timer alone only stops
 * requests that never fired, not ones already in flight.
 */
export function useProductSearch(query: string) {
  const [results, setResults] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const items = await searchProductsLive(trimmed);
        if (!cancelled) setResults(items);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return { results, loading };
}
