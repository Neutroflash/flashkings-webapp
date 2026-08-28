import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { getSessionUser } from "@/lib/customer-api";
import { CreateAccountPrompt } from "@/components/account/CreateAccountPrompt";
import { formatPrice } from "@/lib/utils";

interface ConfirmationPageProps {
  params: { orderId: string };
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const [order, sessionUser] = await Promise.all([getOrderById(params.orderId), getSessionUser()]);
  if (!order) notFound();

  const isPendingManualVerification = order.payment?.status === "pending_verification";

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h1 className="text-3xl font-bold">
        {order.status === "PAID"
          ? "¡Pago confirmado!"
          : isPendingManualVerification
            ? "Comprobante recibido"
            : "Pedido registrado"}
      </h1>
      <p className="text-muted-foreground">
        Pedido <span className="font-mono">{order.id}</span> — estado actual:{" "}
        <span className="font-semibold text-foreground">{order.status}</span>
      </p>

      {isPendingManualVerification && (
        <p className="max-w-md rounded-md border border-secondary bg-secondary/10 px-4 py-3 text-sm text-secondary">
          Estamos verificando tu transferencia ({order.payment?.provider === "plin" ? "Plin" : "Yape"}, operación{" "}
          {order.payment?.providerChargeId}). Te avisaremos por correo en cuanto confirmemos el pago.
        </p>
      )}

      <div className="w-full rounded-lg border border-border bg-card p-6 text-left">
        <h2 className="mb-4 font-semibold">Resumen</h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productVariant?.name ?? "Producto"} x{item.quantity}
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

      <p className="text-sm text-muted-foreground">
        Enviaremos actualizaciones a <span className="text-foreground">{order.customerEmail}</span>.
      </p>

      {/* Only offered to a guest checkout — a signed-in customer already has this order linked. */}
      {!sessionUser && (
        <div className="w-full rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
          <h2 className="mb-1 font-semibold text-zinc-100">Guarda este pedido en una cuenta</h2>
          <p className="mb-3 text-sm text-zinc-400">
            Crea una cuenta para ver este pedido y los que hagas después en un solo lugar.
          </p>
          <CreateAccountPrompt email={order.customerEmail} name={order.customerName} />
        </div>
      )}
    </div>
  );
}
