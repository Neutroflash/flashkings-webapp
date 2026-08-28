"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceType, Order } from "@/types/order";
import { issueInvoice } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

// Emisión manual: el negocio aún no está registrado como emisor electrónico ante SUNAT, así que
// esto no ocurre automáticamente al confirmarse el pago — ver IInvoicingGateway en el backend.
export function InvoiceSection({ order }: { order: Order }) {
  const router = useRouter();
  const [type, setType] = useState<InvoiceType>("BOLETA");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order.paidAt) return null;

  if (order.invoice) {
    const inv = order.invoice;
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Comprobante</span>
        <p className="mt-1 text-zinc-100">
          {inv.type === "BOLETA" ? "Boleta" : "Factura"} {inv.series}-{inv.number}
        </p>
        <p className="text-sm text-zinc-400">
          {inv.documentType} {inv.documentNumber}
          {inv.businessName ? ` · ${inv.businessName}` : ""}
        </p>
        {inv.pdfUrl && (
          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-yellow-400 hover:underline">
            Ver PDF
          </a>
        )}
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await issueInvoice(order.id, {
        type,
        documentType,
        documentNumber,
        businessName: type === "FACTURA" ? businessName : undefined,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo emitir el comprobante");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
      <span className="text-xs uppercase tracking-wide text-zinc-500">Comprobante</span>
      <p className="mb-3 mt-1 text-sm text-zinc-400">Esta orden no tiene un comprobante emitido.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:flex-wrap">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as InvoiceType)} className={cn(inputClass, "text-zinc-100")}>
            <option value="BOLETA">Boleta</option>
            <option value="FACTURA">Factura</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Documento</label>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={cn(inputClass, "text-zinc-100")}>
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="CE">CE</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">N° documento</label>
          <input required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className={inputClass} />
        </div>
        {type === "FACTURA" && (
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Razón social</label>
            <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
          </div>
        )}
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Emitiendo..." : "Emitir comprobante"}
        </Button>
      </form>
      {error && <span className="mt-2 block text-xs text-destructive">{error}</span>}
    </div>
  );
}
