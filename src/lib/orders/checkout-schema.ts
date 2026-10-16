// Validation for the checkout form (client-safe, pure; unit-tested in Phase 4 Part 2).
import { z } from "zod";
import { normalizeLiberianPhone } from "@/lib/phone";

/** Form field names, shared by the form and the action. */
export const checkoutFields = [
  "fullName",
  "phone",
  "email",
  "fulfilment",
  "area",
  "street",
  "landmark",
  "notes",
  "paymentMethod",
  "consent",
] as const;
export type CheckoutField = (typeof checkoutFields)[number];

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Collapses all whitespace (including newlines) to single spaces and trims. */
function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
}

/** Empty strings become undefined, so optional fields can be left blank. */
function cleanOptional(value: unknown) {
  const cleaned = clean(value);
  return cleaned === "" ? undefined : cleaned;
}

function text(max: number) {
  return z
    .string()
    .max(max, `Keep this under ${max} characters.`)
    .refine((value) => !CONTROL_CHARS.test(value), "Remove special characters.");
}

const optionalText = (max: number) => z.preprocess(cleanOptional, text(max).optional());

export const checkoutSchema = z
  .object({
    fullName: z.preprocess(
      clean,
      z.string({ error: "Enter your full name." }).min(2, "Enter your full name.").pipe(text(80)),
    ),
    phone: z.preprocess(
      clean,
      z
        .string({ error: "Enter your WhatsApp number." })
        .min(1, "Enter your WhatsApp number.")
        .max(25, "Enter a Liberian WhatsApp number, e.g. 0770 123 456.")
        .refine((value) => normalizeLiberianPhone(value) !== null, "Enter a Liberian WhatsApp number, e.g. 0770 123 456.")
        .transform((value) => normalizeLiberianPhone(value)!),
    ),
    email: z.preprocess(cleanOptional, z.email("Enter a valid email, or leave it blank.").max(254).optional()),
    fulfilment: z.enum(["delivery", "pickup"], { error: "Choose delivery or pickup." }),
    area: optionalText(80),
    street: optionalText(120),
    landmark: optionalText(120),
    notes: optionalText(300),
    paymentMethod: z.enum(["cash_on_delivery", "mtn_momo", "orange_money"], {
      error: "Choose how you'd like to pay.",
    }),
    consent: z.literal("on", { error: "Please agree to be contacted on WhatsApp." }),
    idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
    /** Honeypot: hidden from people, so it must stay empty. */
    website: z.string().optional(),
  })
  .superRefine(
    (data, ctx) => {
      if (!data.area) ctx.addIssue({ code: "custom", path: ["area"], message: "Enter your area or community." });
      if (!data.landmark) ctx.addIssue({ code: "custom", path: ["landmark"], message: "Enter a landmark near you." });
    },
    // Run even when other fields failed, so every error shows on the first submit.
    { when: (payload) => (payload.value as { fulfilment?: unknown } | undefined)?.fulfilment === "delivery" },
  )
  .transform(({ area, street, landmark, notes, ...rest }) =>
    rest.fulfilment === "delivery"
      ? { ...rest, delivery: { area: area!, street: street ?? null, landmark: landmark!, notes: notes ?? null } }
      : { ...rest, delivery: null },
  );

export type CheckoutInput = z.output<typeof checkoutSchema>;
