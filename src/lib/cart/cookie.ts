import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { CART_TTL_DAYS } from "./limits";

// The cart id lives in an httpOnly cookie signed with CART_COOKIE_SECRET:
// "<cartId>.<base64url HMAC-SHA256(cartId)>". Anything that fails verification is ignored,
// so a tampered or stale cookie just means "no cart".

const COOKIE_NAME = "ag_cart";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sign(cartId: string): string {
  return createHmac("sha256", serverEnv.cartCookieSecret).update(cartId).digest("base64url");
}

function verify(value: string): string | null {
  const dot = value.indexOf(".");
  if (dot < 0) return null;
  const cartId = value.slice(0, dot);
  if (!UUID.test(cartId)) return null;

  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(cartId));
  return given.length === expected.length && timingSafeEqual(given, expected) ? cartId : null;
}

/** The verified cart id from the request cookie, or null. Request-time: callers sit inside <Suspense>. */
export async function readCartId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value ? verify(value) : null;
}

/** Sets (or renews) the cart cookie. Server Actions only. */
export async function setCartCookie(cartId: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, `${cartId}.${sign(cartId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_TTL_DAYS * 24 * 60 * 60,
  });
}

/** Removes the cart cookie (after an order is placed). Server Actions only. */
export async function clearCartCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
