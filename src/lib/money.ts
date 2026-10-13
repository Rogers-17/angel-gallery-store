// Money helpers. Amounts are integer US cents everywhere; never use floats for money.

const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const lrdFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const rateFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 22996 → "$229.96" */
export function formatUsd(cents: number): string {
  return usdFormatter.format(cents / 100);
}

/** Whole Liberian dollars for a USD amount at `lrdPerUsd` (rounded to the nearest L$). */
export function usdCentsToLrd(cents: number, lrdPerUsd: number): number {
  return Math.round((cents * lrdPerUsd) / 100);
}

/** 22996 at 170 → "L$39,093" */
export function formatLrd(cents: number, lrdPerUsd: number): string {
  return `L$${lrdFormatter.format(usdCentsToLrd(cents, lrdPerUsd))}`;
}

/** 170 → "L$170.00" */
export function formatRate(lrdPerUsd: number): string {
  return `L$${rateFormatter.format(lrdPerUsd)}`;
}
