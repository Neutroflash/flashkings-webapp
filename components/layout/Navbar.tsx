"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, ShoppingCart, User, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const { data: currentUser } = useCurrentUser();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/catalogo?search=${encodeURIComponent(trimmed)}` : "/catalogo");
    setMobileSearchOpen(false);
  }

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-auto sm:max-w-7xl sm:px-4">
      <div className="flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:gap-4 sm:px-4">
        {mobileSearchOpen ? (
          // Below sm, the search input takes over the whole bar instead of squeezing in next to
          // the logo/cart — there isn't enough width for both on a narrow phone otherwise.
          <form onSubmit={handleSearch} className="flex w-full items-center gap-2 sm:hidden">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-yellow-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Cerrar búsqueda"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <>
            <Link href="/" className="shrink-0 text-xl font-black tracking-tight">
              FLASH<span className="text-gradient-gold">KINGS</span>
            </Link>

            <nav className="hidden gap-6 text-sm font-medium md:flex">
              <Link href="/catalogo" className="text-foreground/80 transition-colors hover:text-yellow-400">
                Catálogo
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Buscar"
              className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:border-yellow-500/50 sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            <form onSubmit={handleSearch} className="ml-auto hidden max-w-md flex-1 items-center gap-2 sm:flex">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar teclados, mouses, mousepads..."
                  className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-yellow-500/50"
                />
              </div>
            </form>

            <Link href={currentUser ? "/cuenta" : "/cuenta/ingresar"}>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full border-white/10 bg-white/5 hover:border-yellow-500/50"
                aria-label={currentUser ? "Mi cuenta" : "Iniciar sesión"}
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              className="relative shrink-0 rounded-full border-white/10 bg-white/5 hover:border-yellow-500/50"
              onClick={openCart}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black">
                  {totalItems}
                </span>
              )}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
