"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { findOrderLinkKey } from "@/db/queries/orders";
import { type LookupField, lookupFields, lookupSchema } from "@/lib/orders/lookup-schema";
import { orderTokenFor } from "@/lib/orders/token";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Order lookup for buyers who lost their link. A match only redirects to the order's existing
// tokenised link; an unknown number and a wrong phone look identical. Rate limits fail closed so a
// Redis outage can't be used to guess phones. Nothing about the lookup is logged.

export type LookupState = {
  status: "idle" | "error";
  formError?: string;
  fieldErrors?: Partial<Record<LookupField, string>>;
  values?: Partial<Record<LookupField, string>>;
};

const NOT_FOUND = "We couldn't find an order with that order number and WhatsApp number.";

export async function findOrder(_previous: LookupState, formData: FormData): Promise<LookupState> {
  const values: LookupState["values"] = {};
  for (const field of lookupFields) {
    const value = formData.get(field);
    if (typeof value === "string") values[field] = value.slice(0, 40);
  }

  const parsed = lookupSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Partial<Record<string, string[]>>;
    const fieldErrors: LookupState["fieldErrors"] = {};
    for (const field of lookupFields) {
      const message = flat[field]?.[0];
      if (message) fieldErrors[field] = message;
    }
    return { status: "error", fieldErrors, values };
  }
  const { orderNumber, phone } = parsed.data;

  let destination: string;
  try {
    const byIp = await rateLimit("lookup:ip", await clientIp(), { failClosed: true });
    const byOrder = byIp === "allowed" ? await rateLimit("lookup:order", orderNumber, { failClosed: true }) : byIp;
    if (byOrder === "limited") {
      return { status: "error", formError: "Too many attempts. Please wait a few minutes, or message us on WhatsApp.", values };
    }
    if (byOrder === "unavailable") {
      return { status: "error", formError: "Order lookup is busy. Please try again in a minute.", values };
    }

    const key = await findOrderLinkKey(orderNumber, phone);
    if (!key) return { status: "error", formError: NOT_FOUND, values };
    destination = `/orders/${orderNumber}?token=${orderTokenFor(key)}`;
  } catch (error) {
    console.error("[orders] lookup failed:", error instanceof Error ? error.name : "unknown error");
    return { status: "error", formError: "Something went wrong. Please try again.", values };
  }

  redirect(destination);
}
