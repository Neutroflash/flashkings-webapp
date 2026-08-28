"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { PublicProduct } from "@/types/product";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: PublicProduct }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  );

  const images = product.images ?? [];
  const activeImage = images[activeImageIndex];

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      imageUrl: activeImage?.url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Sin imagen</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                  index === activeImageIndex ? "border-primary" : "border-border"
                }`}
              >
                <Image src={image.url} alt={image.altText ?? product.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand}</span>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <AvailabilityBadge inStock={product.inStock} />

        <p className="text-3xl font-black text-primary">
          {selectedVariant ? formatPrice(selectedVariant.price) : "--"}
        </p>

        {product.description && <p className="text-muted-foreground">{product.description}</p>}

        {product.variants.length > 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Variante</span>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  disabled={!variant.inStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    variant.id === selectedVariantId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          size="lg"
          disabled={!selectedVariant?.inStock}
          onClick={handleAddToCart}
          className="mt-4 w-full sm:w-auto"
        >
          {added ? "¡Agregado!" : selectedVariant?.inStock ? "Agregar al carrito" : "Agotado"}
        </Button>
      </div>
    </div>
  );
}
