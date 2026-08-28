import Link from "next/link";
import { getProducts } from "@/lib/api";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { Button } from "@/components/ui/button";

// Server Component: fetched on the server (ISR, revalidate: 60s in lib/api.ts).
// No client-side loading spinner needed — HTML arrives with data already in it.
export default async function HomePage() {
  const { items: featuredProducts } = await getProducts({ featured: true });

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          Domina el juego con periféricos <span className="text-primary">de alto rendimiento</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Teclados mecánicos, mouses de precisión y mousepads gaming, seleccionados para jugadores competitivos en
          Perú.
        </p>
        <Button asChild size="lg">
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Productos destacados</h2>
        <CatalogGrid products={featuredProducts} />
      </section>
    </div>
  );
}
