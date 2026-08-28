import { redirect } from "next/navigation";
import { getMyOrdersServer, getSessionUser } from "@/lib/customer-api";
import { ProfileForm } from "@/components/account/ProfileForm";
import { LogoutButton } from "@/components/account/LogoutButton";
import { MyOrdersList } from "@/components/account/MyOrdersList";

// Server Component auth guard — mirrors app/admin/layout.tsx's pattern, but for any authenticated
// user (not just ADMIN). Real enforcement stays on the backend (authenticateJWT on
// GET/PATCH /auth/me and GET /orders/mine) — this is UX/redirect convenience only.
export default async function CuentaPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/cuenta/ingresar?redirect=/cuenta");
  }
  // An admin has no customer order history to show here — belongs in the admin panel instead,
  // even if they reach this URL directly (a bookmark, the Navbar icon before it updates, etc.).
  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const { items: orders } = await getMyOrdersServer();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mi cuenta</h1>
          <p className="text-sm text-zinc-400">Hola, {user.name}</p>
        </div>
        <LogoutButton />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Mis pedidos</h2>
        <MyOrdersList orders={orders} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">Mis datos</h2>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md">
          <ProfileForm user={user} />
        </div>
      </section>
    </div>
  );
}
