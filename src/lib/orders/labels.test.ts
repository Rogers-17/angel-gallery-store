import { describe, expect, it } from "vitest";
import { formatPhone } from "./labels";

describe("formatPhone", () => {
  it("groups Liberian numbers for display", () => {
    expect(formatPhone("+231779268242")).toBe("+231 77 926 8242");
    expect(formatPhone("+2312212345")).toBe("+231 22 123 45");
  });

  it("passes other shapes through unchanged", () => {
    expect(formatPhone("+442079460958")).toBe("+442079460958");
    expect(formatPhone("")).toBe("");
  });
});
