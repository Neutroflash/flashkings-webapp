"use client";

import { FormEvent, useState } from "react";
import { submitComplaint } from "@/lib/complaints";
import { ComplaintDocumentType, ComplaintGoodType, ComplaintReceipt, ComplaintType } from "@/types/complaint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUSINESS_LEGAL_NAME = process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME ?? "[Completar razón social]";
const BUSINESS_RUC = process.env.NEXT_PUBLIC_BUSINESS_RUC ?? "[Completar RUC]";
const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "[Completar dirección del establecimiento]";

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-zinc-100 outline-none transition-colors focus:border-yellow-500/50";
const labelClass = "mb-1 block text-xs uppercase tracking-wide text-zinc-500";

export default function LibroDeReclamacionesPage() {
  const [type, setType] = useState<ComplaintType>("RECLAMO");
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<ComplaintDocumentType>("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [goodType, setGoodType] = useState<ComplaintGoodType>("producto");
  const [goodDescription, setGoodDescription] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [detail, setDetail] = useState("");
  const [request, setRequest] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ComplaintReceipt | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitComplaint({
        type,
        fullName,
        documentType,
        documentNumber,
        address,
        phone: phone || undefined,
        email,
        isMinor,
        guardianName: isMinor ? guardianName : undefined,
        goodType,
        goodDescription,
        claimedAmount: claimedAmount ? Number(claimedAmount) : undefined,
        detail,
        request,
      });
      setReceipt(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el reclamo");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    const code = `RC-${String(receipt.correlativo).padStart(6, "0")}`;
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 backdrop-blur-md">
          <span className="mb-2 block text-xs uppercase tracking-widest text-yellow-400/80">
            Constancia de registro
          </span>
          <h1 className="mb-4 text-3xl font-black text-zinc-100">{code}</h1>
          <p className="mb-1 text-sm text-zinc-400">
            Tu {receipt.type === "RECLAMO" ? "reclamo" : "queja"} fue registrado el{" "}
            {new Date(receipt.createdAt).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" })}.
          </p>
          <p className="mb-6 text-sm text-zinc-400">
            Te enviamos esta constancia a tu correo. Tenemos un plazo de <strong className="text-zinc-200">15 días
            hábiles</strong> para responderte, conforme al Libro de Reclamaciones Virtual (D.S. N° 011-2011-PCM).
          </p>
          <Button onClick={() => window.location.assign("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-2 text-3xl font-black text-zinc-100">Libro de Reclamaciones</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) y su reglamento
        (D.S. N° 011-2011-PCM), este establecimiento cuenta con un Libro de Reclamaciones a tu disposición.
      </p>

      <div className="mb-8 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 text-xs text-zinc-500">
        <p>
          <span className="text-zinc-400">Proveedor:</span> {BUSINESS_LEGAL_NAME}
        </p>
        <p>
          <span className="text-zinc-400">RUC:</span> {BUSINESS_RUC}
        </p>
        <p>
          <span className="text-zinc-400">Domicilio del establecimiento:</span> {BUSINESS_ADDRESS}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className={labelClass}>Tipo</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label
              className={cn(
                "flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm transition-colors",
                type === "RECLAMO" ? "border-yellow-500/50 bg-yellow-500/5 text-zinc-100" : "border-white/10 text-zinc-400",
              )}
            >
              <input type="radio" name="type" checked={type === "RECLAMO"} onChange={() => setType("RECLAMO")} className="mr-2" />
              <strong>Reclamo</strong>
              <p className="mt-1 text-xs text-zinc-500">Disconformidad con el producto o servicio recibido.</p>
            </label>
            <label
              className={cn(
                "flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm transition-colors",
                type === "QUEJA" ? "border-yellow-500/50 bg-yellow-500/5 text-zinc-100" : "border-white/10 text-zinc-400",
              )}
            >
              <input type="radio" name="type" checked={type === "QUEJA"} onChange={() => setType("QUEJA")} className="mr-2" />
              <strong>Queja</strong>
              <p className="mt-1 text-xs text-zinc-500">Malestar respecto a la atención al público.</p>
            </label>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-zinc-200">Datos del consumidor</legend>
          <div>
            <label className={labelClass}>Nombres y apellidos</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className={labelClass}>Documento</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as ComplaintDocumentType)}
                className={cn(inputClass, "text-zinc-100")}
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carné de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>N° de documento</label>
              <input required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Domicilio</label>
            <input required value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Teléfono (opcional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Correo electrónico</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={isMinor}
              onChange={(e) => setIsMinor(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/30"
            />
            El reclamante es menor de edad
          </label>
          {isMinor && (
            <div>
              <label className={labelClass}>Nombre del padre/madre o apoderado</label>
              <input
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-zinc-200">Datos del bien contratado</legend>
          <div className="flex gap-3">
            <div className="w-1/3">
              <label className={labelClass}>Tipo</label>
              <select
                value={goodType}
                onChange={(e) => setGoodType(e.target.value as ComplaintGoodType)}
                className={cn(inputClass, "text-zinc-100")}
              >
                <option value="producto">Producto</option>
                <option value="servicio">Servicio</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Monto reclamado, S/ (opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Descripción del producto o servicio</label>
            <input
              required
              value={goodDescription}
              onChange={(e) => setGoodDescription(e.target.value)}
              placeholder="Ej. Mouse gaming L7 Ultra, pedido #..."
              className={inputClass}
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-zinc-200">Detalle</legend>
          <div>
            <label className={labelClass}>Detalle del {type === "RECLAMO" ? "reclamo" : "la queja"}</label>
            <textarea
              required
              minLength={10}
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className={cn(inputClass, "h-auto resize-none py-2")}
            />
          </div>
          <div>
            <label className={labelClass}>Pedido del consumidor</label>
            <textarea
              required
              rows={3}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="¿Qué solicitas? Ej. cambio del producto, reembolso, etc."
              className={cn(inputClass, "h-auto resize-none py-2")}
            />
          </div>
        </fieldset>

        {error && <span className="text-sm text-destructive">{error}</span>}

        <Button type="submit" disabled={submitting} className="self-start">
          {submitting ? "Enviando..." : "Registrar reclamo"}
        </Button>
      </form>
    </div>
  );
}
