import { ComplaintReceipt, CreateComplaintInput } from "@/types/complaint";

import { CLIENT_API_URL as API_URL } from "@/lib/api-url";

// Client-safe: the complaint form is a client component and this endpoint needs no session —
// filing a Libro de Reclamaciones complaint requires no account.
export async function submitComplaint(data: CreateComplaintInput): Promise<ComplaintReceipt> {
  const res = await fetch(`${API_URL}/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { complaint?: ComplaintReceipt; error?: string };
  if (!res.ok || !body.complaint) {
    throw new Error(body.error ?? "No se pudo registrar el reclamo");
  }
  return body.complaint;
}
