"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AdminComplaint } from "@/types/complaint";
import { respondComplaint } from "@/lib/admin-mutations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

interface ComplaintDetailModalProps {
  complaint: AdminComplaint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value}</span>
    </div>
  );
}

export function ComplaintDetailModal({ complaint, open, onOpenChange }: ComplaintDetailModalProps) {
  const router = useRouter();
  const [providerResponse, setProviderResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = `RC-${String(complaint.correlativo).padStart(6, "0")}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await respondComplaint(complaint.id, providerResponse);
      router.refresh();
      // complaint is a snapshot from props — it won't reflect providerResponse until the parent
      // re-fetches, so close rather than leave the form showing after a successful submit.
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la respuesta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-zinc-100">{code}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Cerrar" className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tipo" value={complaint.type === "RECLAMO" ? "Reclamo" : "Queja"} />
            <Field label="Fecha" value={new Date(complaint.createdAt).toLocaleString("es-PE")} />
            <Field label="Consumidor" value={complaint.fullName} />
            <Field label="Documento" value={`${complaint.documentType} ${complaint.documentNumber}`} />
            <Field label="Correo" value={complaint.email} />
            <Field label="Teléfono" value={complaint.phone ?? "—"} />
            <Field label="Domicilio" value={complaint.address} />
            <Field
              label="Bien"
              value={`${complaint.goodType === "producto" ? "Producto" : "Servicio"}: ${complaint.goodDescription}`}
            />
            {complaint.claimedAmount !== null && (
              <Field label="Monto reclamado" value={`S/ ${complaint.claimedAmount.toFixed(2)}`} />
            )}
            {complaint.isMinor && <Field label="Apoderado" value={complaint.guardianName ?? "—"} />}
          </div>

          <div className="mb-5 flex flex-col gap-3 border-t border-zinc-800/60 pt-4">
            <div>
              <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Detalle</span>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">{complaint.detail}</p>
            </div>
            <div>
              <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Pedido del consumidor</span>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">{complaint.request}</p>
            </div>
          </div>

          {complaint.providerResponse ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <span className="mb-1 block text-xs uppercase tracking-wide text-emerald-400">
                Respondido el {complaint.respondedAt && new Date(complaint.respondedAt).toLocaleString("es-PE")}
              </span>
              <p className="whitespace-pre-wrap text-sm text-zinc-200">{complaint.providerResponse}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
              <label className="text-xs uppercase tracking-wide text-zinc-500">Registrar respuesta</label>
              <textarea
                required
                minLength={3}
                rows={4}
                value={providerResponse}
                onChange={(e) => setProviderResponse(e.target.value)}
                className={cn(inputClass, "h-auto resize-none py-2")}
              />
              {error && <span className="text-xs text-destructive">{error}</span>}
              <Button type="submit" size="sm" disabled={submitting} className="mt-1 self-start">
                {submitting ? "Guardando..." : "Enviar respuesta"}
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
