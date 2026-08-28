"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { ImagePlus, Star, Trash2, X } from "lucide-react";
import { AdminProduct } from "@/types/admin";
import { addProductImage, deleteProductImage, updateProductImage } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

interface ProductImagesModalProps {
  product: AdminProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImagesModal({ product, open, onOpenChange }: ProductImagesModalProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const images = product.images ?? [];

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // First image for a product defaults to primary — otherwise the storefront would have
      // no primary image to show on the catalog grid.
      await addProductImage(product.id, { url, altText: altText || undefined, isPrimary: images.length === 0 });
      setUrl("");
      setAltText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar la imagen");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetPrimary(imageId: string) {
    setBusyImageId(imageId);
    setError(null);
    try {
      await updateProductImage(imageId, { isPrimary: true });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la imagen");
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleDelete(imageId: string) {
    setBusyImageId(imageId);
    setError(null);
    try {
      await deleteProductImage(imageId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la imagen");
    } finally {
      setBusyImageId(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-zinc-100">Imágenes — {product.name}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar" className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {images.length > 0 ? (
            <div className="mb-5 grid grid-cols-4 gap-2">
              {images.map((image) => (
                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-800">
                  <Image src={image.url} alt={image.altText ?? ""} fill className="object-cover" unoptimized />
                  {image.isPrimary && (
                    <span className="absolute left-1 top-1 rounded bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-black/70 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        disabled={busyImageId === image.id}
                        onClick={() => handleSetPrimary(image.id)}
                        title="Marcar como principal"
                        className="text-zinc-300 hover:text-yellow-400 disabled:opacity-50"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyImageId === image.id}
                      onClick={() => handleDelete(image.id)}
                      title="Eliminar"
                      className="text-zinc-300 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-5 text-sm text-zinc-500">Este producto todavía no tiene imágenes.</p>
          )}

          <form onSubmit={handleAdd} className="flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
            <label className="text-xs uppercase tracking-wide text-zinc-500">Agregar imagen por URL</label>
            <input
              required
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Texto alternativo (opcional)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className={inputClass}
            />
            {error && <span className="text-xs text-destructive">{error}</span>}
            <Button type="submit" size="sm" disabled={submitting} className="mt-1 self-start">
              <ImagePlus className="mr-1.5 h-4 w-4" />
              {submitting ? "Agregando..." : "Agregar imagen"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
