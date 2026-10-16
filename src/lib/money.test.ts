import { describe, expect, it } from "vitest";
import { formatLrd, formatRate, formatUsd, usdCentsToLrd } from "./money";

describe("formatUsd", () => {
  it("formats integer cents as dollars", () => {
    expect(formatUsd(22996)).toBe("$229.96");
    expect(formatUsd(0)).toBe("$0.00");
    expect(formatUsd(5)).toBe("$0.05");
    expect(formatUsd(123456789)).toBe("$1,234,567.89");
  });
});

describe("usdCentsToLrd", () => {
  it("converts at the rate and rounds to whole Liberian dollars", () => {
    expect(usdCentsToLrd(22996, 170)).toBe(39093); // 39,093.2
    expect(usdCentsToLrd(100, 172.5)).toBe(173); // 172.5 rounds half up
    expect(usdCentsToLrd(1, 170)).toBe(2); // 1.7
    expect(usdCentsToLrd(0, 170)).toBe(0);
  });
});

describe("formatLrd", () => {
  it("prefixes L$ and groups thousands", () => {
    expect(formatLrd(22996, 170)).toBe("L$39,093");
    expect(formatLrd(68988, 170)).toBe("L$117,280");
  });
});

describe("formatRate", () => {
  it("shows two decimals", () => {
    expect(formatRate(170)).toBe("L$170.00");
    expect(formatRate(172.5)).toBe("L$172.50");
  });
});
