import { getAdminCategoriesWithCounts } from "@/lib/admin-api";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <p className="text-sm text-zinc-500">
          Una categoría solo se puede borrar cuando no tiene productos.
        </p>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
