"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileWarning, LayoutGrid, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/lib/admin-mutations";

const LINKS = [
  { href: "/admin/inventory", label: "Inventario", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: LayoutGrid },
  { href: "/admin/complaints", label: "Reclamos", icon: FileWarning },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAdmin();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex h-fit flex-col gap-1 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md">
      <span className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-yellow-400/80">
        Panel Admin
      </span>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-yellow-400/10 text-yellow-400"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}

      <hr className="my-2 border-zinc-800/80" />

      <button
        type="button"
        disabled={loggingOut}
        onClick={handleLogout}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {loggingOut ? "Saliendo..." : "Cerrar sesión"}
      </button>
    </nav>
  );
}
