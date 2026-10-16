"use client";

import Link from "next/link";
import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { type CheckoutState, placeOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/db/schema";
import { cn } from "@/lib/cn";
import { type CheckoutField, checkoutFields } from "@/lib/orders/checkout-schema";
import { fulfilmentOptions } from "@/lib/orders/labels";
import { ChoiceCard } from "./choice-card";

type CheckoutFormProps = {
  /** Rendered per checkout visit; a resubmit with the same key returns the same order. */
  idempotencyKey: string;
  paymentOptions: { value: PaymentMethod; label: string; summary: string }[];
  /** Problems with the bag found while rendering; the form can't be submitted until they're fixed. */
  problems: string[];
};

const initialState: CheckoutState = { status: "idle" };

/**
 * The checkout form. A plain <form> bound to the placeOrder Server Action through useActionState,
 * so it also works before hydration. After an error, fields repopulate from the returned values
 * (React resets uncontrolled forms after an action) and focus moves to the first invalid field.
 */
export function CheckoutForm({ idempotencyKey, paymentOptions, problems }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const blocked = problems.length > 0;

  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = checkoutFields.find((field) => state.fieldErrors?.[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
    } else {
      alertRef.current?.focus();
    }
  }, [state]);

  const field = (name: CheckoutField, { hint = false } = {}) => ({
    id: `checkout-${name}`,
    name,
    defaultValue: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby":
      [errors[name] && `checkout-${name}-error`, hint && `checkout-${name}-hint`].filter(Boolean).join(" ") || undefined,
    className: cn("field", errors[name] && "border-danger"),
  });

  const fulfilment = values.fulfilment ?? "delivery";
  const formError = state.formError ?? (blocked ? "Some items in your bag changed since you added them:" : undefined);
  const problemList = state.problems ?? (state.formError ? undefined : problems);
  const link = state.link ?? (blocked ? { href: "/cart", label: "Review your bag" } : undefined);

  return (
    <form ref={formRef} action={formAction} noValidate aria-describedby="checkout-note">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      {/* Honeypot: hidden from people and assistive tech; bots that fill it are ignored. */}
      <div aria-hidden className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Section step={1} title="Your Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="fullName" error={errors.fullName}>
            <input {...field("fullName")} type="text" autoComplete="name" maxLength={80} required />
          </Field>
          <Field
            label="WhatsApp number"
            name="phone"
            error={errors.phone}
            hint="Liberian number you use on WhatsApp. We'll confirm your order there."
          >
            <input {...field("phone", { hint: true })} type="tel" inputMode="tel" autoComplete="tel" placeholder="0770 123 456" maxLength={25} required />
          </Field>
          <Field label="Email" optional name="email" error={errors.email} hint="For your records. We never share it." className="sm:col-span-2">
            <input {...field("email", { hint: true })} type="email" inputMode="email" autoComplete="email" maxLength={254} />
          </Field>
        </div>
      </Section>

      <Section step={2} title="Delivery or Pickup" className="group">
        <div role="radiogroup" aria-label="Delivery or pickup" className="grid gap-3 sm:grid-cols-2">
          {fulfilmentOptions.map((option) => (
            <ChoiceCard
              key={option.value}
              id={`checkout-fulfilment-${option.value}`}
              name="fulfilment"
              value={option.value}
              label={option.label}
              description={option.description}
              defaultChecked={fulfilment === option.value}
              required
            />
          ))}
        </div>
        <ErrorText name="fulfilment" error={errors.fulfilment} />

        {/* Hidden by CSS when Pickup is checked, so it also works without JavaScript. */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 group-has-[#checkout-fulfilment-pickup:checked]:hidden">
          <Field label="Area / community" name="area" error={errors.area}>
            <input {...field("area")} type="text" autoComplete="address-level3" placeholder="e.g. Sinkor, Paynesville, Congo Town" maxLength={80} />
          </Field>
          <Field label="Street" optional name="street" error={errors.street}>
            <input {...field("street")} type="text" autoComplete="address-line1" maxLength={120} />
          </Field>
          <Field label="Nearest landmark" name="landmark" error={errors.landmark} className="sm:col-span-2">
            <input {...field("landmark")} type="text" placeholder="e.g. opposite the Total station" maxLength={120} />
          </Field>
          <Field label="Delivery notes" optional name="notes" error={errors.notes} className="sm:col-span-2">
            <textarea {...field("notes")} rows={3} maxLength={300} className={cn("field h-auto min-h-24 py-3", errors.notes && "border-danger")} />
          </Field>
        </div>
      </Section>

      <Section step={3} title="Payment Method">
        <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
          {paymentOptions.map((option) => (
            <ChoiceCard
              key={option.value}
              name="paymentMethod"
              value={option.value}
              label={option.label}
              description={option.summary}
              defaultChecked={values.paymentMethod === option.value}
              invalid={Boolean(errors.paymentMethod)}
              describedBy={errors.paymentMethod ? "checkout-paymentMethod-error" : undefined}
              required
            />
          ))}
        </div>
        <ErrorText name="paymentMethod" error={errors.paymentMethod} />
      </Section>

      <div className="mt-8 flex flex-col gap-5">
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-small">
            <input
              type="checkbox"
              name="consent"
              defaultChecked={values.consent === "on"}
              required
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "checkout-consent-error" : undefined}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            <span>I agree to be contacted on WhatsApp about this order.</span>
          </label>
          <ErrorText name="consent" error={errors.consent} />
        </div>

        {formError && (
          <div
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className="rounded-control border border-danger/30 bg-danger/5 p-4 text-small text-danger focus:outline-none"
          >
            <p>{formError}</p>
            {problemList && problemList.length > 0 && (
              <ul className="mt-2 list-disc pl-5">
                {problemList.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            )}
            {link && (
              <Link href={link.href} className="link-inline mt-2 inline-block font-medium">
                {link.label}
              </Link>
            )}
          </div>
        )}

        <div>
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending || blocked} aria-busy={pending || undefined}>
            {pending ? "Placing order…" : "Place order"}
          </Button>
          <p id="checkout-note" className="mt-3 text-center text-caption text-muted">
            Next, you&apos;ll send your order to us on WhatsApp to agree delivery and payment. Nothing is charged online.
          </p>
        </div>
      </div>
    </form>
  );
}

function Section({ step, title, className, children }: { step: number; title: string; className?: string; children: ReactNode }) {
  return (
    <fieldset className={cn("hairline mt-8 border-t pt-8 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0", className)}>
      <legend className="float-left mb-5 w-full font-display text-h4 font-heading">
        <span className="text-muted">{step} · </span>
        {title}
      </legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

function Field({ label, name, optional, hint, error, className, children }: {
  label: string;
  name: CheckoutField;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={`checkout-${name}`} className="mb-1.5 text-small font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={`checkout-${name}-hint`} className="mt-1.5 text-caption text-muted">
          {hint}
        </p>
      )}
      <ErrorText name={name} error={error} />
    </div>
  );
}

function ErrorText({ name, error }: { name: CheckoutField; error?: string }) {
  if (!error) return null;
  return (
    <p id={`checkout-${name}-error`} className="mt-1.5 text-caption text-danger">
      {error}
    </p>
  );
}
