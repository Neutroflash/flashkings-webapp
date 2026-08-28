import Link from "next/link";

export function AdminSidebar() {
  return (
    <nav className="flex h-fit flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Panel Admin
      </span>
      <Link href="/admin/inventory" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
        Inventario
      </Link>
      <Link href="/admin/orders" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
        Pedidos
      </Link>
    </nav>
  );
}
