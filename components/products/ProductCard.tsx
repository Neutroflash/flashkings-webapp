"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { PublicProduct } from "@/types/product";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

// Pulls up to 3 short spec values from the primary variant's free-form attributes JSON
// (e.g. { weight: "49g", sensor: "PAW3395", pollingRate: "8KHz" }) for the hover overlay.
function getSpecHighlights(product: PublicProduct): string[] {
  const attributes = product.variants[0]?.attributes ?? {};
  return Object.values(attributes)
    .map((value) => String(value))
    .slice(0, 3);
}

export function ProductCard({ product }: { product: PublicProduct }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const cheapestVariant = product.variants.reduce((min, v) => (v.price < min.price ? v : min), product.variants[0]);
  const quickAddVariant = product.variants.find((v) => v.inStock);
  const specs = getSpecHighlights(product);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!quickAddVariant) return;

    addItem({
      variantId: quickAddVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: quickAddVariant.name,
      price: quickAddVariant.price,
      imageUrl: primaryImage?.url,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md transition-all duration-300 hover:border-yellow-500/50 hover:shadow-[0_0_25px_rgba(250,204,21,0.15)]">
      {/* Stretched link: makes the whole card clickable while leaving the quick-add button
          (rendered above it with a higher z-index) independently clickable. */}
      <Link href={`/producto/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />

      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Sin imagen</div>
        )}

        <div className="absolute right-2 top-2 z-20">
          <AvailabilityBadge inStock={product.inStock} />
        </div>

        {specs.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {specs.map((spec) => (
              <span
                key={spec}
                className="rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {quickAddVariant && (
          <motion.button
            onClick={handleQuickAdd}
            whileTap={{ scale: 0.94 }}
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-xs font-bold text-black opacity-0 shadow-glow-gold transition-all duration-300 ease-out hover:bg-yellow-300 group-hover:translate-y-0 group-hover:opacity-100"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Agregado
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Agregar
              </>
            )}
          </motion.button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</span>
        <h3 className="line-clamp-2 font-semibold text-foreground">{product.name}</h3>
        <div className="mt-auto pt-2 text-lg font-bold text-yellow-400">{formatPrice(cheapestVariant.price)}</div>
      </div>
    </div>
  );
}
