import Image from "next/image";
import Link from "next/link";
import { PublicProduct } from "@/types/product";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: PublicProduct }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const minPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-neon-gold"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Sin imagen</div>
        )}
        <div className="absolute right-2 top-2">
          <AvailabilityBadge inStock={product.inStock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</span>
        <h3 className="line-clamp-2 font-semibold text-foreground">{product.name}</h3>
        <div className="mt-auto pt-2 text-lg font-bold text-primary">{formatPrice(minPrice)}</div>
      </div>
    </Link>
  );
}
