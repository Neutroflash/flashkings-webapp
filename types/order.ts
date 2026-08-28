export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "IN_PREPARATION" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type CancelReason = "EXPIRED_HOLD" | "PAYMENT_DECLINED" | "ADMIN_CANCELLED";

export interface OrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  price: number;
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

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  cancelReason: CancelReason | null;
  paidAt: string | null;
  cancelledAt: string | null;
  trackingNumber: string | null;
  courier: string | null;
  payment?: OrderPayment | null;
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
  totalAmount: number;
  publicKey: string;
}
