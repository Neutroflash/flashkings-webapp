"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { AdminCategory } from "@/types/admin";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 w-full rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

export function CategoriesTable({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">Nombre</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-zinc-500">Descripción (opcional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </div>
        <Button type="submit" disabled={creating || name.trim().length < 2}>
          {creating ? "Creando…" : "Crear"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="p-3">Categoría</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Productos</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="py-8 text-center text-zinc-500">Todavía no hay categorías.</p>}
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name !== category.name || description !== (category.description ?? "");

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateCategory(category.id, { name: name.trim(), description: description.trim() || null });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteCategory(category.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar");
    }
  };

  return (
    <tr className="border-t border-white/5 align-top">
      <td className="p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          className={`${inputClass} mt-2`}
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </td>
      {/* El slug no es editable: es la URL pública del catálogo filtrado y puede estar indexada. */}
      <td className="p-3 font-mono text-xs text-zinc-500">{category.slug}</td>
      <td className="p-3 text-sm text-zinc-300">
        {category.productCount > 0 ? (
          <Link href={`/admin/inventory`} className="text-yellow-400 hover:underline">
            {category.productCount}
          </Link>
        ) : (
          <span className="text-zinc-600">0</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "…" : "Guardar"}
            </Button>
          )}
          <button
            type="button"
            onClick={() => void handleDelete()}
            // Una categoría con productos no se puede borrar: `Product.categoryId` es obligatorio,
            // así que no hay destino al que mandarlos. El backend igual lo rechaza con 409 — esto
            // solo evita el viaje y explica por qué antes de intentarlo.
            disabled={category.productCount > 0}
            title={
              category.productCount > 0
                ? "Mueve sus productos a otra categoría antes de borrarla"
                : "Borrar categoría"
            }
            className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-zinc-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
