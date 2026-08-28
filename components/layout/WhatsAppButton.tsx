"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildStorefrontWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const pathname = usePathname() ?? "/";

  // Internal tool, not customer-facing — no reason to offer store WhatsApp contact there.
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : undefined;
  const href = buildStorefrontWhatsAppLink(pathname, currentUrl);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <MessageCircle className="relative h-7 w-7" strokeWidth={2} />
    </a>
  );
}
