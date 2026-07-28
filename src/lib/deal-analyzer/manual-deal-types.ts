/**
 * Parsed manual deal entry values (spec sections 10.25, 11.7). Every field is
 * `null` when left blank — optional fields are never defaulted to 0, per the
 * "no invented defaults" rule (spec section 1.2, Appendix A.3).
 */
export interface ManualDealFormValues {
  address: string | null;
  purchasePrice: number | null;
  monthlyRent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  downPayment: number | null;
  /** Entered as a percentage (e.g. 6.5); converted to a decimal only when calling the engine. */
  interestRatePercent: number | null;
  loanTermYears: number | null;
  propertyTaxes: number | null;
  insurance: number | null;
  propertyManagement: number | null;
  maintenanceReserve: number | null;
  hoa: number | null;
  vacancyReserve: number | null;
  utilities: number | null;
  /** Informational only in this pass — not used by any calculation. */
  numberOfUnits: number | null;
  /** Informational only in this pass — not used by any calculation. */
  renovationCosts: number | null;
  /** Informational only in this pass — not used by any calculation. */
  occupancy: string | null;
  /** Informational only in this pass — not used by any calculation. */
  section8Status: string | null;
}

/**
 * The result of one FinancialEngine-derived metric, honest about why a
 * value isn't shown rather than fabricating or silently omitting it:
 * - "calculated": every required input was present and the engine produced a value.
 * - "not_calculated": one or more required inputs are still blank; every one is named.
 * - "unavailable": every required input was present, but the math itself is
 *   undefined for the entered values (e.g. cash-on-cash return with an
 *   explicit $0 down payment) — distinct from a missing input.
 */
export type ManualDealMetricResult =
  | { status: "calculated"; value: number }
  | { status: "not_calculated"; missingFields: string[] }
  | { status: "unavailable"; reason: string };

export interface ManualDealCalculationResults {
  pricePerSquareFoot: ManualDealMetricResult;
  annualRentalIncome: ManualDealMetricResult;
  loanAmount: ManualDealMetricResult;
  monthlyMortgagePayment: ManualDealMetricResult;
  totalMonthlyOperatingExpenses: ManualDealMetricResult;
  totalAnnualOperatingExpenses: ManualDealMetricResult;
  monthlyNOI: ManualDealMetricResult;
  annualNOI: ManualDealMetricResult;
  monthlyCashFlow: ManualDealMetricResult;
  annualCashFlow: ManualDealMetricResult;
  capRate: ManualDealMetricResult;
  cashOnCashReturn: ManualDealMetricResult;
}
