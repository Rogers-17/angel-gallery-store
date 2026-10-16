import { describe, expect, it } from "vitest";
import { lookupSchema, normalizeOrderNumber } from "./lookup-schema";

describe("normalizeOrderNumber", () => {
  it.each([
    ["AG-1027", "AG-1027"],
    ["ag1027", "AG-1027"],
    ["#AG-1027", "AG-1027"],
    [" ag - 1027 ", "AG-1027"],
    ["1027", "AG-1027"],
    ["AG-123456789", "AG-123456789"],
  ])("normalises %j", (input, expected) => {
    expect(normalizeOrderNumber(input)).toBe(expected);
  });

  it.each([[""], ["AG-"], ["AG-12"], ["AB-1027"], ["1027a"], ["AG-1234567890"]])("rejects %j", (input) => {
    expect(normalizeOrderNumber(input)).toBeNull();
  });
});

describe("lookupSchema", () => {
  it("normalises both fields", () => {
    expect(lookupSchema.parse({ orderNumber: "1027", phone: "077 012 3456" })).toEqual({
      orderNumber: "AG-1027",
      phone: "+231770123456",
    });
  });

  it("reports both fields when missing or invalid", () => {
    const result = lookupSchema.safeParse({ orderNumber: "nope" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual(["orderNumber", "phone"]);
  });
});
