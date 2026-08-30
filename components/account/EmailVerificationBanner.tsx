"use client";

import { useState } from "react";
import { resendVerification } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";

// No bloqueante a propósito — ver el comentario en User.emailVerifiedAt (schema.prisma del
// backend): un cliente sin verificar igual puede comprar y usar la cuenta, solo se le avisa.
export function EmailVerificationBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setSending(true);
    setError(null);
    try {
      await resendVerification();
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reenviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-500/30 bg-yellow-400/10 px-4 py-2.5 text-sm">
      <span className="text-yellow-200">
        Todavía no confirmaste <span className="font-medium">{email}</span>.
        {sent && <span className="ml-2 text-emerald-400">Te reenviamos el enlace.</span>}
        {error && <span className="ml-2 text-red-400">{error}</span>}
      </span>
      <Button size="sm" variant="outline" disabled={sending || sent} onClick={handleResend}>
        {sending ? "Enviando..." : sent ? "Enviado" : "Reenviar verificación"}
      </Button>
    </div>
  );
}
