"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AdminProduct } from "@/types/admin";
import { Category } from "@/types/product";
import { updateProduct } from "@/lib/admin-mutations";
import { triggerRevalidate } from "@/lib/revalidate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

interface EditProductModalProps {
  product: AdminProduct;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductModal({ product, categories, open, onOpenChange }: EditProductModalProps) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [brand, setBrand] = useState(product.brand);
  const [categoryId, setCategoryId] = useState(product.category?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateProduct(product.id, {
        name,
        description: description || undefined,
        brand,
        categoryId,
        isFeatured,
      });
      router.refresh();
      // /producto/[slug] revalidates every 3600s (public SEO tuning) — ping it directly so a
      // category/name edit shows up there immediately instead of up to an hour later.
      void triggerRevalidate([`/producto/${product.slug}`, "/catalogo", "/"]);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el producto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-zinc-100">Editar — {product.name}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar" className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Nombre</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={cn(inputClass, "w-full")} />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={cn(inputClass, "h-auto w-full resize-none py-2")}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Marca</label>
              <input required value={brand} onChange={(e) => setBrand(e.target.value)} className={cn(inputClass, "w-full")} />
            </div>

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Categoría</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={cn(inputClass, "w-full text-zinc-100")}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/30"
              />
              Destacado
            </label>

            <p className="text-xs text-zinc-600">
              El slug ({product.slug}) y el SKU de cada variante no son editables: protegen la URL pública ya
              indexada y la trazabilidad del inventario.
            </p>

            {error && <span className="text-xs text-destructive">{error}</span>}

            <Button type="submit" size="sm" disabled={submitting} className="mt-1 self-start">
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
