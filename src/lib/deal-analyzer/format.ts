/**
 * Presentation-only formatting. Every FinancialEngine formula returns an
 * unrounded number (spec Appendix A.3: "define rounding at presentation
 * level, not during intermediate calculations") — rounding happens here,
 * once, for display, and nowhere else.
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatPercent(decimalValue: number): string {
  return `${(decimalValue * 100).toFixed(2)}%`;
}
