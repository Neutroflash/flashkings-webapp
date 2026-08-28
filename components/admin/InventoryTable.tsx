"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AdminProduct } from "@/types/admin";
import { cn, formatPrice } from "@/lib/utils";
import { updateProductVariant } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

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
    <tr className="border-b border-zinc-800/60 transition-colors hover:bg-white/[0.03]">
      <td className="p-3 text-sm">
        {productName}
        <div className="text-xs text-zinc-500">{variant.sku}</div>
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
        <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </td>
    </tr>
  );
}

export function InventoryTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
      <table className="w-full text-left">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400">
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
