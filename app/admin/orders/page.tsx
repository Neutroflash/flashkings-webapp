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
            "rounded-full border border-border px-3 py-1 text-xs",
            !searchParams.status && "border-primary bg-primary text-primary-foreground",
          )}
        >
          Todos
        </Link>
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs",
              searchParams.status === status && "border-primary bg-primary text-primary-foreground",
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
