import Link from "next/link";
import { getAdminOrders } from "@/lib/admin-api";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED", "CANCELLED"];

interface AdminOrdersPageProps {
  searchParams: { status?: OrderStatus };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { items: orders } = await getAdminOrders(searchParams.status);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !searchParams.status
              ? "border-yellow-500/50 bg-yellow-400 text-black"
              : "border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-500/30 hover:text-zinc-100",
          )}
        >
          Todos
        </Link>
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              searchParams.status === status
                ? "border-yellow-500/50 bg-yellow-400 text-black"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-500/30 hover:text-zinc-100",
            )}
          >
            {status}
          </Link>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
