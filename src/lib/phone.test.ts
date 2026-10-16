import { describe, expect, it } from "vitest";
import { normalizeLiberianPhone, toWaMeNumber } from "./phone";

describe("normalizeLiberianPhone", () => {
  it.each([
    ["+231 77 926 8242", "+231779268242"],
    ["231779268242", "+231779268242"],
    ["0779268242", "+231779268242"],
    ["779268242", "+231779268242"],
    ["00231779268242", "+231779268242"],
    ["(077) 926-8242", "+231779268242"],
    ["0770 123 456", "+231770123456"],
    ["0886 555 111", "+231886555111"],
    ["+231 22 12345", "+2312212345"], // 7-digit landline
  ])("normalises %s", (input, expected) => {
    expect(normalizeLiberianPhone(input)).toBe(expected);
  });

  it.each([
    [""],
    ["abc"],
    ["0770 12A 456"],
    ["12"], // too short
    ["077012345678"], // too long
    ["+231 1770 123 45"], // subscriber numbers don't start with 0 or 1
    ["+44 20 7946 0958"], // not Liberian
  ])("rejects %j", (input) => {
    expect(normalizeLiberianPhone(input)).toBeNull();
  });
});

describe("toWaMeNumber", () => {
  it("keeps digits only", () => {
    expect(toWaMeNumber("+231779268242")).toBe("231779268242");
  });
});
