"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Category } from "@/types/product";
import { createCategory, createProduct } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

interface AttributeDraft {
  key: string;
  value: string;
}

interface VariantDraft {
  sku: string;
  name: string;
  price: string;
  costPrice: string;
  stock: string;
  attributes: AttributeDraft[];
}

function emptyVariant(): VariantDraft {
  return { sku: "", name: "", price: "", costPrice: "", stock: "", attributes: [{ key: "", value: "" }] };
}

export function CreateProductForm({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);

  const [newCategoryMode, setNewCategoryMode] = useState(initialCategories.length === 0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttribute(variantIndex: number, attrIndex: number, patch: Partial<AttributeDraft>) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i !== variantIndex
          ? v
          : { ...v, attributes: v.attributes.map((a, ai) => (ai === attrIndex ? { ...a, ...patch } : a)) },
      ),
    );
  }

  function addAttribute(variantIndex: number) {
    setVariants((prev) =>
      prev.map((v, i) => (i !== variantIndex ? v : { ...v, attributes: [...v.attributes, { key: "", value: "" }] })),
    );
  }

  function removeAttribute(variantIndex: number, attrIndex: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i !== variantIndex ? v : { ...v, attributes: v.attributes.filter((_, ai) => ai !== attrIndex) },
      ),
    );
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setError(null);
    try {
      const category = await createCategory({ name: newCategoryName.trim() });
      const newCategory: Category = { id: category.id, name: category.name, slug: category.slug, description: null };
      setCategories((prev) => [...prev, newCategory]);
      setCategoryId(category.id);
      setNewCategoryMode(false);
      setNewCategoryName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Selecciona o crea una categoría primero.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const product = await createProduct({
        name,
        brand,
        description: description.trim() || undefined,
        categoryId,
        isFeatured,
        variants: variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          price: Number(v.price),
          costPrice: Number(v.costPrice),
          stock: Number(v.stock),
          attributes: Object.fromEntries(
            v.attributes.filter((a) => a.key.trim().length > 0).map((a) => [a.key.trim(), a.value]),
          ),
        })),
      });
      router.push(`/admin/inventory?created=${product.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el producto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">Nombre del producto</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">Marca</label>
          <input required value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-300">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={cn(inputClass, "h-auto py-2")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-300">Categoría</label>
          {!newCategoryMode ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={cn(inputClass, "flex-1")}>
                {categories.length === 0 && <option value="">Sin categorías todavía</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => setNewCategoryMode(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nueva
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                autoFocus
                placeholder="Nombre de la categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={cn(inputClass, "flex-1")}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={creatingCategory} onClick={handleCreateCategory}>
                  {creatingCategory ? "Creando..." : "Crear"}
                </Button>
                {categories.length > 0 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setNewCategoryMode(false)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 self-end text-sm text-zinc-300">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Producto destacado (aparece en la home)
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Variantes</h2>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Agregar variante
          </Button>
        </div>

        {variants.map((variant, vIndex) => (
          <div key={vIndex} className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-yellow-400/80">Variante {vIndex + 1}</span>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(vIndex)}
                  className="text-zinc-500 hover:text-red-400"
                  aria-label="Quitar variante"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">SKU</label>
                <input
                  required
                  value={variant.sku}
                  onChange={(e) => updateVariant(vIndex, { sku: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Nombre (ej. Switch Red)</label>
                <input
                  required
                  value={variant.name}
                  onChange={(e) => updateVariant(vIndex, { name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Precio (S/)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.price}
                  onChange={(e) => updateVariant(vIndex, { price: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Costo (S/)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.costPrice}
                  onChange={(e) => updateVariant(vIndex, { costPrice: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => updateVariant(vIndex, { stock: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-500">
                  Atributos (switch, sensor, peso, conexión... lo que aplique a este producto)
                </label>
                <button
                  type="button"
                  onClick={() => addAttribute(vIndex)}
                  className="text-xs text-yellow-400 hover:text-yellow-300"
                >
                  + agregar atributo
                </button>
              </div>
              {variant.attributes.map((attr, aIndex) => (
                <div key={aIndex} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <input
                      placeholder="clave (ej. switch)"
                      value={attr.key}
                      onChange={(e) => updateAttribute(vIndex, aIndex, { key: e.target.value })}
                      className={cn(inputClass, "flex-1")}
                    />
                    <input
                      placeholder="valor (ej. Red)"
                      value={attr.value}
                      onChange={(e) => updateAttribute(vIndex, aIndex, { value: e.target.value })}
                      className={cn(inputClass, "flex-1")}
                    />
                  </div>
                  {variant.attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttribute(vIndex, aIndex)}
                      className="shrink-0 pt-2 text-zinc-500 hover:text-red-400"
                      aria-label="Quitar atributo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive">{error}</div>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creando producto..." : "Crear producto"}
        </Button>
        <p className="text-xs text-zinc-500">
          Podrás agregar imágenes desde el inventario justo después de crear el producto.
        </p>
      </div>
    </form>
  );
}
