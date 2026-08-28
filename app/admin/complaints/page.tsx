import { getAdminComplaints } from "@/lib/admin-api";
import { ComplaintsTable } from "@/components/admin/ComplaintsTable";

export default async function AdminComplaintsPage() {
  const complaints = await getAdminComplaints();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Libro de Reclamaciones</h1>
        <p className="text-sm text-zinc-500">Plazo legal de respuesta: 15 días hábiles desde el registro.</p>
      </div>
      <ComplaintsTable complaints={complaints} />
    </div>
  );
}
