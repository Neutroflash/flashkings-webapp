"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Order, RefundReason } from "@/types/order";
import { fetchRefundReasons, issueCreditNote, refundOrder } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-9 w-full rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

const REFUNDABLE_STATUSES = ["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED"];

function soles(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

/**
 * Devolución de dinero de una orden ya pagada. La emisión de la nota de crédito es un botón
 * aparte y no un paso automático: SUNAT puede estar caído sin que eso deba impedir devolverle
 * la plata al cliente, y una orden sin comprobante emitido no necesita ninguna nota.
 */
export function RefundSection({ order }: { order: Order }) {
  const router = useRouter();
  const [reasons, setReasons] = useState<RefundReason[]>([]);
  const [reasonCode, setReasonCode] = useState("06");
  const [reasonText, setReasonText] = useState("");
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [restock, setRestock] = useState(true);
  const [refundShipping, setRefundShipping] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void fetchRefundReasons().then(setReasons);
  }, []);

  const refunds = order.refunds ?? [];
  const shippingAlreadyRefunded = refunds.some((r) => r.status !== "FAILED" && r.includesShipping);
  const shippingRefundable = order.shippingCost > 0 && !shippingAlreadyRefunded;

  const alreadyRefunded = refunds
    .filter((r) => r.status !== "FAILED")
    .reduce((sum, r) => sum + r.amount, 0);
  const pending = Math.max(0, Math.round((order.totalAmount - alreadyRefunded) * 100) / 100);

  // Sugerencia por motivo: el flete se devuelve cuando la falla es del negocio (01/02/03) y no
  // cuando el cliente se arrepiente (06/07). El catálogo 09 no distingue culpa, así que esto es
  // solo el valor por defecto — el admin decide marcando la casilla.
  useEffect(() => {
    setRefundShipping(["01", "02", "03"].includes(reasonCode));
  }, [reasonCode]);

  // Lo que se va a devolver en modo "por ítem". El servidor recalcula esta misma suma antes de
  // mover un sol; acá es solo para que el botón diga la cifra correcta.
  const partialAmount = useMemo(() => {
    const itemsTotal = order.items.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * item.price, 0);
    const shipping = shippingRefundable && refundShipping ? order.shippingCost : 0;
    return Math.round((itemsTotal + shipping) * 100) / 100;
  }, [order.items, order.shippingCost, quantities, refundShipping, shippingRefundable]);

  if (!order.paidAt) return null;

  const canRefund = REFUNDABLE_STATUSES.includes(order.status) && pending > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    const items = order.items
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => ({ orderItemId: item.id, quantity: quantities[item.id] }));

    try {
      const result = await refundOrder(order.id, {
        ...(mode === "partial" ? { items } : {}),
        refundShipping: shippingRefundable && refundShipping,
        reasonCode,
        reasonText: reasonText.trim() || undefined,
        isManual,
        restock,
      });
      setNotice(
        result.refund.status === "COMPLETED"
          ? `Se devolvieron ${soles(result.refund.amount)}.`
          : `Reembolso de ${soles(result.refund.amount)} registrado, pero la pasarela no lo confirmó — revísalo en el panel de Culqi.`,
      );
      setQuantities({});
      setReasonText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el reembolso");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreditNote = async (refundId: string) => {
    setError(null);
    setNotice(null);
    try {
      const note = await issueCreditNote(refundId);
      setNotice(`Nota de crédito ${note.series}-${note.number} emitida.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo emitir la nota de crédito");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Devoluciones</span>
        <span className="text-xs text-zinc-500">
          {alreadyRefunded > 0 ? `${soles(alreadyRefunded)} devuelto · ` : ""}
          {soles(pending)} pendiente
        </span>
      </div>

      {refunds.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {refunds.map((refund) => {
            const note = (order.creditNotes ?? []).find((n) => n.refundId === refund.id);
            return (
              <li
                key={refund.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
              >
                <div>
                  <p className="text-zinc-100">
                    {soles(refund.amount)}
                    <span className="ml-2 text-xs text-zinc-500">
                      {refund.isFull ? "total" : "parcial"}
                      {refund.isManual ? " · manual" : ""}
                      {refund.restocked ? " · stock repuesto" : " · sin reponer stock"}
                      {refund.includesShipping ? " · envío incluido" : ""}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400">{refund.reasonText}</p>
                  {refund.status === "FAILED" && (
                    <p className="text-xs text-red-400">La pasarela rechazó el reembolso — revísalo a mano.</p>
                  )}
                  {refund.status === "PENDING" && (
                    <p className="text-xs text-amber-400">La pasarela aún no confirma el movimiento.</p>
                  )}
                </div>

                {note ? (
                  <span className="text-xs text-yellow-400">
                    NC {note.series}-{note.number}
                    {note.status === "PENDING_SUNAT" ? " (reintentando)" : ""}
                    {note.status === "FAILED" ? " (rechazada)" : ""}
                  </span>
                ) : order.invoice && refund.status !== "FAILED" ? (
                  <button
                    type="button"
                    onClick={() => void handleCreditNote(refund.id)}
                    className="text-xs text-yellow-400 underline-offset-2 hover:underline"
                  >
                    Emitir nota de crédito
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {!canRefund ? (
        <p className="mt-3 text-sm text-zinc-500">
          {pending <= 0 ? "Esta orden ya fue devuelta por completo." : `Una orden en ${order.status} no admite reembolso.`}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 text-zinc-300">
              <input type="radio" checked={mode === "full"} onChange={() => setMode("full")} />
              Devolver todo ({soles(pending)})
            </label>
            <label className="flex items-center gap-2 text-zinc-300">
              <input type="radio" checked={mode === "partial"} onChange={() => setMode("partial")} />
              Por ítem
            </label>
          </div>

          {mode === "partial" && (
            <ul className="flex flex-col gap-2">
              {order.items.map((item) => {
                const remaining = item.quantity - item.refundedQuantity;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zinc-300">
                      {item.productVariant?.name ?? "Producto"}
                      <span className="ml-2 text-xs text-zinc-500">
                        {remaining} de {item.quantity} sin devolver · {soles(item.price)} c/u
                      </span>
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={remaining}
                      disabled={remaining === 0}
                      value={quantities[item.id] ?? 0}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [item.id]: Math.min(remaining, Math.max(0, Number(e.target.value))),
                        }))
                      }
                      className="h-9 w-20 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none focus:border-yellow-500/50 disabled:opacity-40"
                    />
                  </li>
                );
              })}
              <li className="text-right text-sm text-zinc-400">Total a devolver: {soles(partialAmount)}</li>
            </ul>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Motivo (catálogo 09 de SUNAT)</span>
            <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className={inputClass}>
              {reasons.map((reason) => (
                <option key={reason.code} value={reason.code}>
                  {reason.code} — {reason.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Detalle (opcional)</span>
            <input
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Lo que verá el cliente en su correo"
              className={inputClass}
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
              Reponer al stock
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />
              Ya devolví el dinero por fuera
            </label>
            {shippingRefundable && mode === "partial" && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={refundShipping}
                  onChange={(e) => setRefundShipping(e.target.checked)}
                />
                Devolver el envío ({soles(order.shippingCost)})
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-emerald-400">{notice}</p>}

          <Button
            type="submit"
            disabled={submitting || (mode === "partial" && partialAmount <= 0)}
            className="self-start"
          >
            {submitting ? "Procesando…" : mode === "full" ? `Devolver ${soles(pending)}` : `Devolver ${soles(partialAmount)}`}
          </Button>
        </form>
      )}
    </div>
  );
}
