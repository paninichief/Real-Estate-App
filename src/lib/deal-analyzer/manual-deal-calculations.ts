import type { FinancialCalcResult } from "@/lib/financial-engine/types";
import * as formulas from "@/lib/financial-engine/formulas";
import type { ManualDealCalculationResults, ManualDealFormValues, ManualDealMetricResult } from "./manual-deal-types";

/**
 * Human-readable labels for every raw input field that can block a metric,
 * either because it's blank (`missingFieldsOf`) or because it's present but
 * fails validation (`invalidFieldsOf`, e.g. a negative expense or a down
 * payment that exceeds the purchase price). The expense fields are exempt
 * from *missingness* — a blank expense is treated as $0 (see `expenseInput`
 * below) — but they can still appear here as *invalid* when entered as a
 * negative number, so their labels stay in this single map.
 *
 * `downPaymentPercent` is not a `ManualDealFormValues` key — it's the
 * synthetic label for the down-payment *percentage* input, which the caller
 * validates on its own (0–100), independent of purchase price. It exists so
 * an out-of-range percentage can block financing metrics and be named
 * distinctly from the resolved dollar `downPayment` field.
 */
const FIELD_LABELS = {
  purchasePrice: "Purchase price",
  monthlyRent: "Monthly rent",
  squareFootage: "Square footage",
  downPayment: "Down payment",
  interestRatePercent: "Interest rate",
  loanTermYears: "Loan term",
  propertyTaxes: "Property taxes",
  insurance: "Insurance",
  propertyManagement: "Property management",
  maintenanceReserve: "Maintenance reserve",
  hoa: "HOA",
  vacancyReserve: "Monthly vacancy reserve",
  utilities: "Utilities",
  downPaymentPercent: "Down payment percentage",
} as const;

/** The keys FIELD_LABELS actually has an entry for (calc-relevant fields, plus the synthetic percentage field). */
type LabeledField = keyof typeof FIELD_LABELS;

/** The subset that is an actual `ManualDealFormValues` key, safe to null-check directly. */
type ValueLabeledField = Exclude<LabeledField, "downPaymentPercent">;

/**
 * Every field `calculateManualDeal`'s caller may mark invalid: any
 * `ManualDealFormValues` key, plus the synthetic `"downPaymentPercent"` for
 * the down-payment percentage input (which has no corresponding key of its
 * own, since the resolved dollar amount is what `ManualDealFormValues`
 * carries).
 */
export type ManualDealCalcInvalidField = keyof ManualDealFormValues | "downPaymentPercent";

const EXPENSE_FIELDS: ValueLabeledField[] = [
  "propertyTaxes",
  "insurance",
  "propertyManagement",
  "maintenanceReserve",
  "hoa",
  "vacancyReserve",
  "utilities",
];

function missingFieldsOf(values: ManualDealFormValues, fields: ValueLabeledField[]): string[] {
  return fields.filter((field) => values[field] === null).map((field) => FIELD_LABELS[field]);
}

function invalidFieldsOf(invalidFields: ReadonlySet<ManualDealCalcInvalidField>, fields: LabeledField[]): string[] {
  return fields.filter((field) => invalidFields.has(field)).map((field) => FIELD_LABELS[field]);
}

function unique(labels: string[]): string[] {
  return Array.from(new Set(labels));
}

/**
 * Combines a metric's own missing/invalid raw inputs with any missing/
 * invalid inputs inherited from metrics it depends on (e.g. cash flow
 * depends on both NOI and the mortgage payment), so the UI can name every
 * blocking field at once. An invalid field always blocks — `compute` is
 * never invoked while any own or inherited field is invalid, so an invalid
 * value can never reach (and silently corrupt) a calculated result.
 */
