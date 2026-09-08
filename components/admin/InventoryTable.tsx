"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Images, Pencil, Trash2 } from "lucide-react";
import { AdminProduct } from "@/types/admin";
import { Category } from "@/types/product";
import { cn, formatPrice } from "@/lib/utils";
import {
  addProductVariant,
  deleteProduct,
  deleteProductVariant,
  setProductActive,
  setVariantActive,
  updateProductVariant,
} from "@/lib/admin-mutations";
import { triggerRevalidate } from "@/lib/revalidate";
import { Button } from "@/components/ui/button";
import { ProductImagesModal } from "./ProductImagesModal";
import { EditProductModal } from "./EditProductModal";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

function VariantRow({ productSlug, variant }: { productSlug: string; variant: AdminProduct["variants"][number] }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(variant.price));
  const [costPrice, setCostPrice] = useState(String(variant.costPrice));
  const [stock, setStock] = useState(String(variant.stock));

  const mutation = useMutation({
    mutationFn: () =>
      updateProductVariant(variant.id, {
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
      }),
    onSuccess: () => {
      // Data comes from the Server Component's props (lib/admin-api.ts), not a TanStack Query
      // cache, so router.refresh() re-runs the server fetch instead of invalidating a query key.
      router.refresh();
      // /producto/[slug] revalidates every 3600s (public SEO tuning) — ping it directly so a
      // price/stock edit shows up there immediately instead of up to an hour later.
      void triggerRevalidate([`/producto/${productSlug}`, "/catalogo", "/"]);
    },
  });

  const margin = Number(price) - Number(costPrice);
  const marginPct = Number(price) > 0 ? (margin / Number(price)) * 100 : 0;

  const [actionError, setActionError] = useState<string | null>(null);

  const toggleActive = async () => {
    setActionError(null);
    try {
      await setVariantActive(variant.id, !variant.isActive);
      router.refresh();
      void triggerRevalidate([`/producto/${productSlug}`, "/catalogo", "/"]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    }
  };

  // Solo funciona si la variante nunca se vendió; si tiene ventas el backend responde 409 con el
  // motivo, que es justo lo que se muestra debajo del botón.
  const remove = async () => {
    setActionError(null);
    try {
      await deleteProductVariant(variant.id);
      router.refresh();
      void triggerRevalidate([`/producto/${productSlug}`, "/catalogo", "/"]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo borrar");
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-zinc-800/60 transition-colors hover:bg-white/[0.03]",
        !variant.isActive && "opacity-45",
      )}
    >
      <td className="p-3 pl-8 text-sm text-zinc-400">
        {variant.sku}
        {!variant.isActive && <span className="ml-2 text-xs text-zinc-600">(no se vende)</span>}
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={cn(inputClass, "w-24")}
        />
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className={cn(inputClass, "w-24")}
        />
      </td>
      <td className="p-3 text-sm">
        <span className={margin >= 0 ? "text-emerald-400" : "text-red-400"}>{formatPrice(margin)}</span>{" "}
        <span className="text-zinc-500">({marginPct.toFixed(0)}%)</span>
      </td>
      <td className="p-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={cn(inputClass, "w-20")}
        />
      </td>
      <td className="p-3 text-sm text-zinc-500">{variant.reservedStock}</td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
          <button
            type="button"
            title={variant.isActive ? "Dejar de vender esta variante" : "Volver a vender esta variante"}
            onClick={() => void toggleActive()}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-yellow-500/40 hover:text-yellow-400"
          >
            {variant.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            title="Borrar variante (solo si nunca se vendió)"
            onClick={() => void remove()}
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {actionError && <p className="mt-1 text-right text-xs text-red-400">{actionError}</p>}
      </td>
    </tr>
  );
}

function ProductGroup({ product, categories }: { product: AdminProduct; categories: Category[] }) {
  const router = useRouter();
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refreshPublicPages = () =>
    void triggerRevalidate([`/producto/${product.slug}`, "/catalogo", "/"]);

  const toggleActive = async () => {
    setActionError(null);
    try {
      await setProductActive(product.id, !product.isActive);
      router.refresh();
      refreshPublicPages();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    }
  };

  const remove = async () => {
    setActionError(null);
    try {
      await deleteProduct(product.id);
      router.refresh();
      refreshPublicPages();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo borrar");
    }
  };

  return (
    <>
      <tr className="border-b border-zinc-800/60 bg-white/[0.02]">
        <td colSpan={7} className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={cn(!product.isActive && "opacity-50")}>
              <span className="font-semibold text-zinc-100">{product.name}</span>
              <span className="ml-2 text-xs text-zinc-500">{product.brand}</span>
              {!product.isActive && (
                <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                  Fuera del catálogo
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditModalOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setImagesModalOpen(true)}>
                <Images className="mr-1.5 h-3.5 w-3.5" />
                Imágenes ({product.images?.length ?? 0})
              </Button>
              <Button size="sm" variant="outline" onClick={() => void toggleActive()}>
                {product.isActive ? (
                  <>
                    <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Activar
                  </>
                )}
              </Button>
              {/* Borrado real: el backend solo lo permite si el producto nunca se vendió. */}
              <Button size="sm" variant="outline" onClick={() => void remove()}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Borrar
              </Button>
            </div>
          </div>
          {actionError && <p className="mt-2 text-xs text-red-400">{actionError}</p>}
        </td>
      </tr>
      {product.variants.map((variant) => (
        <VariantRow key={variant.id} productSlug={product.slug} variant={variant} />
      ))}
      <AddVariantRow product={product} />

      <ProductImagesModal product={product} open={imagesModalOpen} onOpenChange={setImagesModalOpen} />
      <EditProductModal product={product} categories={categories} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </>
  );
}

/** Alta de una variante en un producto ya creado — hasta acá solo se podían crear todas juntas
 * al crear el producto. */
function AddVariantRow({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSaving(true);
    try {
      await addProductVariant(product.id, {
        sku: sku.trim(),
        name: name.trim(),
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
      });
      setSku("");
      setName("");
      setPrice("");
      setCostPrice("");
      setStock("0");
      setOpen(false);
      router.refresh();
      void triggerRevalidate([`/producto/${product.slug}`, "/catalogo", "/"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar la variante");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <tr className="border-b border-zinc-800/60">
        <td colSpan={7} className="p-2 pl-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-zinc-500 transition-colors hover:text-yellow-400"
          >
            + Agregar variante
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-800/60 bg-white/[0.02]">
      <td className="p-3 pl-8">
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className={cn(inputClass, "w-32")} />
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(inputClass, "mt-2 w-32")}
        />
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={cn(inputClass, "w-24")}
        />
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          placeholder="Costo"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className={cn(inputClass, "w-24")}
        />
      </td>
      <td className="p-3" />
      <td className="p-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={cn(inputClass, "w-20")}
        />
      </td>
      <td className="p-3" />
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" disabled={saving || !sku.trim() || !name.trim() || !price} onClick={() => void submit()}>
            {saving ? "…" : "Agregar"}
          </Button>
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-300">
            Cancelar
          </button>
        </div>
        {error && <p className="mt-1 text-right text-xs text-red-400">{error}</p>}
      </td>
    </tr>
  );
}

export function InventoryTable({ products, categories }: { products: AdminProduct[]; categories: Category[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
      <table className="w-full text-left">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="p-3">SKU</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Costo</th>
            <th className="p-3">Margen</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Reservado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductGroup key={product.id} product={product} categories={categories} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
