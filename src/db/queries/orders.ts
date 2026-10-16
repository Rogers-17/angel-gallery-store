import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { verifyOrderToken } from "@/lib/orders/token";
import type { OrderView } from "./types";

const ORDER_NUMBER = /^AG-\d{4,9}$/;

/**
 * The order behind a guest link, or null when the number is unknown or the token doesn't match
 * (the two look identical to the caller). Request-time and per-visitor: never `use cache`, and the
 * number and token never become cache keys or tags. React `cache` dedupes metadata + page reads.
 */
export const getOrderForBuyer = cache(async (number: string, token: string): Promise<OrderView | null> => {
  if (!ORDER_NUMBER.test(number) || !token) return null;

  const order = await getDb().query.orders.findFirst({
    where: eq(orders.number, number),
    with: { items: { orderBy: [asc(orderItems.position)] } },
  });
  if (!order || !verifyOrderToken(token, order.accessTokenHash)) return null;

  return {
    number: order.number,
    status: order.status,
    placedAt: order.createdAt.toISOString(),
    customerName: order.customerName,
    whatsappPhone: order.whatsappPhone,
    email: order.email,
    fulfilment: order.fulfilment,
    delivery:
      order.fulfilment === "delivery" && order.deliveryArea && order.deliveryLandmark
        ? {
            area: order.deliveryArea,
            street: order.deliveryStreet,
            landmark: order.deliveryLandmark,
            notes: order.deliveryNotes,
          }
        : null,
    paymentMethod: order.paymentMethod,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    lrdPerUsd: order.lrdPerUsd,
    lines: order.items.map((item) => ({
      productSlug: item.productSlug,
      productName: item.productName,
      color: item.color,
      size: item.size,
      sku: item.sku,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
      image: item.imageUrl ? { url: item.imageUrl, alt: item.imageAlt ?? item.productName, objectPosition: null } : null,
    })),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
});
