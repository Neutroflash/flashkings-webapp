import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin-api";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Server Component auth guard: UX/redirect convenience only. Real enforcement lives in the
// backend (requireRole('ADMIN') on every mutating admin route) — never trust this alone.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr] print:block print:gap-0">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="min-w-0 print:w-full">{children}</div>
    </div>
  );
}
