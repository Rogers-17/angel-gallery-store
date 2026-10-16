import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkoutSchema } from "./checkout-schema";

const KEY = "AbCdEfGhIjKlMnOpQrSt_-"; // 22 base64url characters

const valid = {
  fullName: "  Test   Buyer ",
  phone: "0770 123 456",
  email: "",
  fulfilment: "delivery",
  area: "Sinkor",
  street: "",
  landmark: "opposite the Total station",
  notes: "Call\nwhen close",
  paymentMethod: "mtn_momo",
  consent: "on",
  idempotencyKey: KEY,
  website: "",
};

/** Field errors keyed by form field (input names, which differ from the parsed output shape). */
function fieldErrors(input: Record<string, unknown>): Partial<Record<string, string[]>> {
  const result = checkoutSchema.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("checkoutSchema", () => {
  it("parses a delivery order and normalises fields", () => {
    const result = checkoutSchema.parse(valid);
    expect(result.fullName).toBe("Test Buyer");
    expect(result.phone).toBe("+231770123456");
    expect(result.email).toBeUndefined();
    expect(result.delivery).toEqual({
      area: "Sinkor",
      street: null,
      landmark: "opposite the Total station",
      notes: "Call when close",
    });
  });

  it("drops address fields for pickup", () => {
    const result = checkoutSchema.parse({ ...valid, fulfilment: "pickup", area: "", landmark: "" });
    expect(result.delivery).toBeNull();
    expect(result).not.toHaveProperty("area");
  });

  it("reports every required field at once", () => {
    const errors = fieldErrors({ fulfilment: "delivery", idempotencyKey: KEY });
    expect(Object.keys(errors).sort()).toEqual(["area", "consent", "fullName", "landmark", "paymentMethod", "phone"]);
  });

  it("requires a Liberian WhatsApp number", () => {
    expect(fieldErrors({ ...valid, phone: "+44 20 7946 0958" }).phone?.[0]).toMatch(/Liberian WhatsApp number/);
  });

  it("validates email only when given", () => {
    expect(checkoutSchema.parse({ ...valid, email: " me@example.com " }).email).toBe("me@example.com");
    expect(fieldErrors({ ...valid, email: "not-an-email" }).email).toBeDefined();
  });

  it("rejects control characters and over-long text", () => {
    expect(fieldErrors({ ...valid, fullName: "Test\u0000Buyer" }).fullName).toBeDefined();
    expect(fieldErrors({ ...valid, landmark: "x".repeat(121) }).landmark).toBeDefined();
    expect(fieldErrors({ ...valid, notes: "x".repeat(301) }).notes).toBeDefined();
  });

  it("requires consent and a known payment method", () => {
    expect(fieldErrors({ ...valid, consent: undefined }).consent).toBeDefined();
    expect(fieldErrors({ ...valid, paymentMethod: "card" }).paymentMethod).toBeDefined();
  });

  it("rejects a malformed idempotency key", () => {
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: "short" }).success).toBe(false);
  });
});
