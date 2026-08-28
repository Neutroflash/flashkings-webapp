"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/catalogo?search=${encodeURIComponent(trimmed)}` : "/catalogo");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-xl font-black tracking-tight text-primary">
          FLASH<span className="text-secondary">KINGS</span>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium md:flex">
          <Link href="/catalogo" className="text-foreground/80 hover:text-primary">
            Catálogo
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="ml-auto flex flex-1 max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar teclados, mouses, mousepads..."
              className="h-10 w-full rounded-md border border-border bg-muted pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </form>

        <Button variant="outline" size="icon" className="relative" onClick={openCart} aria-label="Abrir carrito">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
