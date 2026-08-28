"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerCustomer } from "@/lib/customer-auth";
import { useInvalidateCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const redirectTo = searchParams.get("redirect") || "/cuenta";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerCustomer({ name, email, password });
      invalidateCurrentUser();
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
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
        <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Crear cuenta</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md"
      >
        <div className="grid gap-1">
          <label className="text-sm font-medium text-zinc-300">Nombre completo</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-zinc-300">Correo electrónico</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-zinc-300">Contraseña</label>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <span className="text-xs text-zinc-500">Mínimo 8 caracteres.</span>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
        <p className="text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href={`/cuenta/ingresar?redirect=${encodeURIComponent(redirectTo)}`} className="text-yellow-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroForm />
    </Suspense>
  );
}
