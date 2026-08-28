import Link from "next/link";
import { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const STATUS_VARIANT: Record<Order["status"], "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PENDING_PAYMENT: "outline",
  PAID: "secondary",
  IN_PREPARATION: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-zinc-500">No hay pedidos con este filtro.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
      <table className="w-full text-left">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="p-3">Pedido</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Total</th>
            <th className="p-3">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-zinc-800/60 transition-colors hover:bg-white/[0.03]">
              <td className="p-3 text-sm">
                <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-zinc-300 hover:text-yellow-400">
                  {order.id.slice(0, 8)}...
                </Link>
              </td>
              <td className="p-3 text-sm">{order.customerName}</td>
              <td className="p-3">
                <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
              </td>
              <td className="p-3 text-sm">{formatPrice(order.totalAmount)}</td>
              <td className="p-3 text-sm text-zinc-500">{new Date(order.createdAt).toLocaleString("es-PE")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
