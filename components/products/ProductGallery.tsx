"use client";

import { useState } from "react";
import Image from "next/image";
import { Keyboard, Mouse } from "lucide-react";
import { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Picks the fallback glyph (keyboard vs mouse) — falls back to keyboard for any other category. */
  categorySlug?: string;
}

function GalleryFallback({ categorySlug }: { categorySlug?: string }) {
  const Icon = categorySlug?.includes("mouse") ? Mouse : Keyboard;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
      <div className="rounded-full border border-yellow-500/30 bg-yellow-500/5 p-6 shadow-[0_0_40px_rgba(250,204,21,0.15)]">
        <Icon className="h-12 w-12 text-yellow-400/70" strokeWidth={1.5} />
      </div>
      <span className="text-xs uppercase tracking-widest text-zinc-600">Imagen no disponible</span>
    </div>
  );
}

export function ProductGallery({ images, productName, categorySlug }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Tracks image ids whose network/decode failed (onError), independent of activeIndex, so a
  // thumbnail that failed once stays showing its own fallback glyph instead of a broken image icon.
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const activeImage = images[activeIndex];
  const activeFailed = !activeImage || failedIds.has(activeImage.id);

  function markFailed(id: string) {
    setFailedIds((prev) => new Set(prev).add(id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
        {!activeFailed ? (
          <Image
            key={activeImage.id}
            src={activeImage.url}
            alt={activeImage.altText ?? productName}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
            onError={() => markFailed(activeImage.id)}
          />
        ) : (
          <GalleryFallback categorySlug={categorySlug} />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => {
            const failed = failedIds.has(image.id);
            return (
              <button
                key={image.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors",
                  index === activeIndex
                    ? "border-yellow-500/70 shadow-[0_0_12px_rgba(250,204,21,0.2)]"
                    : "border-zinc-800/80 hover:border-zinc-600",
                )}
              >
                {!failed ? (
                  <Image
                    src={image.url}
                    alt={image.altText ?? productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                    onError={() => markFailed(image.id)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-900">
                    <Keyboard className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