function computeMetric(
  ownMissing: string[],
  ownInvalid: string[],
  dependencies: ManualDealMetricResult[],
  compute: () => FinancialCalcResult<number>,
  divisionByZeroReason?: (field: string) => string,
): ManualDealMetricResult {
  const inheritedMissing = dependencies.flatMap((dep) =>
    dep.status === "not_calculated" ? dep.missingFields : [],
  );
  const inheritedInvalid = dependencies.flatMap((dep) =>
    dep.status === "not_calculated" ? dep.invalidFields : [],
  );
  const allMissing = unique([...ownMissing, ...inheritedMissing]);
  const allInvalid = unique([...ownInvalid, ...inheritedInvalid]);
  if (allMissing.length > 0 || allInvalid.length > 0) {
    return { status: "not_calculated", missingFields: allMissing, invalidFields: allInvalid };
  }

  const unavailableDependency = dependencies.find((dep) => dep.status === "unavailable");
  if (unavailableDependency) {
    return unavailableDependency;
  }

  const result = compute();
  if (result.ok) {
    return { status: "calculated", value: result.value };
  }
  if (result.error.code === "DIVISION_BY_ZERO" && divisionByZeroReason) {
    return { status: "unavailable", reason: divisionByZeroReason(result.error.field) };
  }
  return { status: "unavailable", reason: result.error.reason ?? "This value couldn't be calculated." };
}

/**
 * A blank optional expense field is treated as $0, not as missing — the
 * user isn't required to type 0 for an expense that doesn't apply (e.g. no
 * HOA). This substitutes the value passed to the already-tested
 * FinancialEngine formulas; it performs no arithmetic of its own. Note that
 * an *invalid* (present but negative) expense never reaches this function in
 * practice — `computeMetric` blocks before `compute()` is ever called.
 */
function expenseInput(values: ManualDealFormValues) {
  return {
    propertyTaxes: values.propertyTaxes ?? 0,
    insurance: values.insurance ?? 0,
    propertyManagement: values.propertyManagement ?? 0,
    maintenanceReserve: values.maintenanceReserve ?? 0,
    hoa: values.hoa ?? 0,
    vacancyReserve: values.vacancyReserve ?? 0,
    utilities: values.utilities ?? 0,
  };
}

/**
 * Orchestrates the already-tested FinancialEngine formulas over manually
 * entered deal values. This file contains no financial math of its own —
 * every number comes from `@/lib/financial-engine/formulas`. Its only job is
 * to decide, per metric, whether every input that formula needs is present
 * and valid, and to surface an honest reason when it isn't (spec Appendix A.3).
 *
 * `invalidFields` names every raw field the caller has determined is
 * currently invalid (present but failing validation — e.g. a negative
 * expense, or a down payment greater than the purchase price). Any metric
 * that depends on an invalid field is blocked exactly like a missing one,
 * and the invalid field's raw value is never passed to a formula.
 */
