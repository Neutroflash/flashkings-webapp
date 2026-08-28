"use client";

import { useMemo, useState } from "react";
import { PublicProduct } from "@/types/product";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { ProductGallery } from "./ProductGallery";
import { ProductSpecs } from "./ProductSpecs";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function ProductDetail({ product }: { product: PublicProduct }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId],
  );

  const images = product.images ?? [];
  // Mirrors ProductGallery's own fallback logic: prefer whatever's actually shown for the
  // selected variant, so the cart thumbnail matches what the customer was just looking at.
  const variantImages = images.filter((img) => img.productVariantId === selectedVariantId);
  const sharedImages = images.filter((img) => img.productVariantId === null);
  const primaryImage =
    (variantImages.length > 0 ? variantImages : sharedImages).find((img) => img.isPrimary) ??
    (variantImages[0] ?? sharedImages[0]);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      imageUrl: primaryImage?.url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Keyed by variant so ProductGallery's activeIndex/failedIds state resets cleanly when
          switching variants, instead of pointing at a now-different image set. */}
      <ProductGallery
        key={selectedVariantId}
        images={images}
        productName={product.name}
        categorySlug={product.category?.slug}
        selectedVariantId={selectedVariantId}
      />

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

        {/* Keyed by variant so the accordion resets to "open" when the customer switches variants
            (e.g. a different switch type changes what's actually worth showing). */}
        {selectedVariant && <ProductSpecs key={selectedVariant.id} attributes={selectedVariant.attributes} />}
      </div>
    </div>
  );
}
