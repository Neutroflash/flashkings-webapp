"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AdminProduct } from "@/types/admin";
import { formatPrice } from "@/lib/utils";
import { updateProductVariant } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

function VariantRow({ productName, variant }: { productName: string; variant: AdminProduct["variants"][number] }) {
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
    // Data comes from the Server Component's props (lib/admin-api.ts), not a TanStack Query
    // cache, so router.refresh() re-runs the server fetch instead of invalidating a query key.
    onSuccess: () => router.refresh(),
  });

  const margin = Number(price) - Number(costPrice);
  const marginPct = Number(price) > 0 ? (margin / Number(price)) * 100 : 0;

  return (
    <tr className="border-b border-border">
      <td className="p-3 text-sm">
        {productName}
        <div className="text-xs text-muted-foreground">{variant.sku}</div>
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9 w-24 rounded-md border border-border bg-muted px-2 text-sm"
        />
      </td>
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className="h-9 w-24 rounded-md border border-border bg-muted px-2 text-sm"
        />
      </td>
      <td className="p-3 text-sm">
        {formatPrice(margin)} <span className="text-muted-foreground">({marginPct.toFixed(0)}%)</span>
      </td>
      <td className="p-3">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-9 w-20 rounded-md border border-border bg-muted px-2 text-sm"
        />
      </td>
      <td className="p-3 text-sm text-muted-foreground">{variant.reservedStock}</td>
      <td className="p-3">
        <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </td>
    </tr>
  );
}

export function InventoryTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Producto / SKU</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Costo</th>
            <th className="p-3">Margen</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Reservado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.flatMap((product) =>
            product.variants.map((variant) => (
              <VariantRow key={variant.id} productName={product.name} variant={variant} />
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
