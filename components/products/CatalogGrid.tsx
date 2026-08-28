import { PublicProduct } from "@/types/product";
import { ProductCard } from "./ProductCard";

export function CatalogGrid({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">No se encontraron productos.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
