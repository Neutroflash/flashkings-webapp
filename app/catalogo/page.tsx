import { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { CategoryFilter } from "@/components/products/CategoryFilter";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora nuestro catálogo completo de periféricos gaming.",
};

interface CatalogoPageProps {
  searchParams: { category?: string; search?: string };
}

// Server Component: reads filters straight from the URL search params and
// fetches already-filtered data server-side — no client-side fetch waterfall.
export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const [{ items: products }, categories] = await Promise.all([
    getProducts({ category: searchParams.category, search: searchParams.search }),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-3xl font-bold">Catálogo</h1>
        <CategoryFilter categories={categories} activeSlug={searchParams.category} />
      </div>
      <CatalogGrid products={products} />
    </div>
  );
}
