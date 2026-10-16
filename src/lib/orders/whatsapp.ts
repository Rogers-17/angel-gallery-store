// Builds the buyer → admin WhatsApp message for an order (pure; unit-tested in Phase 4 Part 2).
// Plain wa.me click-to-chat only: nothing is sent automatically.
import { formatLrd, formatUsd } from "@/lib/money";
import { toWaMeNumber } from "@/lib/phone";
import { formatPhone, type Fulfilment } from "./labels";

/** Used when store_settings.order_message_template is empty. */
export const DEFAULT_ORDER_TEMPLATE = `Hello Angel Gallery! I'd like to place order {{order_number}}.

{{items}}

Subtotal: {{subtotal}}
Delivery fee: to agree here
{{fulfilment}}
Payment: {{payment_method}}

Name: {{customer_name}}
WhatsApp: {{customer_phone}}

Order details: {{order_link}}`;

/** Message text budget before URL encoding, so wa.me links stay well within URL limits. */
export const MAX_MESSAGE_LENGTH = 1800;

export type WhatsAppOrder = {
  number: string;
  customerName: string;
  /** E.164. */
  whatsappPhone: string;
  fulfilment: Fulfilment;
  delivery: { area: string; street: string | null; landmark: string; notes: string | null } | null;
  paymentMethodLabel: string;
  subtotalCents: number;
  /** The order's snapshot rate. */
  lrdPerUsd: number;
  items: { productName: string; color: string; size: string; quantity: number; lineTotalCents: number }[];
};

function itemLines(order: WhatsAppOrder, shown: number): string {
  const lines = order.items
    .slice(0, shown)
    .map((item) => `• ${item.quantity} × ${item.productName} (${item.color} / ${item.size}) – ${formatUsd(item.lineTotalCents)}`);
  const hidden = order.items.length - shown;
  if (hidden > 0) lines.push(`…and ${hidden} more ${hidden === 1 ? "item" : "items"} (see order details)`);
  return lines.join("\n");
}

function fulfilmentLines(order: WhatsAppOrder, notesMax: number): string {
  if (order.fulfilment === "pickup" || !order.delivery) return "Pickup: point to agree on WhatsApp";
  const { area, street, landmark, notes } = order.delivery;
  const lines = [`Delivery: ${street ? `${area}, ${street}` : area}`, `Landmark: ${landmark}`];
  if (notes && notesMax > 0) {
    lines.push(`Notes: ${notes.length > notesMax ? `${notes.slice(0, notesMax - 1)}…` : notes}`);
  }
  return lines.join("\n");
}

/** Replaces {{placeholders}} in one pass over the template, so buyer text is never re-expanded. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => (key in values ? values[key] : match));
}

/**
 * The pre-filled message. Long orders are summarised to fit MAX_MESSAGE_LENGTH: items collapse
 * first, then delivery notes are trimmed, then the text is cut.
 */
export function buildOrderMessage(
  order: WhatsAppOrder,
  { template, orderLink }: { template?: string | null; orderLink: string },
): string {
  const render = (shown: number, notesMax: number) =>
    fill(template?.trim() || DEFAULT_ORDER_TEMPLATE, {
      order_number: order.number,
      items: itemLines(order, shown),
      subtotal: `${formatUsd(order.subtotalCents)} (≈ ${formatLrd(order.subtotalCents, order.lrdPerUsd)})`,
      fulfilment: fulfilmentLines(order, notesMax),
      payment_method: order.paymentMethodLabel,
      customer_name: order.customerName,
      customer_phone: formatPhone(order.whatsappPhone),
      order_link: orderLink,
    });

  let message = render(order.items.length, 300);
  for (let shown = order.items.length - 1; message.length > MAX_MESSAGE_LENGTH && shown >= 1; shown -= 1) {
    message = render(shown, 300);
  }
  for (const notesMax of [80, 0]) {
    if (message.length <= MAX_MESSAGE_LENGTH) break;
    message = render(1, notesMax);
  }
  return message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : message;
}

/** https://wa.me/<digits>?text=<encoded> */
export function buildWaMeUrl(e164: string, text: string): string {
  return `https://wa.me/${toWaMeNumber(e164)}?text=${encodeURIComponent(text)}`;
}
