import { getAdminProducts } from "@/lib/admin-api";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function AdminInventoryPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Inventario</h1>
      <InventoryTable products={products} />
    </div>
  );
}
