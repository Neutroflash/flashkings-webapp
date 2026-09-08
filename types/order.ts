export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  // Pagada y devuelta por completo. Distinto de CANCELLED, que es "murió sin que se moviera dinero".
  | "REFUNDED";
export type CancelReason = "EXPIRED_HOLD" | "PAYMENT_DECLINED" | "ADMIN_CANCELLED";

export interface OrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  price: number;
  /** Unidades ya devueltas de esta línea, acumuladas entre reembolsos parciales. */
  refundedQuantity: number;
  productVariant?: {
    id: string;
    sku: string;
    name: string;
  };
}

export interface OrderPayment {
  provider: string;
  providerChargeId: string | null;
  status: string;
}

export type InvoiceType = "BOLETA" | "FACTURA" | "NOTA_CREDITO";

export type RefundStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface RefundItem {
  id: string;
  orderItemId: string;
  quantity: number;
}

export interface Refund {
  id: string;
  amount: number;
  isFull: boolean;
  status: RefundStatus;
  /** Código del catálogo 09 de SUNAT — el mismo que va a la nota de crédito. */
  reasonCode: string;
  reasonText: string;
  isManual: boolean;
  restocked: boolean;
  /** Si el reembolso incluyó el flete además de los productos. */
  includesShipping: boolean;
  providerRefundId: string | null;
  createdAt: string;
  items: RefundItem[];
}

export interface RefundReason {
  code: string;
  label: string;
}

export interface OrderInvoice {
  id: string;
  type: InvoiceType;
  status: "PENDING_SUNAT" | "ISSUED" | "FAILED" | "VOID";
  series: string;
  number: number;
  documentType: string;
  documentNumber: string;
  businessName: string | null;
  pdfUrl: string | null;
  xmlUrl: string | null;
  issuedAt: string | null;
  /** Solo en NOTA_CREDITO. */
  relatedInvoiceId: string | null;
  noteReasonCode: string | null;
  refundId: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingDepartment: string | null;
  shippingProvince: string | null;
  shippingDistrict: string | null;
  shippingZone: "LIMA_METROPOLITANA" | "PROVINCIA" | null;
  /** Flete cobrado, ya incluido en totalAmount. */
  shippingCost: number;
  cancelReason: CancelReason | null;
  paidAt: string | null;
  cancelledAt: string | null;
  trackingNumber: string | null;
  courier: string | null;
  refundedAt: string | null;
  payment?: OrderPayment | null;
  /** La boleta o factura — nunca una nota de crédito. */
  invoice?: OrderInvoice | null;
  /** Las notas de crédito que corrigen ese comprobante. */
  creditNotes?: OrderInvoice[];
  refunds?: Refund[];
  createdAt: string;
  items: OrderItem[];
}

export interface CartValidationItem {
  variantId: string;
  requested: number;
  available: number;
  ok: boolean;
}

export interface CartValidationResult {
  ok: boolean;
  items: CartValidationItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  /** Ya incluye el flete. Es el monto que se le cobra a la pasarela — nunca uno recalculado en el cliente. */
  totalAmount: number;
  shippingCost: number;
  publicKey: string;
}
