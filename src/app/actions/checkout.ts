"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  type CartProblem,
  findOrderNumberByIdempotencyKey,
  placeOrder as createOrder,
  type PlaceOrderResult,
} from "@/db/mutations/orders";
import { clearCartCookie, readCartId } from "@/lib/cart/cookie";
import { type CheckoutField, checkoutFields, checkoutSchema } from "@/lib/orders/checkout-schema";
import { hashOrderToken, orderTokenFor } from "@/lib/orders/token";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Checkout Server Action: a public POST endpoint. Only form fields come from the client; the cart
// comes from the signed cookie and every price, total, rate and number from the database.
// Logs carry the order number at most: never names, phones, addresses or tokens.

export type CheckoutState = {
  status: "idle" | "error";
  /** Message for the whole form (shown above the submit button). */
  formError?: string;
  /** Items that changed since they were added to the bag. */
  problems?: string[];
  /** Follow-up link for the form error, e.g. back to the bag. */
  link?: { href: string; label: string };
  fieldErrors?: Partial<Record<CheckoutField, string>>;
  /** The submitted values, so the form can repopulate after an error. */
  values?: Partial<Record<CheckoutField, string>>;
};

const GENERIC_ERROR = "Something went wrong. Your order was not placed. Please try again.";

function describeProblem({ productName, color, size, reason, available }: CartProblem): string {
  const name = `${productName} (${color} / ${size})`;
  if (reason === "unavailable") return `${name} is no longer available.`;
  if (reason === "sold_out") return `${name} is sold out.`;
  return `${name}: only ${available} available.`;
}

/** Error text without query parameters (which could hold buyer details). */
function safeError(error: unknown): string {
  const cause = error instanceof Error && error.cause ? error.cause : error;
  if (cause instanceof Error) return `${cause.name}: ${cause.message}`;
  // The WebSocket driver can reject with a DOM ErrorEvent rather than an Error.
  if (cause && typeof cause === "object") {
    const { type, message } = cause as { type?: unknown; message?: unknown };
    return `${cause.constructor?.name ?? "object"}${type ? ` (${String(type)})` : ""}${message ? `: ${String(message)}` : ""}`;
  }
  return String(cause);
}

function echoValues(formData: FormData): CheckoutState["values"] {
  const values: CheckoutState["values"] = {};
  for (const field of checkoutFields) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value.slice(0, 400);
  }
  return values;
}

export async function placeOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = echoValues(formData);
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Partial<Record<string, string[]>>;
    const fieldErrors: CheckoutState["fieldErrors"] = {};
    for (const field of checkoutFields) {
      const message = flat[field]?.[0];
      if (message) fieldErrors[field] = message;
    }
    if (Object.keys(fieldErrors).length === 0) {
      // Only the hidden idempotency key failed: the page is stale or was tampered with.
      return { status: "error", formError: "Please reload the page and try again.", values };
    }
    return { status: "error", fieldErrors, values };
  }

  const input = parsed.data;
  if (input.website) {
    console.warn("[checkout] honeypot filled; no order created.");
    return { status: "error", formError: GENERIC_ERROR, values };
  }

  let destination: string;
  try {
    const token = orderTokenFor(input.idempotencyKey);

    // A resubmit of an order already placed (double click, Back + submit) goes straight to it,
    // without counting against the rate limits.
    const placed = await findOrderNumberByIdempotencyKey(input.idempotencyKey);
    if (!placed) {
      const allowed =
        (await checkRateLimit("checkout:ip", await clientIp())) && (await checkRateLimit("checkout:phone", input.phone));
      if (!allowed) {
        return {
          status: "error",
          formError: "Too many orders in a short time. Please wait a few minutes, or message us on WhatsApp.",
          values,
        };
      }
    }

    const cartId = placed ? null : await readCartId();
    const result: PlaceOrderResult = placed
      ? { kind: "existing", number: placed }
      : cartId
        ? await createOrder(cartId, {
            customerName: input.fullName,
            whatsappPhone: input.phone,
            email: input.email ?? null,
            fulfilment: input.fulfilment,
            delivery: input.delivery,
            paymentMethod: input.paymentMethod,
            idempotencyKey: input.idempotencyKey,
            accessTokenHash: hashOrderToken(token),
          })
        : { kind: "empty" };

    if (result.kind === "empty") {
      return { status: "error", formError: "Your bag is empty.", link: { href: "/shop", label: "Start shopping" }, values };
    }
    if (result.kind === "changed") {
      return {
        status: "error",
        formError: "Some items in your bag changed since you added them:",
        problems: result.problems.map(describeProblem),
        link: { href: "/cart", label: "Review your bag" },
        values,
      };
    }

    console.info(`[checkout] order ${result.number} ${result.kind === "created" ? "placed" : "resubmitted"}`);
    await clearCartCookie();
    destination = `/orders/${result.number}?token=${token}`;
  } catch (error) {
    console.error(`[checkout] placing an order failed: ${safeError(error)}`);
    return { status: "error", formError: GENERIC_ERROR, values };
  }

  redirect(destination);
}
