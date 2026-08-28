import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-api";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { Button } from "@/components/ui/button";

export default async function AdminInventoryPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo producto
          </Button>
        </Link>
      </div>
      <InventoryTable products={products} categories={categories} />
    </div>
  );
}
