"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

function RestablecerPasswordForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Falta el token del enlace — vuelve a pedir uno nuevo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña");
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
        <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Nueva contraseña</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
        {done ? (
          <>
            <p className="text-center text-sm text-zinc-300">Tu contraseña se actualizó correctamente.</p>
            <Link href="/cuenta/ingresar" className="text-center text-sm text-yellow-400 hover:underline">
              Ingresar
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!token && <p className="text-sm text-red-400">Este enlace no es válido — pide uno nuevo desde &quot;olvidé mi contraseña&quot;.</p>}
            <div className="grid gap-1">
              <label className="text-sm font-medium text-zinc-300">Nueva contraseña</label>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={loading || !token} className="mt-2">
              {loading ? "Guardando..." : "Restablecer contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RestablecerPasswordPage() {
  return (
    <Suspense>
      <RestablecerPasswordForm />
    </Suspense>
  );
}
