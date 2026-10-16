// Validation for order lookup (client-safe, pure; unit-tested).
import { z } from "zod";
import { normalizeLiberianPhone } from "@/lib/phone";

export const lookupFields = ["orderNumber", "phone"] as const;
export type LookupField = (typeof lookupFields)[number];

const ORDER_NUMBER_ERROR = "Enter your order number, e.g. AG-1027.";
const PHONE_ERROR = "Enter the WhatsApp number you ordered with.";

/** "AG-1027", "ag1027", "#AG-1027", " ag - 1027 " or "1027" → "AG-1027"; anything else → null. */
export function normalizeOrderNumber(input: string): string | null {
  const compact = input.replace(/[\s#-]/g, "").toUpperCase();
  const digits = compact.startsWith("AG") ? compact.slice(2) : compact;
  return /^\d{4,9}$/.test(digits) ? `AG-${digits}` : null;
}

export const lookupSchema = z.object({
  orderNumber: z
    .string({ error: ORDER_NUMBER_ERROR })
    .max(20, ORDER_NUMBER_ERROR)
    .refine((value) => normalizeOrderNumber(value) !== null, ORDER_NUMBER_ERROR)
    .transform((value) => normalizeOrderNumber(value)!),
  phone: z
    .string({ error: PHONE_ERROR })
    .max(25, PHONE_ERROR)
    .refine((value) => normalizeLiberianPhone(value) !== null, PHONE_ERROR)
    .transform((value) => normalizeLiberianPhone(value)!),
});

export type LookupInput = z.output<typeof lookupSchema>;
