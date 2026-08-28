import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Pagado",
  IN_PREPARATION: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  PENDING_PAYMENT: "outline",
  PAID: "secondary",
  IN_PREPARATION: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function MyOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 text-center backdrop-blur-md">
        <p className="text-sm text-zinc-500">Aún no tienes pedidos.</p>
        <Link href="/catalogo" className="mt-2 inline-block text-sm text-yellow-400 hover:underline">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/pedido/${order.id}/confirmacion`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md transition-colors hover:border-yellow-500/40"
          >
            <div>
              <span className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8)}</span>
              <p className="text-sm text-zinc-400">{new Date(order.createdAt).toLocaleDateString("es-PE")}</p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
            <span className="font-bold text-yellow-400">{formatPrice(order.totalAmount)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
