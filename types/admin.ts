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
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  isFeatured: boolean;
  category?: Category;
  images?: ProductImage[];
  variants: AdminProductVariant[];
}
