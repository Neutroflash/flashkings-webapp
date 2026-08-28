export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProductImage {
  id: string;
  /** null = shared image (fallback for any variant with none of its own). */
  productVariantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

/** Mirrors the backend's PublicProductVariant: no costPrice, no exact stock count. */
export interface PublicProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  inStock: boolean;
  attributes: Record<string, unknown>;
}

/** Mirrors the backend's PublicProduct projection returned to CLIENT/anonymous requests. */
export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  isFeatured: boolean;
  category?: Category;
  images?: ProductImage[];
  variants: PublicProductVariant[];
  inStock: boolean;
}

export interface PaginatedProducts {
  items: PublicProduct[];
  total: number;
  page: number;
  pageSize: number;
}
