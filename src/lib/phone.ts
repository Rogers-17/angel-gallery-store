/**
 * Normalises a Liberian phone number to E.164 (+231…), or returns null if it isn't valid.
 * Accepts "+231 77 926 8242", "231779268242", "0779268242" or "779268242".
 * Liberian subscriber numbers are 7–9 digits after the country code (mobile: 9).
 */
export function normalizeLiberianPhone(input: string): string | null {
  let digits = input.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith("231")) digits = digits.slice(3);
  else if (digits.startsWith("00231")) digits = digits.slice(5);
  if (digits.startsWith("0")) digits = digits.slice(1);

  if (!/^[2-9]\d{6,8}$/.test(digits)) return null;
  return `+231${digits}`;
}

/** Digits only (no "+"), as wa.me links expect. */
export function toWaMeNumber(e164: string): string {
  return e164.replace(/\D/g, "");
}
