/** Distinguishes why a formula could not produce a value, per spec Appendix A.3. */
export type FinancialCalcErrorCode = "MISSING_INPUT" | "INVALID_INPUT" | "DIVISION_BY_ZERO";

export interface FinancialCalcError {
  readonly code: FinancialCalcErrorCode;
  readonly field: string;
  readonly reason?: string;
}

/**
 * Every formula returns this instead of a raw number so callers can never
 * receive NaN/Infinity or a value fabricated from missing/invalid inputs.
 */
export type FinancialCalcResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: FinancialCalcError };
