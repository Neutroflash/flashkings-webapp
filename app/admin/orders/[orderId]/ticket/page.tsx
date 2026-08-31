import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvoiceTicketData } from "@/lib/admin-api";
import { TicketComprobante } from "@/components/invoice/TicketComprobante";
import { TicketActions } from "@/components/invoice/TicketActions";

interface TicketPageProps {
  params: { orderId: string };
}

export default async function OrderTicketPage({ params }: TicketPageProps) {
  const data = await getInvoiceTicketData(params.orderId);
  if (!data) notFound();

  const fileName = `${data.comprobante.serie}-${String(data.comprobante.numero).padStart(8, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4 py-4 print:gap-0 print:py-0">
      <div className="w-full max-w-md print:hidden">
        <Link href={`/admin/orders/${params.orderId}`} className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Volver al pedido
        </Link>
      </div>
      <TicketComprobante data={data} />
      <TicketActions targetId="ticket-comprobante" fileName={fileName} />
    </div>
  );
}
