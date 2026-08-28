import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api";
import { ProductDetail } from "@/components/products/ProductDetail";
import { PublicProduct } from "@/types/product";

interface ProductPageProps {
  params: { slug: string };
}

// ISR: product pages are rebuilt in the background at most once an hour and served instantly
// from Vercel's CDN in between — a product's price/stock can lag up to this long.
export const revalidate = 3600;

// Pulls a short "key specs" string from the primary variant's free-form attributes JSON
// (e.g. { sensor: "PAW3395", weight: "59g", switch: "Huano Blue" }) for the meta description.
function buildSpecsSummary(product: PublicProduct): string {
  const attributes = product.variants[0]?.attributes ?? {};
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

// generateMetadata runs server-side, giving each product page unique SEO tags
// without shipping any extra JS to the client.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Producto no encontrado" };

  const specs = buildSpecsSummary(product);
  const description = [product.description, specs].filter(Boolean).join(" — ") || `${product.name} - ${product.brand}`;
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const title = `${product.name} | Flashkings Perú`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/producto/${product.slug}`,
      images: primaryImage
        ? [{ url: primaryImage.url, width: 800, height: 800, alt: primaryImage.altText ?? product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
