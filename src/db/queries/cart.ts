import "server-only";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { cartItems, carts, productImages } from "@/db/schema";
import { readCartId } from "@/lib/cart/cookie";
import { lineCap } from "@/lib/cart/limits";
import { toImage } from "./mappers";
import type { CartLine, CartView } from "./types";

/**
 * The visitor's cart, priced from live variant data. Request-time (reads cookies), so callers sit
 * inside <Suspense>. Deliberately not `use cache`: it's per-visitor, changes on every mutation and
 * must never reach the shared cache. React `cache` shares one read between the header and /cart.
 * Returns null when there's no valid, unexpired cart (no database query without a cookie).
 */
export const getCart = cache(async (): Promise<CartView | null> => {
  const cartId = await readCartId();
  if (!cartId) return null;

  const cart = await getDb().query.carts.findFirst({
    where: and(eq(carts.id, cartId), gt(carts.expiresAt, sql`now()`)),
    with: {
      items: {
        orderBy: [asc(cartItems.createdAt)],
        with: {
          variant: {
            with: {
              product: {
                with: { images: { orderBy: [asc(productImages.position)], limit: 1 } },
              },
            },
          },
        },
      },
    },
  });
  if (!cart) return null;

  const lines: CartLine[] = cart.items.map(({ variant, quantity }) => {
    const { product } = variant;
    const available = product.status === "active" && variant.stock > 0;
    const maxQuantity = available ? lineCap(variant.stock) : 0;
    return {
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0] ? toImage(product.images[0]) : null,
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      unitPriceCents: variant.priceCents,
      compareAtCents: variant.compareAtCents,
      quantity,
      maxQuantity,
      available,
      lineTotalCents: available ? variant.priceCents * Math.min(quantity, maxQuantity) : 0,
    };
  });

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotalCents: lines.reduce((sum, line) => sum + line.lineTotalCents, 0),
  };
});
