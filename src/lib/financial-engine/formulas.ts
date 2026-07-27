import type { FinancialCalcError, FinancialCalcResult } from "./types";

type NumericInput = number | null | undefined;

function missingOrInvalid(
  value: NumericInput,
  field: string,
  options: { allowNegative?: boolean } = {},
): FinancialCalcError | undefined {
  if (value === null || value === undefined) {
    return { code: "MISSING_INPUT", field };
  }
  if (!Number.isFinite(value)) {
    return { code: "INVALID_INPUT", field, reason: "must be a finite number" };
  }
  if (!options.allowNegative && value < 0) {
    return { code: "INVALID_INPUT", field, reason: "must not be negative" };
  }
  return undefined;
}

function ok(value: number): FinancialCalcResult<number> {
  return { ok: true, value };
}

function err(error: FinancialCalcError): FinancialCalcResult<number> {
  return { ok: false, error };
}

// Monetary sums are done in integer cents to avoid binary-float drift;
// dollars are only reconstituted at each formula's return boundary.
const CENTS_PER_DOLLAR = 100;
function toCents(dollars: number): number {
  return Math.round(dollars * CENTS_PER_DOLLAR);
}
function fromCents(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}

export interface LoanAmountInput {
  totalAcquisitionCost: NumericInput;
  downPayment: NumericInput;
}

/** Loan Amount = Total Acquisition Cost - Down Payment */
export function loanAmount(input: LoanAmountInput): FinancialCalcResult<number> {
  const costError = missingOrInvalid(input.totalAcquisitionCost, "totalAcquisitionCost", { allowNegative: true });
  if (costError) return err(costError);
  const downPaymentError = missingOrInvalid(input.downPayment, "downPayment");
  if (downPaymentError) return err(downPaymentError);

  const costCents = toCents(input.totalAcquisitionCost as number);
  const downPaymentCents = toCents(input.downPayment as number);
  return ok(fromCents(costCents - downPaymentCents));
}

export interface MonthlyMortgagePaymentInput {
  loanAmount: NumericInput;
  /** Annual interest rate as a decimal, e.g. 0.065 for 6.5%. */
  interestRate: NumericInput;
  loanTermYears: NumericInput;
}

/** Monthly Mortgage Payment = PMT(interestRate / 12, loanTermYears * 12, -loanAmount) */
export function monthlyMortgagePayment(input: MonthlyMortgagePaymentInput): FinancialCalcResult<number> {
  const loanError = missingOrInvalid(input.loanAmount, "loanAmount", { allowNegative: true });
  if (loanError) return err(loanError);
  const rateError = missingOrInvalid(input.interestRate, "interestRate", { allowNegative: true });
  if (rateError) return err(rateError);
  const termError = missingOrInvalid(input.loanTermYears, "loanTermYears", { allowNegative: true });
  if (termError) return err(termError);

  const loan = input.loanAmount as number;
  const annualRate = input.interestRate as number;
  const termYears = input.loanTermYears as number;

  if (termYears <= 0) {
    return err({ code: "INVALID_INPUT", field: "loanTermYears", reason: "must be greater than zero" });
  }

  const numberOfPayments = termYears * 12;
  const monthlyRate = annualRate / 12;

  let payment: number;
  if (monthlyRate === 0) {
    payment = loan / numberOfPayments;
  } else {
    const denominator = 1 - Math.pow(1 + monthlyRate, -numberOfPayments);
    if (denominator === 0 || !Number.isFinite(denominator)) {
      return err({ code: "DIVISION_BY_ZERO", field: "interestRate" });
    }
    payment = (monthlyRate * loan) / denominator;
  }

  if (!Number.isFinite(payment)) {
    return err({ code: "DIVISION_BY_ZERO", field: "interestRate" });
  }

  // Not cents-rounded: this is a division result, not a sum of exact currency
  // inputs, so rounding here would be premature per spec Appendix A.3.
  return ok(payment);
}

export interface AnnualRentalIncomeInput {
  monthlyRentalIncome: NumericInput;
}

/**
 * Annual Rental Income = Monthly Rental Income * 12. Cents-integer math is
 * used because the input is a raw, exact-to-the-cent user figure and
 * multiplying it by an integer constant can never produce more precision
 * than it already has — this only removes binary-float noise, it never
 * discards real information.
 */
