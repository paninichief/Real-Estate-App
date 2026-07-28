import type { FinancialCalcResult } from "@/lib/financial-engine/types";
import * as formulas from "@/lib/financial-engine/formulas";
import type { ManualDealCalculationResults, ManualDealFormValues, ManualDealMetricResult } from "./manual-deal-types";

/**
 * Human-readable labels for the raw input fields that can still genuinely
 * block a metric, used to name exactly which field(s) are missing (spec
 * section 1.2: missing information must be visible, never silently
 * defaulted or omitted). The seven optional expense fields are deliberately
 * absent here — a blank expense is treated as $0 (see `expenseInput` below),
 * not as "missing," so it can never appear in this list. Financing fields
 * (down payment, interest rate, loan term) are *not* defaulted: a blank one
 * is a genuinely different deal structure, not an assumable $0.
 */
const FIELD_LABELS = {
  purchasePrice: "Purchase price",
  monthlyRent: "Monthly rent",
  squareFootage: "Square footage",
  downPayment: "Down payment",
  interestRatePercent: "Interest rate",
  loanTermYears: "Loan term",
} as const;

type LabeledField = keyof typeof FIELD_LABELS;

function missingFieldsOf(values: ManualDealFormValues, fields: LabeledField[]): string[] {
  return fields.filter((field) => values[field] === null).map((field) => FIELD_LABELS[field]);
}

function unique(labels: string[]): string[] {
  return Array.from(new Set(labels));
}

/**
 * Combines a metric's own missing raw inputs with any missing inputs
 * inherited from metrics it depends on (e.g. cash flow depends on both NOI
 * and the mortgage payment), so the UI can name every blocking field at
 * once rather than only the first one the engine happens to report.
 */
function computeMetric(
  ownMissing: string[],
  dependencies: ManualDealMetricResult[],
  compute: () => FinancialCalcResult<number>,
  divisionByZeroReason?: (field: string) => string,
): ManualDealMetricResult {
  const inheritedMissing = dependencies.flatMap((dep) =>
    dep.status === "not_calculated" ? dep.missingFields : [],
  );
  const allMissing = unique([...ownMissing, ...inheritedMissing]);
  if (allMissing.length > 0) {
    return { status: "not_calculated", missingFields: allMissing };
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
 * FinancialEngine formulas; it performs no arithmetic of its own.
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
 * to decide, per metric, whether every input that formula needs is present,
 * and to surface an honest reason when it isn't (spec Appendix A.3).
 */
export function calculateManualDeal(values: ManualDealFormValues): ManualDealCalculationResults {
  const pricePerSquareFoot = computeMetric(
    missingFieldsOf(values, ["purchasePrice", "squareFootage"]),
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
    [],
    () => formulas.annualRentalIncome({ monthlyRentalIncome: values.monthlyRent }),
  );

  const loanAmount = computeMetric(
    missingFieldsOf(values, ["purchasePrice", "downPayment"]),
    [],
    () => formulas.loanAmount({ totalAcquisitionCost: values.purchasePrice, downPayment: values.downPayment }),
  );

  const monthlyMortgagePayment = computeMetric(
    missingFieldsOf(values, ["interestRatePercent", "loanTermYears"]),
    [loanAmount],
    () =>
      formulas.monthlyMortgagePayment({
        loanAmount: loanAmount.status === "calculated" ? loanAmount.value : null,
        interestRate: values.interestRatePercent !== null ? values.interestRatePercent / 100 : null,
        loanTermYears: values.loanTermYears,
      }),
    () => "Monthly mortgage payment couldn't be calculated with these financing terms.",
  );

  const totalMonthlyOperatingExpenses = computeMetric([], [], () =>
    formulas.totalMonthlyOperatingExpenses(expenseInput(values)),
  );

  const totalAnnualOperatingExpenses = computeMetric([], [], () =>
    formulas.totalAnnualOperatingExpenses(expenseInput(values)),
  );

  const rentMissing = missingFieldsOf(values, ["monthlyRent"]);

  const monthlyNOI = computeMetric(rentMissing, [], () =>
    formulas.monthlyNOI({ monthlyRentalIncome: values.monthlyRent, ...expenseInput(values) }),
  );

  const annualNOI = computeMetric(rentMissing, [], () =>
    formulas.annualNOI({ monthlyRentalIncome: values.monthlyRent, ...expenseInput(values) }),
  );

  const monthlyCashFlow = computeMetric([], [monthlyNOI, monthlyMortgagePayment], () =>
    formulas.monthlyCashFlow({
      monthlyNOI: monthlyNOI.status === "calculated" ? monthlyNOI.value : null,
      monthlyMortgagePayment:
        monthlyMortgagePayment.status === "calculated" ? monthlyMortgagePayment.value : null,
    }),
  );

  const annualCashFlow = computeMetric([], [monthlyCashFlow], () =>
    formulas.annualCashFlow({
      monthlyCashFlow: monthlyCashFlow.status === "calculated" ? monthlyCashFlow.value : null,
    }),
  );

  const capRate = computeMetric(
    missingFieldsOf(values, ["purchasePrice"]),
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