export function calculateManualDeal(
  values: ManualDealFormValues,
  invalidFields: ReadonlySet<ManualDealCalcInvalidField> = new Set(),
): ManualDealCalculationResults {
  const pricePerSquareFoot = computeMetric(
    missingFieldsOf(values, ["purchasePrice", "squareFootage"]),
    invalidFieldsOf(invalidFields, ["purchasePrice", "squareFootage"]),
    [],
    () =>
      formulas.pricePerSquareFoot({
        totalAcquisitionCost: values.purchasePrice,
        squareFootage: values.squareFootage,
      }),
    () => "Price per square foot isn't meaningful with 0 square feet.",
  );

  const annualRentalIncome = computeMetric(
    missingFieldsOf(values, ["monthlyRent"]),
    invalidFieldsOf(invalidFields, ["monthlyRent"]),
    [],
    () => formulas.annualRentalIncome({ monthlyRentalIncome: values.monthlyRent }),
  );

  const loanAmount = computeMetric(
    missingFieldsOf(values, ["purchasePrice", "downPayment"]),
    invalidFieldsOf(invalidFields, ["purchasePrice", "downPayment", "downPaymentPercent"]),
    [],
    () => formulas.loanAmount({ totalAcquisitionCost: values.purchasePrice, downPayment: values.downPayment }),
  );

  const monthlyMortgagePayment = computeMetric(
    missingFieldsOf(values, ["interestRatePercent", "loanTermYears"]),
    invalidFieldsOf(invalidFields, ["interestRatePercent", "loanTermYears"]),
    [loanAmount],
    () =>
      formulas.monthlyMortgagePayment({
        loanAmount: loanAmount.status === "calculated" ? loanAmount.value : null,
        interestRate: values.interestRatePercent !== null ? values.interestRatePercent / 100 : null,
        loanTermYears: values.loanTermYears,
      }),
    () => "Monthly mortgage payment couldn't be calculated with these financing terms.",
  );

  const totalMonthlyOperatingExpenses = computeMetric(
    [],
    invalidFieldsOf(invalidFields, EXPENSE_FIELDS),
    [],
    () => formulas.totalMonthlyOperatingExpenses(expenseInput(values)),
  );

  const totalAnnualOperatingExpenses = computeMetric(
    [],
    invalidFieldsOf(invalidFields, EXPENSE_FIELDS),
    [],
    () => formulas.totalAnnualOperatingExpenses(expenseInput(values)),
  );

  const rentMissing = missingFieldsOf(values, ["monthlyRent"]);
  const rentInvalid = invalidFieldsOf(invalidFields, ["monthlyRent"]);
  const expensesInvalid = invalidFieldsOf(invalidFields, EXPENSE_FIELDS);

  const monthlyNOI = computeMetric(rentMissing, unique([...rentInvalid, ...expensesInvalid]), [], () =>
    formulas.monthlyNOI({ monthlyRentalIncome: values.monthlyRent, ...expenseInput(values) }),
  );

  const annualNOI = computeMetric(rentMissing, unique([...rentInvalid, ...expensesInvalid]), [], () =>
    formulas.annualNOI({ monthlyRentalIncome: values.monthlyRent, ...expenseInput(values) }),
  );

  const monthlyCashFlow = computeMetric([], [], [monthlyNOI, monthlyMortgagePayment], () =>
    formulas.monthlyCashFlow({
      monthlyNOI: monthlyNOI.status === "calculated" ? monthlyNOI.value : null,
      monthlyMortgagePayment:
        monthlyMortgagePayment.status === "calculated" ? monthlyMortgagePayment.value : null,
    }),
  );

  const annualCashFlow = computeMetric([], [], [monthlyCashFlow], () =>
    formulas.annualCashFlow({
      monthlyCashFlow: monthlyCashFlow.status === "calculated" ? monthlyCashFlow.value : null,
    }),
  );

  const capRate = computeMetric(
    missingFieldsOf(values, ["purchasePrice"]),
    invalidFieldsOf(invalidFields, ["purchasePrice"]),
    [annualNOI],
    () =>
      formulas.capRate({
        annualNOI: annualNOI.status === "calculated" ? annualNOI.value : null,
        totalAcquisitionCost: values.purchasePrice,
      }),
    () => "Cap rate isn't meaningful with a $0 purchase price.",
  );

  const cashOnCashReturn = computeMetric(
    missingFieldsOf(values, ["downPayment"]),
    invalidFieldsOf(invalidFields, ["downPayment", "downPaymentPercent"]),
    [annualCashFlow],
    () =>
      formulas.cashOnCashReturn({
        annualCashFlow: annualCashFlow.status === "calculated" ? annualCashFlow.value : null,
        downPayment: values.downPayment,
      }),
    () => "Cash-on-cash return isn't meaningful with $0 down payment.",
  );

  return {
    pricePerSquareFoot,
    annualRentalIncome,
    loanAmount,
    monthlyMortgagePayment,
    totalMonthlyOperatingExpenses,
    totalAnnualOperatingExpenses,
    monthlyNOI,
    annualNOI,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCashReturn,
  };
}
