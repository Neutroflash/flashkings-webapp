import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { PaymentVerificationActions } from "@/components/admin/PaymentVerificationActions";
import { InvoiceSection } from "@/components/admin/InvoiceSection";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md sm:grid-cols-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-zinc-500">Cliente</span>
          <p className="text-zinc-100">{order.customerName}</p>
          <p className="text-sm text-zinc-400">{order.customerEmail}</p>
          <p className="text-sm text-zinc-400">{order.customerPhone}</p>
          <a href={buildWhatsAppLink(order)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
            <Button size="sm" variant="secondary">
              Contactar por WhatsApp
            </Button>
          </a>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wide text-zinc-500">Envío</span>
          <p className="text-zinc-100">{order.shippingAddress}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <h2 className="mb-3 font-semibold text-zinc-100">Ítems</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-zinc-300">
              <span>
                {item.productVariant?.name ?? "Producto"} ({item.productVariant?.sku}) x{item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-zinc-800/60 pt-4 font-bold text-zinc-100">
          <span>Total</span>
          <span className="text-yellow-400">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {order.payment && <PaymentVerificationActions orderId={order.id} payment={order.payment} />}

      <InvoiceSection order={order} />

      <OrderStatusActions orderId={order.id} status={order.status} />
    </div>
  );
}
