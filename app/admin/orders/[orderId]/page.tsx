import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface AdminOrderDetailPageProps {
  params: { orderId: string };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await getAdminOrderById(params.orderId);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedido {order.id.slice(0, 8)}...</h1>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <span className="text-xs uppercase text-muted-foreground">Cliente</span>
          <p>{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          <a href={buildWhatsAppLink(order)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
            <Button size="sm" variant="secondary">
              Contactar por WhatsApp
            </Button>
          </a>
        </div>
        <div>
          <span className="text-xs uppercase text-muted-foreground">Envío</span>
          <p>{order.shippingAddress}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold">Ítems</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productVariant?.name ?? "Producto"} ({item.productVariant?.sku}) x{item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <OrderStatusActions orderId={order.id} status={order.status} />
    </div>
  );
}