export function annualRentalIncome(input: AnnualRentalIncomeInput): FinancialCalcResult<number> {
  const error = missingOrInvalid(input.monthlyRentalIncome, "monthlyRentalIncome", { allowNegative: true });
  if (error) return err(error);

  const cents = toCents(input.monthlyRentalIncome as number);
  return ok(fromCents(cents * 12));
}

export interface MonthlyOperatingExpensesInput {
  propertyTaxes: NumericInput;
  insurance: NumericInput;
  propertyManagement: NumericInput;
  maintenanceReserve: NumericInput;
  hoa: NumericInput;
  vacancyReserve: NumericInput;
  utilities: NumericInput;
}

export interface MonthlyNOIInput extends MonthlyOperatingExpensesInput {
  monthlyRentalIncome: NumericInput;
}

function sumMonthlyOperatingExpenseCents(
  input: MonthlyOperatingExpensesInput,
): { ok: true; cents: number } | { ok: false; error: FinancialCalcError } {
  const fields: Array<[string, NumericInput]> = [
    ["propertyTaxes", input.propertyTaxes],
    ["insurance", input.insurance],
    ["propertyManagement", input.propertyManagement],
    ["maintenanceReserve", input.maintenanceReserve],
    ["hoa", input.hoa],
    ["vacancyReserve", input.vacancyReserve],
    ["utilities", input.utilities],
  ];

  let totalCents = 0;
  for (const [field, value] of fields) {
    const error = missingOrInvalid(value, field, { allowNegative: true });
    if (error) return { ok: false, error };
    totalCents += toCents(value as number);
  }
  return { ok: true, cents: totalCents };
}

/**
 * Total Monthly Operating Expenses = Property Taxes + Insurance + Property
 * Management + Maintenance Reserve + HOA + Vacancy Reserve + Utilities.
 * Cents-integer math here is safe for the same reason as annualRentalIncome:
 * every term is a raw, exact-to-the-cent input, so summing in integer cents
 * only removes binary-float noise, never real precision.
 */
export function totalMonthlyOperatingExpenses(input: MonthlyOperatingExpensesInput): FinancialCalcResult<number> {
  const expenses = sumMonthlyOperatingExpenseCents(input);
  if (!expenses.ok) return err(expenses.error);
  return ok(fromCents(expenses.cents));
}

/**
 * Total Annual Operating Expenses = Total Monthly Operating Expenses * 12.
 * Multiplying an already cents-exact value by an integer constant stays
 * cents-exact, so this reuses the monthly cents total directly.
 */
export function totalAnnualOperatingExpenses(input: MonthlyOperatingExpensesInput): FinancialCalcResult<number> {
  const expenses = sumMonthlyOperatingExpenseCents(input);
  if (!expenses.ok) return err(expenses.error);
  return ok(fromCents(expenses.cents * 12));
}

/**
 * Monthly NOI = Monthly Rental Income - Total Monthly Operating Expenses.
 * Both operands are raw/exact-to-the-cent currency values, so cents-integer
 * subtraction is exact — not premature rounding.
 */
export function monthlyNOI(input: MonthlyNOIInput): FinancialCalcResult<number> {
  const incomeError = missingOrInvalid(input.monthlyRentalIncome, "monthlyRentalIncome", { allowNegative: true });
  if (incomeError) return err(incomeError);

  const expenses = sumMonthlyOperatingExpenseCents(input);
  if (!expenses.ok) return err(expenses.error);

  const incomeCents = toCents(input.monthlyRentalIncome as number);
  return ok(fromCents(incomeCents - expenses.cents));
}

/**
 * Annual NOI = Annual Rental Income - Total Annual Operating Expenses, which
 * is algebraically 12 * Monthly NOI since both terms are simply their
 * monthly counterparts multiplied by 12.
 */
export function annualNOI(input: MonthlyNOIInput): FinancialCalcResult<number> {
  const monthly = monthlyNOI(input);
  if (!monthly.ok) return monthly;
  return ok(fromCents(toCents(monthly.value) * 12));
}

