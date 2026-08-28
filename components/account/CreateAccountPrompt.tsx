"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { registerCustomer } from "@/lib/customer-auth";
import { useInvalidateCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

// Offered only to a guest checkout (no session — see the confirmation page). Name/email are
// already known from the order, so all it needs is a password.
export function CreateAccountPrompt({ email, name }: { email: string; name: string }) {
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerCustomer({ name, email, password });
      invalidateCurrentUser();
      setCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <p className="text-sm text-emerald-400">
        ¡Cuenta creada!{" "}
        <Link href="/cuenta" className="underline">
          Ver mi cuenta
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-left sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
          Crea una contraseña para {email}
        </label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={inputClass}
        />
      </div>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "Creando..." : "Crear cuenta"}
      </Button>
      {error && <span className="text-xs text-red-400 sm:basis-full">{error}</span>}
    </form>
  );
}
