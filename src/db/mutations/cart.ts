import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cartItems, carts, products, productVariants } from "@/db/schema";
import { CART_TTL_DAYS } from "@/lib/cart/limits";

// Cart writes. Every statement that touches lines is scoped to a cart id the caller verified from
// the signed cookie (src/lib/cart/cookie.ts), so one cart can never change another's lines.
// neon-http has no interactive transactions: reads happen first, and each write set runs as one
// batch (a single transaction). Phase 4's placeOrder re-validates everything before an order.

const expiry = () => sql`now() + make_interval(days => ${CART_TTL_DAYS})`;

/** A variant's purchasability, or null if it doesn't exist. */
export async function getVariantForCart(variantId: string) {
  const [row] = await getDb()
    .select({ stock: productVariants.stock, status: products.status })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.id, variantId));
  return row ? { stock: row.stock, active: row.status === "active" } : null;
}

/** For an unexpired cart: this variant's current quantity (0 if absent) and the line count. Null if the cart is gone or expired. */
export async function getCartState(cartId: string, variantId: string) {
  const [row] = await getDb()
    .select({
      lineQuantity: sql<number>`coalesce((select ${cartItems.quantity} from ${cartItems} where ${cartItems.cartId} = ${carts.id} and ${cartItems.variantId} = ${variantId}), 0)`.mapWith(Number),
      lineCount: sql<number>`(select count(*) from ${cartItems} where ${cartItems.cartId} = ${carts.id})`.mapWith(Number),
    })
    .from(carts)
    .where(and(eq(carts.id, cartId), sql`${carts.expiresAt} > now()`));
  return row ?? null;
}

/** Creates a cart holding one line. Returns the new cart id. */
export async function createCartWithLine(variantId: string, quantity: number): Promise<string> {
  const db = getDb();
  const cartId = randomUUID();
  await db.batch([
    db.insert(carts).values({ id: cartId, expiresAt: expiry() }),
    db.insert(cartItems).values({ cartId, variantId, quantity }),
  ]);
  return cartId;
}

/** Adds to a line (creating it if needed), capped at `cap`, and renews the cart. Returns the line's new quantity. */
export async function addToLine(cartId: string, variantId: string, quantity: number, cap: number): Promise<number> {
  const db = getDb();
  const [[line]] = await db.batch([
    db
      .insert(cartItems)
      .values({ cartId, variantId, quantity: Math.min(quantity, cap) })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.variantId],
        set: { quantity: sql`least(${cartItems.quantity} + excluded.quantity, ${cap})`, updatedAt: sql`now()` },
      })
      .returning({ quantity: cartItems.quantity }),
    db.update(carts).set({ expiresAt: expiry() }).where(eq(carts.id, cartId)),
  ]);
  return line.quantity;
}

/** Sets an existing line's quantity and renews the cart. */
export async function setLineQuantity(cartId: string, variantId: string, quantity: number): Promise<void> {
  const db = getDb();
  await db.batch([
    db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId))),
    db.update(carts).set({ expiresAt: expiry() }).where(eq(carts.id, cartId)),
  ]);
}

/** Removes a line and renews the cart. */
export async function removeLine(cartId: string, variantId: string): Promise<void> {
  const db = getDb();
  await db.batch([
    db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId))),
    db.update(carts).set({ expiresAt: expiry() }).where(eq(carts.id, cartId)),
  ]);
}

/** Deletes up to `limit` expired carts (lines cascade). Returns how many were deleted. */
export async function deleteExpiredCarts(limit = 500): Promise<number> {
  const db = getDb();
  const expired = db
    .select({ id: carts.id })
    .from(carts)
    .where(lt(carts.expiresAt, sql`now()`))
    .limit(limit);
  const deleted = await db.delete(carts).where(inArray(carts.id, expired)).returning({ id: carts.id });
  return deleted.length;
}
