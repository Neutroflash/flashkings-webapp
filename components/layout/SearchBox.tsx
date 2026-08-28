"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { formatPrice, cn } from "@/lib/utils";

interface SearchBoxProps {
  variant: "mobile" | "desktop";
  /** Mobile only: collapses the expanded search bar back to the icon button. */
  onClose?: () => void;
}

export function SearchBox({ variant, onClose }: SearchBoxProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results, loading } = useProductSearch(query);

  // Opens as soon as there's something to show a dropdown for, closes once the field is cleared.
  useEffect(() => {
    setOpen(query.trim().length > 0);
  }, [query]);

  // Closes the dropdown on an outside click — a plain blur would also fire when clicking a
  // result link, closing it before the click registers.
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function goToFullResults() {
    const trimmed = query.trim();
    setOpen(false);
    router.push(trimmed ? `/catalogo?search=${encodeURIComponent(trimmed)}` : "/catalogo");
    onClose?.();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goToFullResults();
  }

  function handleSelectResult() {
    setOpen(false);
    setQuery("");
    onClose?.();
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        // Desktop is a direct flex-item of the Navbar's row: needs its own flex-1/max-w/ml-auto
        // to size and position itself, rather than relying on a wrapper div — a wrapper with
        // flex-1 and this as its only (non-flex) child left it stuck against the wrapper's left
        // edge instead of filling toward the account/cart icons.
        variant === "desktop" ? "ml-auto hidden max-w-md flex-1 sm:block" : "w-full",
      )}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus={variant === "mobile"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder={variant === "mobile" ? "Buscar productos..." : "Buscar teclados, mouses, mousepads..."}
            className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-yellow-500/50"
          />
        </div>
        {variant === "mobile" && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 shadow-xl shadow-black/40 backdrop-blur-xl">
          {loading && results.length === 0 && <p className="px-4 py-3 text-sm text-zinc-500">Buscando...</p>}

          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-zinc-500">Sin resultados para &quot;{query.trim()}&quot;</p>
          )}

          {results.map((product) => {
            const image = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
            const price = product.variants[0]?.price;
            return (
              <Link
                key={product.id}
                href={`/producto/${product.slug}`}
                onClick={handleSelectResult}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={product.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">{product.name}</p>
                  <p className="truncate text-xs text-zinc-500">{product.brand}</p>
                </div>
                {price !== undefined && (
                  <span className="shrink-0 text-sm font-semibold text-yellow-400">{formatPrice(price)}</span>
                )}
              </Link>
            );
          })}

          {results.length > 0 && (
            <button
              type="button"
              onClick={goToFullResults}
              className="w-full border-t border-white/10 px-4 py-2.5 text-center text-xs font-medium text-yellow-400 hover:bg-white/5"
            >
              Ver todos los resultados
            </button>
          )}
        </div>
      )}
    </div>
  );
}
