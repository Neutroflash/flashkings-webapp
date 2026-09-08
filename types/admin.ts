import { Category, ProductImage } from "./product";

/** Raw (non-sanitized) shapes returned by the backend only when requesterRole === 'ADMIN'. */
export interface AdminProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  reservedStock: number;
  attributes: Record<string, unknown>;
  /** Baja lógica: una variante inactiva no se vende ni aparece en el catálogo público. */
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  isFeatured: boolean;
  /** Baja lógica: un producto inactivo sale del catálogo, la búsqueda y el sitemap. */
  isActive: boolean;
  category?: Category;
  images?: ProductImage[];
  variants: AdminProductVariant[];
}

/** Categoría con su conteo de productos — solo se puede borrar una que esté en cero. */
export interface AdminCategory extends Category {
  productCount: number;
}
