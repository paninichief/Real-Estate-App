/**
 * Down payment can be entered as a dollar amount or as a percentage of
 * purchase price. This module is pure unit conversion between the two — it
 * performs no financial calculation and is never a substitute for the
 * FinancialEngine, which always receives the resolved dollar amount.
 */
export type DownPaymentMode = "amount" | "percent";

function isValidPurchasePrice(purchasePrice: number | null): purchasePrice is number {
  return purchasePrice !== null && purchasePrice > 0;
}

/** Down payment percent -> dollar amount, e.g. 20% of $150,000 = $30,000. */
export function percentToAmount(purchasePrice: number | null, percent: number | null): number | null {
  if (!isValidPurchasePrice(purchasePrice) || percent === null) return null;
  return purchasePrice * (percent / 100);
}

/** Down payment dollar amount -> percent, e.g. $30,000 of $150,000 = 20%. */
export function amountToPercent(purchasePrice: number | null, amount: number | null): number | null {
  if (!isValidPurchasePrice(purchasePrice) || amount === null) return null;
  return (amount / purchasePrice) * 100;
}

export function validateDownPaymentPercent(percent: number | null): string | undefined {
  if (percent === null) return undefined;
  if (percent < 0 || percent > 100) {
    return "Down payment percentage must be between 0 and 100.";
  }
  return undefined;
}

/**
 * Formats a number for an editable percent input: up to four decimal
 * places, with trailing zeros trimmed (20 rather than 20.0000).
 */
export function formatPercentInput(value: number): string {
  return Number(value.toFixed(4)).toString();
}

/**
 * Formats a number for the editable dollar-amount input: up to two decimal
 * places (cents), with trailing zeros trimmed.
 */
export function formatDownPaymentAmountForInput(value: number): string {
  return Number(value.toFixed(2)).toString();
}
