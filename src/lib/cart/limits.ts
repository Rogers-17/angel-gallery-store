// Cart limits shared by the server (actions, mutations) and client (steppers).
// MAX_LINE_QUANTITY must match the `cart_items_quantity_check` constraint in src/db/schema.ts.

/** Most of one variant a cart can hold (also capped by stock). */
export const MAX_LINE_QUANTITY = 10;

/** Most distinct variants in one cart. */
export const MAX_CART_LINES = 30;

/** Days of inactivity before a cart expires (sliding; every change renews it). */
export const CART_TTL_DAYS = 30;

/** Highest quantity a line can have: its stock, at most MAX_LINE_QUANTITY. */
export function lineCap(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_LINE_QUANTITY));
}
