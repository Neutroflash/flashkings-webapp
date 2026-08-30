"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "success" | "error";

function VerificarEmailInner() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Falta el enlace de verificación");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "No se pudo verificar el correo");
      });
  }, [token]);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-16 text-center">
      <div>
        <span className="text-2xl font-black tracking-tight">
          FLASH<span className="text-gradient-gold">KINGS</span>
        </span>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        {status === "verifying" && <p className="text-sm text-zinc-400">Verificando...</p>}
        {status === "error" && (
          <>
            <p className="mb-2 text-lg font-bold text-zinc-100">No se pudo verificar</p>
            <p className="text-sm text-red-400">{error}</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="mb-2 text-lg font-bold text-zinc-100">¡Correo verificado!</p>
            <p className="text-sm text-zinc-400">Ya puedes usar tu cuenta con normalidad.</p>
          </>
        )}
        <Link href="/cuenta" className="mt-6 inline-block">
          <Button>Ir a mi cuenta</Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailInner />
    </Suspense>
  );
}
