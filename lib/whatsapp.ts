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

// Flashkings' own business WhatsApp number (Peru, no leading "+" or spaces). Placeholder default —
// must be replaced with the real number before launch.
const STORE_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "51999999999";

/** Builds the storefront's floating WhatsApp link, varying the pre-filled message by page. */
export function buildStorefrontWhatsAppLink(pathname: string, currentUrl?: string): string {
  let message = "Hola Flashkings, quiero más información sobre sus productos.";

  if (pathname.startsWith("/producto/")) {
    message = `Hola, tengo una consulta sobre este producto: ${currentUrl ?? pathname}`;
  } else if (pathname.startsWith("/checkout")) {
    message = "Hola, necesito ayuda para completar mi compra.";
  } else if (pathname.startsWith("/catalogo")) {
    message = "Hola, quiero más información sobre el catálogo de Flashkings.";
  }

  return `https://wa.me/${STORE_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
