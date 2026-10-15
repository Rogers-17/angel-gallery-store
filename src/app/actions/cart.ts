"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import {
  addToLine,
  createCartWithLine,
  deleteExpiredCarts,
  getCartState,
  getVariantForCart,
  removeLine,
  setLineQuantity,
} from "@/db/mutations/cart";
import { readCartId, setCartCookie } from "@/lib/cart/cookie";
import { lineCap, MAX_CART_LINES, MAX_LINE_QUANTITY } from "@/lib/cart/limits";

// Cart Server Actions. They are public POST endpoints: input is only a variant id and a quantity
// (validated here); the cart always comes from the signed cookie; prices and stock are re-read
// from the database. Results are short messages, never rows.

export type CartActionResult = { ok: true; message: string } | { ok: false; error: string };

const addInput = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY),
});

const lineInput = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

const removeInput = z.object({ variantId: z.uuid() });

const GENERIC_ERROR = "Something went wrong. Please try again.";

async function add(input: unknown): Promise<CartActionResult> {
  const parsed = addInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose an available option first." };
  const { variantId, quantity } = parsed.data;

  try {
    const cookieCartId = await readCartId();
    const [variant, state] = await Promise.all([
      getVariantForCart(variantId),
      cookieCartId ? getCartState(cookieCartId, variantId) : null,
    ]);

    if (!variant || !variant.active) return { ok: false, error: "This item is no longer available." };
    if (variant.stock <= 0) return { ok: false, error: "This option is sold out." };

    const cap = lineCap(variant.stock);
    const existing = state?.lineQuantity ?? 0;
    if (existing >= cap) {
      return { ok: false, error: `Your bag already has ${existing}, the most available.` };
    }
    if (state && existing === 0 && state.lineCount >= MAX_CART_LINES) {
      return { ok: false, error: `Your bag can hold up to ${MAX_CART_LINES} different items.` };
    }

    let cartId: string;
    let newQuantity: number;
    if (state && cookieCartId) {
      cartId = cookieCartId;
      newQuantity = await addToLine(cartId, variantId, quantity, cap);
    } else {
      newQuantity = Math.min(quantity, cap);
      cartId = await createCartWithLine(variantId, newQuantity);
      // A new cart is a good moment to sweep a batch of expired ones, after the response.
      after(async () => {
        try {
          await deleteExpiredCarts();
        } catch (error) {
          console.error("[cart] expired cart cleanup failed:", error);
        }
      });
    }

    await setCartCookie(cartId);
    refresh();
    return newQuantity < existing + quantity
      ? { ok: true, message: `Only ${cap} available, your bag has ${newQuantity}.` }
      : { ok: true, message: "Added to your bag." };
  } catch (error) {
    console.error("[cart] add failed:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Adds a variant (quantity 1–10) to the visitor's cart, creating the cart if needed. */
export async function addToCart(input: { variantId: string; quantity: number }): Promise<CartActionResult> {
  return add(input);
}

/** Adds a variant, then goes to the bag. (Phase 4: straight to /checkout.) */
export async function buyNow(input: { variantId: string; quantity: number }): Promise<CartActionResult> {
  const result = await add(input);
  if (!result.ok) return result;
  redirect("/cart");
}

/** Form action: sets a line's quantity (0 removes it), clamped to what's available. */
export async function updateCartLine(formData: FormData): Promise<void> {
  const parsed = lineInput.safeParse(Object.fromEntries(formData));
  const cartId = await readCartId();
  if (!parsed.success || !cartId) return;
  const { variantId, quantity } = parsed.data;

  try {
    const [variant, state] = await Promise.all([getVariantForCart(variantId), getCartState(cartId, variantId)]);
    if (!state || state.lineQuantity === 0) return;

    if (quantity === 0) {
      await removeLine(cartId, variantId);
    } else if (variant?.active && variant.stock > 0) {
      await setLineQuantity(cartId, variantId, Math.min(quantity, lineCap(variant.stock)));
    } else {
      return; // Unavailable lines can only be removed.
    }
    await setCartCookie(cartId);
    refresh();
  } catch (error) {
    console.error("[cart] update failed:", error);
  }
}

/** Form action: removes a line from the visitor's cart. */
export async function removeCartLine(formData: FormData): Promise<void> {
  const parsed = removeInput.safeParse(Object.fromEntries(formData));
  const cartId = await readCartId();
  if (!parsed.success || !cartId) return;

  try {
    await removeLine(cartId, parsed.data.variantId);
    await setCartCookie(cartId);
    refresh();
  } catch (error) {
    console.error("[cart] remove failed:", error);
  }
}
