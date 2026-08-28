import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCategories } from "@/lib/admin-api";
import { CreateProductForm } from "@/components/admin/CreateProductForm";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/inventory" className="mb-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a inventario
        </Link>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
      </div>

      <CreateProductForm categories={categories} />
    </div>
  );
}
