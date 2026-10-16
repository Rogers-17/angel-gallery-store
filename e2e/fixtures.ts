/** Every order the suite places uses this name, so the teardown can find and delete them. */
export const E2E_BUYER_NAME = "E2E Test Buyer";

/** A random Liberian mobile number, so runs never collide: "0770 123 456". */
export function randomPhone(): string {
  const digits = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `0770 ${digits.slice(0, 3)} ${digits.slice(3)}`;
}
