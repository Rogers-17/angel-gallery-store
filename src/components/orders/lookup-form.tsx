"use client";

import { useActionState, useEffect, useRef } from "react";
import { findOrder, type LookupState } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { type LookupField, lookupFields } from "@/lib/orders/lookup-schema";

const initialState: LookupState = { status: "idle" };

/** Order number + WhatsApp number → the order page. Works before hydration (plain form action). */
export function LookupForm() {
  const [state, formAction, pending] = useActionState(findOrder, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = lookupFields.find((field) => state.fieldErrors?.[field]);
    if (firstInvalid) formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
    else alertRef.current?.focus();
  }, [state]);

  const field = (name: LookupField, hint?: string) => ({
    id: `lookup-${name}`,
    name,
    defaultValue: values[name],
    required: true,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": [errors[name] && `lookup-${name}-error`, hint && `lookup-${name}-hint`].filter(Boolean).join(" ") || undefined,
    className: cn("field", errors[name] && "border-danger"),
  });

  const orderHint = "It's in your WhatsApp message and on your order page.";

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col">
        <label htmlFor="lookup-orderNumber" className="mb-1.5 text-small font-medium">Order number</label>
        <input {...field("orderNumber", orderHint)} type="text" inputMode="text" autoCapitalize="characters" autoComplete="off" placeholder="AG-1027" maxLength={20} />
        <p id="lookup-orderNumber-hint" className="mt-1.5 text-caption text-muted">{orderHint}</p>
        <ErrorText name="orderNumber" error={errors.orderNumber} />
      </div>

      <div className="flex flex-col">
        <label htmlFor="lookup-phone" className="mb-1.5 text-small font-medium">WhatsApp number</label>
        <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0770 123 456" maxLength={25} />
        <ErrorText name="phone" error={errors.phone} />
      </div>

      {state.formError && (
        <div
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          className="rounded-control border border-danger/30 bg-danger/5 p-4 text-small text-danger focus:outline-none"
        >
          {state.formError}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Searching…" : "Find my order"}
      </Button>
    </form>
  );
}

function ErrorText({ name, error }: { name: LookupField; error?: string }) {
  if (!error) return null;
  return (
    <p id={`lookup-${name}-error`} className="mt-1.5 text-caption text-danger">
      {error}
    </p>
  );
}
