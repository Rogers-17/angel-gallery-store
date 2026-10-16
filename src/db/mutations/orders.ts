import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { cartItems, carts, orderEvents, orderItems, orders, productImages, storeSettings, type PaymentMethod } from "@/db/schema";
import { getDb } from "@/db";
import { withTransaction } from "@/db/transaction";
import type { Fulfilment } from "@/lib/orders/labels";

// Order placement. One interactive transaction: the order, its snapshot lines, the first status
// event and the cart deletion commit together or not at all. Prices, stock, totals, the LRD rate
// and the order number all come from the database, never from the client.

export type NewOrder = {
  customerName: string;
  /** E.164. */
  whatsappPhone: string;
  email: string | null;
  fulfilment: Fulfilment;
  delivery: { area: string; street: string | null; landmark: string; notes: string | null } | null;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  accessTokenHash: string;
};

export type CartProblem = {
  productName: string;
  color: string;
  size: string;
  /** "unavailable": no longer sold; "sold_out": no stock; "low_stock": fewer than requested. */
  reason: "unavailable" | "sold_out" | "low_stock";
  available: number;
};

export type PlaceOrderResult =
  | { kind: "created"; number: string }
  | { kind: "existing"; number: string }
  | { kind: "empty" }
  | { kind: "changed"; problems: CartProblem[] };

/** The order already placed with this idempotency key, if any (a resubmit of the same form). */
export async function findOrderNumberByIdempotencyKey(idempotencyKey: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ number: orders.number })
    .from(orders)
    .where(eq(orders.idempotencyKey, idempotencyKey));
  return row?.number ?? null;
}

export async function placeOrder(cartId: string, order: NewOrder): Promise<PlaceOrderResult> {
  return withTransaction(async (tx) => {
    // Lock the cart first: a concurrent submit for the same cart waits here, then sees the
    // committed order through its idempotency key (or an empty cart).
    const [cart] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.id, cartId), sql`${carts.expiresAt} > now()`))
      .for("update");

    const [existing] = await tx
      .select({ number: orders.number })
      .from(orders)
      .where(eq(orders.idempotencyKey, order.idempotencyKey));
    if (existing) return { kind: "existing", number: existing.number };
    if (!cart) return { kind: "empty" };

    const lines = await tx.query.cartItems.findMany({
      where: eq(cartItems.cartId, cartId),
      orderBy: [asc(cartItems.createdAt)],
      with: {
        variant: {
          with: { product: { with: { images: { orderBy: [asc(productImages.position)], limit: 1 } } } },
        },
      },
    });
    if (lines.length === 0) return { kind: "empty" };

    const problems: CartProblem[] = [];
    for (const { quantity, variant } of lines) {
      const base = { productName: variant.product.name, color: variant.color, size: variant.size, available: variant.stock };
      if (variant.product.status !== "active") problems.push({ ...base, reason: "unavailable", available: 0 });
      else if (variant.stock <= 0) problems.push({ ...base, reason: "sold_out" });
      else if (quantity > variant.stock) problems.push({ ...base, reason: "low_stock" });
    }
    if (problems.length > 0) return { kind: "changed", problems };

    const [settings] = await tx
      .select({ lrdPerUsd: storeSettings.lrdPerUsd })
      .from(storeSettings)
      .where(eq(storeSettings.id, 1));
    if (!settings) throw new Error("Store settings are missing. Run `pnpm db:seed`.");

    const items = lines.map(({ quantity, variant }, position) => ({
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      unitPriceCents: variant.priceCents,
      compareAtCents: variant.compareAtCents,
      quantity,
      lineTotalCents: variant.priceCents * quantity,
      imageUrl: variant.product.images[0]?.url ?? null,
      imageAlt: variant.product.images[0]?.alt ?? null,
      position,
    }));
    const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);

    const [created] = await tx
      .insert(orders)
      .values({
        number: sql`'AG-' || nextval('order_number_seq')`,
        customerName: order.customerName,
        whatsappPhone: order.whatsappPhone,
        email: order.email,
        fulfilment: order.fulfilment,
        deliveryArea: order.delivery?.area ?? null,
        deliveryStreet: order.delivery?.street ?? null,
        deliveryLandmark: order.delivery?.landmark ?? null,
        deliveryNotes: order.delivery?.notes ?? null,
        paymentMethod: order.paymentMethod,
        subtotalCents,
        deliveryFeeCents: null,
        totalCents: subtotalCents,
        lrdPerUsd: settings.lrdPerUsd,
        accessTokenHash: order.accessTokenHash,
        idempotencyKey: order.idempotencyKey,
        whatsappConsentAt: sql`now()`,
      })
      .returning({ id: orders.id, number: orders.number });

    await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderId: created.id })));
    await tx.insert(orderEvents).values({
      orderId: created.id,
      fromStatus: null,
      toStatus: "pending",
      actor: "customer",
      note: "Order placed",
    });
    await tx.delete(carts).where(eq(carts.id, cartId)); // lines cascade

    return { kind: "created", number: created.number };
  });
}
