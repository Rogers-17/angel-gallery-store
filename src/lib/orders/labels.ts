// Display labels for order data (client-safe).
import type { PaymentMethod } from "@/db/schema";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Fulfilment = "delivery" | "pickup";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Checkout order of the payment options. */
export const paymentMethods: PaymentMethod[] = ["cash_on_delivery", "mtn_momo", "orange_money"];

/** Fallback labels; the store settings hold the admin-editable ones. */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash_on_delivery: "Cash on delivery",
  mtn_momo: "MTN Mobile Money",
  orange_money: "Orange Money",
};

/** One-line explanations shown on the checkout payment options. */
export const paymentMethodSummaries: Record<PaymentMethod, string> = {
  cash_on_delivery: "Pay in cash (USD or LRD) when you receive your order.",
  mtn_momo: "Pay with MoMo (*156#) after we confirm your order on WhatsApp.",
  orange_money: "Pay with Orange Money (*144#) after we confirm your order on WhatsApp.",
};

export const fulfilmentOptions: { value: Fulfilment; label: string; description: string }[] = [
  { value: "delivery", label: "Delivery", description: "Anywhere in Montserrado County. The fee is agreed on WhatsApp." },
  { value: "pickup", label: "Pickup", description: "Collect your order. We'll agree the pickup point on WhatsApp." },
];

/** "+231779268242" → "+231 77 926 8242" (other shapes are returned unchanged). */
export function formatPhone(e164: string): string {
  const match = /^\+231(\d{2})(\d{3})(\d{2,4})$/.exec(e164);
  return match ? `+231 ${match[1]} ${match[2]} ${match[3]}` : e164;
}