export interface MonthlyCashFlowInput {
  monthlyNOI: NumericInput;
  monthlyMortgagePayment: NumericInput;
}

/**
 * Monthly Cash Flow = Monthly NOI - Monthly Mortgage Payment. Not
 * cents-rounded: the mortgage payment is itself an unrounded division
 * result, so converting it to cents here would silently reintroduce the
 * premature rounding removed from monthlyMortgagePayment.
 */
export function monthlyCashFlow(input: MonthlyCashFlowInput): FinancialCalcResult<number> {
  const noiError = missingOrInvalid(input.monthlyNOI, "monthlyNOI", { allowNegative: true });
  if (noiError) return err(noiError);
  const paymentError = missingOrInvalid(input.monthlyMortgagePayment, "monthlyMortgagePayment", {
    allowNegative: true,
  });
  if (paymentError) return err(paymentError);

  return ok((input.monthlyNOI as number) - (input.monthlyMortgagePayment as number));
}

export interface AnnualCashFlowInput {
  monthlyCashFlow: NumericInput;
}

/**
 * Annual Cash Flow = Monthly Cash Flow * 12. Not cents-rounded, for the same
 * reason as monthlyCashFlow: its input may already carry sub-cent precision
 * from an unrounded mortgage payment.
 */
export function annualCashFlow(input: AnnualCashFlowInput): FinancialCalcResult<number> {
  const error = missingOrInvalid(input.monthlyCashFlow, "monthlyCashFlow", { allowNegative: true });
  if (error) return err(error);

  return ok((input.monthlyCashFlow as number) * 12);
}

export interface CapRateInput {
  annualNOI: NumericInput;
  totalAcquisitionCost: NumericInput;
}

/** Cap Rate = Annual NOI / Total Acquisition Cost */
export function capRate(input: CapRateInput): FinancialCalcResult<number> {
  const noiError = missingOrInvalid(input.annualNOI, "annualNOI", { allowNegative: true });
  if (noiError) return err(noiError);
  const costError = missingOrInvalid(input.totalAcquisitionCost, "totalAcquisitionCost", { allowNegative: true });
  if (costError) return err(costError);

  const cost = input.totalAcquisitionCost as number;
  if (cost === 0) {
    return err({ code: "DIVISION_BY_ZERO", field: "totalAcquisitionCost" });
  }
  return ok((input.annualNOI as number) / cost);
}

export interface CashOnCashReturnInput {
  annualCashFlow: NumericInput;
  downPayment: NumericInput;
}

/** Cash-on-Cash Return = Annual Cash Flow / Down Payment Amount */
export function cashOnCashReturn(input: CashOnCashReturnInput): FinancialCalcResult<number> {
  const cashFlowError = missingOrInvalid(input.annualCashFlow, "annualCashFlow", { allowNegative: true });
  if (cashFlowError) return err(cashFlowError);
  const downPaymentError = missingOrInvalid(input.downPayment, "downPayment");
  if (downPaymentError) return err(downPaymentError);

  const downPayment = input.downPayment as number;
  if (downPayment === 0) {
    return err({ code: "DIVISION_BY_ZERO", field: "downPayment" });
  }
  return ok((input.annualCashFlow as number) / downPayment);
}

export interface PricePerSquareFootInput {
  totalAcquisitionCost: NumericInput;
  squareFootage: NumericInput;
}

/**
 * Price per Square Foot = Total Acquisition Cost / Square Footage. Not
 * cents-rounded: this is a division result, like cap rate, not a sum of
 * exact currency inputs.
 */
export function pricePerSquareFoot(input: PricePerSquareFootInput): FinancialCalcResult<number> {
  const costError = missingOrInvalid(input.totalAcquisitionCost, "totalAcquisitionCost", { allowNegative: true });
  if (costError) return err(costError);
  const sqftError = missingOrInvalid(input.squareFootage, "squareFootage");
  if (sqftError) return err(sqftError);

  const squareFootage = input.squareFootage as number;
  if (squareFootage === 0) {
    return err({ code: "DIVISION_BY_ZERO", field: "squareFootage" });
  }
  const cost = input.totalAcquisitionCost as number;
  return ok(cost / squareFootage);
}
