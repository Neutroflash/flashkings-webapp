"use client";

import { useState } from "react";
import { AdminComplaint } from "@/types/complaint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplaintDetailModal } from "./ComplaintDetailModal";

// Response deadline is 15 business days (Mon–Fri) from filing, per INDECOPI's published guidance
// on the Libro de Reclamaciones Virtual (D.S. N° 011-2011-PCM) — see backend/ComplaintReceivedEmail.
const RESPONSE_DEADLINE_BUSINESS_DAYS = 15;

function businessDaysSince(date: Date): number {
  let count = 0;
  const cursor = new Date(date);
  const now = new Date();
  while (cursor < now) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

function DeadlineBadge({ complaint }: { complaint: AdminComplaint }) {
  if (complaint.providerResponse) {
    return <Badge variant="success">Respondido</Badge>;
  }
  const elapsed = businessDaysSince(new Date(complaint.createdAt));
  const remaining = RESPONSE_DEADLINE_BUSINESS_DAYS - elapsed;
  if (remaining <= 0) {
    return <Badge variant="destructive">Plazo vencido</Badge>;
  }
  if (remaining <= 3) {
    return (
      <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
        {remaining} días hábiles
      </Badge>
    );
  }
  return <Badge variant="secondary">{remaining} días hábiles</Badge>;
}

export function ComplaintsTable({ complaints }: { complaints: AdminComplaint[] }) {
  const [selected, setSelected] = useState<AdminComplaint | null>(null);

  if (complaints.length === 0) {
    return <p className="py-8 text-center text-zinc-500">No hay reclamos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
      <table className="w-full text-left">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="p-3">Código</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Consumidor</th>
            <th className="p-3">Bien</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Plazo</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id} className="border-b border-zinc-800/60 transition-colors hover:bg-white/[0.03]">
              <td className="p-3 font-mono text-xs text-zinc-300">RC-{String(complaint.correlativo).padStart(6, "0")}</td>
              <td className="p-3 text-sm">{complaint.type === "RECLAMO" ? "Reclamo" : "Queja"}</td>
              <td className="p-3 text-sm">{complaint.fullName}</td>
              <td className="p-3 text-sm text-zinc-400">{complaint.goodDescription}</td>
              <td className="p-3 text-sm text-zinc-500">{new Date(complaint.createdAt).toLocaleDateString("es-PE")}</td>
              <td className="p-3">
                <DeadlineBadge complaint={complaint} />
              </td>
              <td className="p-3">
                <Button size="sm" variant="outline" onClick={() => setSelected(complaint)}>
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          open={selected !== null}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      )}
    </div>
  );
}
