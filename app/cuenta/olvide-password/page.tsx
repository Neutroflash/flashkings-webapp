"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-16">
      <div className="text-center">
        <span className="text-2xl font-black tracking-tight">
          FLASH<span className="text-gradient-gold">KINGS</span>
        </span>
        <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Recuperar contraseña</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        {sent ? (
          <>
            <p className="text-center text-sm text-zinc-300">
              Si el correo existe en nuestro sistema, te enviamos instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/cuenta/ingresar" className="text-center text-sm text-yellow-400 hover:underline">
              Volver a ingresar
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-zinc-400">Ingresa tu correo y te mandamos un enlace para restablecer tu contraseña.</p>
            <div className="grid gap-1">
              <label className="text-sm font-medium text-zinc-300">Correo electrónico</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
