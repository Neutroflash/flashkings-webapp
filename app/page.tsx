import { getProducts } from "@/lib/api";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";

// Server Component: fetched on the server (ISR, revalidate: 60s in lib/api.ts).
// No client-side loading spinner needed — HTML arrives with data already in it.
export default async function HomePage() {
  const { items: featuredProducts } = await getProducts({ featured: true });

  return (
    <div className="flex flex-col gap-16">
      <HeroSection />

      <BrandMarquee />

      <section>
        <h2 className="mb-6 text-2xl font-bold">Productos destacados</h2>
        <CatalogGrid products={featuredProducts} />
      </section>
    </div>
  );
}
