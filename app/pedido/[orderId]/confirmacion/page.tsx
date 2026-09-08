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
  // Solo los reembolsos que ya salieron: uno que la pasarela rechazó todavía no le llegó al cliente.
  const refunds = (order.refunds ?? []).filter((r) => r.status !== "FAILED");
  const refundedTotal = refunds.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h1 className="text-3xl font-bold">
        {order.status === "REFUNDED"
          ? "Pedido devuelto"
          : order.status === "PAID"
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

      {refunds.length > 0 && (
        <div className="w-full rounded-lg border border-border bg-card p-6 text-left">
          <h2 className="mb-3 font-semibold">
            {refundedTotal >= order.totalAmount ? "Devolución" : "Devolución parcial"}
          </h2>
          <ul className="flex flex-col gap-2">
            {refunds.map((refund) => (
              <li key={refund.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{refund.reasonText}</span>
                <span className="whitespace-nowrap font-semibold">{formatPrice(refund.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            El dinero vuelve al mismo medio de pago con el que compraste. Según tu banco, puede tardar unos días
            hábiles en reflejarse.
          </p>
        </div>
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
        {order.shippingCost > 0 && (
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm text-muted-foreground">
            <span>Envío{order.shippingDistrict ? ` — ${order.shippingDistrict}` : ""}</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
        )}
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
