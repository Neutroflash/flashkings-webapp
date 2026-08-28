"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types/auth";
import { updateMyProfile } from "@/lib/customer-auth";
import { useInvalidateCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";

export function ProfileForm({ user }: { user: SafeUser }) {
  const router = useRouter();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [defaultAddress, setDefaultAddress] = useState(user.defaultAddress ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile({ name, phone: phone || null, defaultAddress: defaultAddress || null });
      invalidateCurrentUser();
      router.refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tus datos");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-1">
        <label className="text-sm font-medium text-zinc-300">Nombre completo</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium text-zinc-300">Correo electrónico</label>
        <input disabled value={user.email} className={`${inputClass} opacity-60`} />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium text-zinc-300">Teléfono</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium text-zinc-300">Dirección de envío por defecto</label>
        <input
          value={defaultAddress}
          onChange={(e) => setDefaultAddress(e.target.value)}
          placeholder="Se usará para prellenar tus próximas compras"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && !error && <p className="text-sm text-emerald-400">Datos guardados.</p>}
      <Button type="submit" disabled={submitting} className="mt-1 self-start">
        {submitting ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
