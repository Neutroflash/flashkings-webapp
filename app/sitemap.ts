import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flashkings.pe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // pageSize large enough to cover the whole catalog in one request — fine at this scale;
  // would need pagination across multiple sitemap files well before this becomes a bottleneck.
  const [{ items: products }, categories] = await Promise.all([
    getProducts({ page: 1 }).catch(() => ({ items: [] })),
    getCategories().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/catalogo?category=${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/producto/${product.slug}`,
    changeFrequency: "hourly", // mirrors the product page's ISR revalidate window
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
