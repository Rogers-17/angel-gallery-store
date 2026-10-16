import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashOrderToken, newIdempotencyKey, orderTokenFor, verifyOrderToken } from "./token";

describe("order tokens", () => {
  beforeEach(() => vi.stubEnv("ORDER_TOKEN_SECRET", "unit-test-secret-0123456789abcdefghijklmnop"));
  afterEach(() => vi.unstubAllEnvs());

  it("creates 22-character base64url idempotency keys", () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(newIdempotencyKey()).not.toBe(key);
  });

  it("derives the same token for the same key, and different tokens otherwise", () => {
    const token = orderTokenFor("key-one");
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(orderTokenFor("key-one")).toBe(token);
    expect(orderTokenFor("key-two")).not.toBe(token);

    vi.stubEnv("ORDER_TOKEN_SECRET", "another-secret-0123456789abcdefghijklmnopq");
    expect(orderTokenFor("key-one")).not.toBe(token);
  });

  it("verifies a token against its stored hash only", () => {
    const token = orderTokenFor("key-one");
    const hash = hashOrderToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyOrderToken(token, hash)).toBe(true);

    const tampered = `${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;
    expect(verifyOrderToken(tampered, hash)).toBe(false);
    expect(verifyOrderToken("not a token", hash)).toBe(false);
    expect(verifyOrderToken("", hash)).toBe(false);
    expect(verifyOrderToken(orderTokenFor("key-two"), hash)).toBe(false);
  });

  it("refuses a missing or short secret", () => {
    vi.stubEnv("ORDER_TOKEN_SECRET", "too-short");
    expect(() => orderTokenFor("key-one")).toThrow(/at least 32 characters/);
  });
});
