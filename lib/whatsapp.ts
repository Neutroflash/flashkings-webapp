import { Order } from "@/types/order";
import { formatPrice } from "./utils";

/**
 * Builds a wa.me deep link pre-filled with the order summary, for the admin to message the
 * customer with one click. No WhatsApp Business API integration (needs credentials we don't
 * have) — this is the "generación de enlace directo https://wa.me/" fallback from the spec.
 */
export function buildWhatsAppLink(order: Order): string {
  const itemsText = order.items
    .map((item) => `- ${item.productVariant?.name ?? "Producto"} x${item.quantity}`)
    .join("\n");

  const message = [
    `Hola ${order.customerName}, te escribimos de Flashkings sobre tu pedido #${order.id.slice(0, 8)}.`,
    "",
    itemsText,
    "",
    `Total: ${formatPrice(order.totalAmount)}`,
    `Estado: ${order.status}`,
  ].join("\n");

  const phone = order.customerPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`;
}
