import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

// Guest access to an order: /orders/<number>?token=<token>.
// - The checkout form carries a random idempotency key (one per checkout render).
// - token = HMAC-SHA256(ORDER_TOKEN_SECRET, "order-access:" + key), so a resubmit of the same form
//   can be sent to the same link without storing the token anywhere.
// - Only sha256(token) is stored. Verification compares hashes, so rotating the secret never
//   breaks existing links.

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

/** 128 random bits, base64url (22 characters). */
export function newIdempotencyKey(): string {
  return randomBytes(16).toString("base64url");
}

export function orderTokenFor(idempotencyKey: string): string {
  return createHmac("sha256", serverEnv.orderTokenSecret).update(`order-access:${idempotencyKey}`).digest("base64url");
}

export function hashOrderToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** True when `token` is well-formed and hashes to `storedHash`. */
export function verifyOrderToken(token: string, storedHash: string): boolean {
  if (!TOKEN_SHAPE.test(token)) return false;
  const given = Buffer.from(hashOrderToken(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
