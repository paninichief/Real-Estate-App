import { describe, it, expect } from "vitest";
import {
  loanAmount,
  monthlyMortgagePayment,
  annualRentalIncome,
  totalMonthlyOperatingExpenses,
  totalAnnualOperatingExpenses,
  monthlyNOI,
  annualNOI,
  monthlyCashFlow,
  annualCashFlow,
  capRate,
  cashOnCashReturn,
  pricePerSquareFoot,
} from "@/lib/financial-engine";

const BASE_OPERATING_EXPENSES = {
  propertyTaxes: 200,
  insurance: 100,
  propertyManagement: 150,
  maintenanceReserve: 75,
  hoa: 0,
  vacancyReserve: 50,
  utilities: 25,
};

describe("loanAmount", () => {
  it("subtracts down payment from total acquisition cost", () => {
    const result = loanAmount({ totalAcquisitionCost: 250_000, downPayment: 50_000 });
    expect(result).toEqual({ ok: true, value: 200_000 });
  });

  it("allows a zero down payment", () => {
    const result = loanAmount({ totalAcquisitionCost: 250_000, downPayment: 0 });
    expect(result).toEqual({ ok: true, value: 250_000 });
  });

  it("computes a negative loan amount literally when down payment exceeds cost", () => {
    const result = loanAmount({ totalAcquisitionCost: 100_000, downPayment: 120_000 });
    expect(result).toEqual({ ok: true, value: -20_000 });
  });

  it("rejects a negative down payment as invalid", () => {
    const result = loanAmount({ totalAcquisitionCost: 100_000, downPayment: -1 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "downPayment", reason: "must not be negative" },
    });
  });

  it("reports a missing total acquisition cost", () => {
    const result = loanAmount({ totalAcquisitionCost: undefined, downPayment: 50_000 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "totalAcquisitionCost" } });
  });

  it("reports a missing down payment", () => {
    const result = loanAmount({ totalAcquisitionCost: 250_000, downPayment: null });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "downPayment" } });
  });

  it("reports a non-finite total acquisition cost as invalid", () => {
    const result = loanAmount({ totalAcquisitionCost: NaN, downPayment: 50_000 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "totalAcquisitionCost", reason: "must be a finite number" },
    });
  });

  it("rounds sub-cent inputs to the nearest cent", () => {
    const result = loanAmount({ totalAcquisitionCost: 100_000.005, downPayment: 0 });
    expect(result).toEqual({ ok: true, value: 100_000.01 });
  });
});

describe("monthlyMortgagePayment", () => {
  it("matches the well-known $200,000 / 6% / 30yr payment", () => {
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: 0.06, loanTermYears: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(1199.1, 1);
    }
  });

  it("degenerates to simple division when interest rate is zero", () => {
    const result = monthlyMortgagePayment({ loanAmount: 12_000, interestRate: 0, loanTermYears: 1 });
    expect(result).toEqual({ ok: true, value: 1_000 });
  });

  it("returns a zero payment for a zero loan amount", () => {
    const result = monthlyMortgagePayment({ loanAmount: 0, interestRate: 0.06, loanTermYears: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(0);
    }
  });

  it("computes literally for a negative loan amount", () => {
    const result = monthlyMortgagePayment({ loanAmount: -12_000, interestRate: 0, loanTermYears: 1 });
    expect(result).toEqual({ ok: true, value: -1_000 });
  });

  it("rejects a zero loan term as invalid rather than dividing by zero", () => {
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: 0.06, loanTermYears: 0 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "loanTermYears", reason: "must be greater than zero" },
    });
  });

  it("rejects a negative loan term as invalid", () => {
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: 0.06, loanTermYears: -5 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "loanTermYears", reason: "must be greater than zero" },
    });
  });

  it("reports a missing interest rate", () => {
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: undefined, loanTermYears: 30 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "interestRate" } });
  });

  it("reports a missing loan amount", () => {
    const result = monthlyMortgagePayment({ loanAmount: null, interestRate: 0.06, loanTermYears: 30 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "loanAmount" } });
  });

  it("reports a non-finite interest rate as invalid", () => {
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: Infinity, loanTermYears: 30 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "interestRate", reason: "must be a finite number" },
    });
  });

  it("guards against a pathological interest rate producing a non-finite payment", () => {
    // interestRate: -12 makes the monthly rate exactly -1, so (1 + monthlyRate) is 0
    // and the PMT denominator collapses to 0 — must not surface as Infinity/NaN.
    const result = monthlyMortgagePayment({ loanAmount: 200_000, interestRate: -12, loanTermYears: 30 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("DIVISION_BY_ZERO");
    }
  });

  it("preserves sub-cent precision instead of rounding to the nearest cent (regression)", () => {
    // Reference value computed independently via the standard PMT formula, not derived
    // from this implementation, so the test can't trivially agree with a rounding bug.
    const result = monthlyMortgagePayment({ loanAmount: 100_000, interestRate: 0.0575, loanTermYears: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(830.4100870196571, 6);
      const roundedToCents = Math.round(result.value * 100) / 100;
      expect(result.value).not.toBe(roundedToCents);
    }
  });

  it("matches a reference PMT at 1% / 30yr on a $300,000 loan", () => {
    const result = monthlyMortgagePayment({ loanAmount: 300_000, interestRate: 0.01, loanTermYears: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(964.9185613395013, 6);
    }
  });

  it("matches a reference PMT at 2% / 30yr on a $300,000 loan", () => {
    const result = monthlyMortgagePayment({ loanAmount: 300_000, interestRate: 0.02, loanTermYears: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(1108.8584180664432, 6);
    }
  });

  it("matches a reference PMT at 6% / 30yr on a $300,000 loan", () => {
    const result = monthlyMortgagePayment({ loanAmount: 300_000, interestRate: 0.06, loanTermYears: 30 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(1798.6515754582708, 6);
    }
  });
});

describe("annualRentalIncome", () => {
  it("multiplies monthly rental income by twelve", () => {
    const result = annualRentalIncome({ monthlyRentalIncome: 2_000 });
    expect(result).toEqual({ ok: true, value: 24_000 });
  });

  it("allows a zero monthly rental income", () => {
    const result = annualRentalIncome({ monthlyRentalIncome: 0 });
    expect(result).toEqual({ ok: true, value: 0 });
  });

  it("reports a missing monthly rental income", () => {
    const result = annualRentalIncome({ monthlyRentalIncome: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "monthlyRentalIncome" } });
  });

  it("reports a non-finite monthly rental income as invalid", () => {
    const result = annualRentalIncome({ monthlyRentalIncome: NaN });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "monthlyRentalIncome", reason: "must be a finite number" },
    });
  });

  it("is exact for a value that would drift under plain binary-float multiplication", () => {
    // 33.33 * 12 in raw JS float is 399.96000000000004, not 399.96.
    const result = annualRentalIncome({ monthlyRentalIncome: 33.33 });
    expect(result).toEqual({ ok: true, value: 399.96 });
  });
});

describe("totalMonthlyOperatingExpenses", () => {
  it("sums the seven monthly operating expense line items", () => {
    const result = totalMonthlyOperatingExpenses(BASE_OPERATING_EXPENSES);
    // 200+100+150+75+0+50+25 = 600
    expect(result).toEqual({ ok: true, value: 600 });
  });

  it("allows a zero HOA line item", () => {
    const result = totalMonthlyOperatingExpenses({ ...BASE_OPERATING_EXPENSES, hoa: 0 });
    expect(result.ok).toBe(true);
  });

  it("allows a zero vacancy reserve line item", () => {
    const result = totalMonthlyOperatingExpenses({ ...BASE_OPERATING_EXPENSES, vacancyReserve: 0 });
    expect(result.ok).toBe(true);
  });

  it("reports a missing HOA field", () => {
    const result = totalMonthlyOperatingExpenses({ ...BASE_OPERATING_EXPENSES, hoa: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "hoa" } });
  });

  it("reports a non-finite utilities value as invalid", () => {
    const result = totalMonthlyOperatingExpenses({ ...BASE_OPERATING_EXPENSES, utilities: NaN });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "utilities", reason: "must be a finite number" },
    });
  });
});

describe("totalAnnualOperatingExpenses", () => {
  it("is twelve times the total monthly operating expenses", () => {
    const result = totalAnnualOperatingExpenses(BASE_OPERATING_EXPENSES);
    expect(result).toEqual({ ok: true, value: 7_200 });
  });

  it("propagates a missing field error from the underlying monthly sum", () => {
    const result = totalAnnualOperatingExpenses({ ...BASE_OPERATING_EXPENSES, propertyTaxes: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "propertyTaxes" } });
  });

  it("reports a non-finite maintenance reserve value as invalid", () => {
    const result = totalAnnualOperatingExpenses({ ...BASE_OPERATING_EXPENSES, maintenanceReserve: Infinity });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "maintenanceReserve", reason: "must be a finite number" },
    });
  });
});

describe("monthlyNOI", () => {
  it("subtracts total monthly operating expenses from monthly rental income", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES });
    // 200+100+150+75+0+50+25 = 600
    expect(result).toEqual({ ok: true, value: 1_400 });
  });

  it("allows a zero HOA line item", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 1_000, ...BASE_OPERATING_EXPENSES, hoa: 0 });
    expect(result.ok).toBe(true);
  });

  it("allows a zero vacancy reserve line item", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 1_000, ...BASE_OPERATING_EXPENSES, vacancyReserve: 0 });
    expect(result.ok).toBe(true);
  });

  it("computes literally when expenses exceed rental income", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 100, ...BASE_OPERATING_EXPENSES });
    expect(result).toEqual({ ok: true, value: -500 });
  });

  it("reports a missing HOA field", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES, hoa: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "hoa" } });
  });

  it("reports a missing monthly rental income", () => {
    const result = monthlyNOI({ monthlyRentalIncome: null, ...BASE_OPERATING_EXPENSES });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "monthlyRentalIncome" } });
  });

  it("reports a non-finite utilities value as invalid", () => {
    const result = monthlyNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES, utilities: NaN });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "utilities", reason: "must be a finite number" },
    });
  });
});

describe("annualNOI", () => {
  it("is twelve times the equivalent monthly NOI", () => {
    const monthly = monthlyNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES });
    const annual = annualNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES });
    expect(monthly.ok).toBe(true);
    expect(annual).toEqual({ ok: true, value: monthly.ok ? monthly.value * 12 : NaN });
  });

  it("propagates a missing field error from the underlying monthly calculation", () => {
    const result = annualNOI({ monthlyRentalIncome: 2_000, ...BASE_OPERATING_EXPENSES, propertyTaxes: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "propertyTaxes" } });
  });
});

describe("monthlyCashFlow", () => {
  it("subtracts the mortgage payment from NOI", () => {
    const result = monthlyCashFlow({ monthlyNOI: 1_400, monthlyMortgagePayment: 1_000 });
    expect(result).toEqual({ ok: true, value: 400 });
  });

  it("computes a negative cash flow literally", () => {
    const result = monthlyCashFlow({ monthlyNOI: 500, monthlyMortgagePayment: 1_000 });
    expect(result).toEqual({ ok: true, value: -500 });
  });

  it("reports a missing monthly NOI", () => {
    const result = monthlyCashFlow({ monthlyNOI: undefined, monthlyMortgagePayment: 1_000 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "monthlyNOI" } });
  });

  it("reports a non-finite mortgage payment as invalid", () => {
    const result = monthlyCashFlow({ monthlyNOI: 1_400, monthlyMortgagePayment: NaN });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "monthlyMortgagePayment", reason: "must be a finite number" },
    });
  });
});

describe("annualCashFlow", () => {
  it("multiplies monthly cash flow by twelve", () => {
    const result = annualCashFlow({ monthlyCashFlow: 400 });
    expect(result).toEqual({ ok: true, value: 4_800 });
  });

  it("computes literally for negative monthly cash flow", () => {
    const result = annualCashFlow({ monthlyCashFlow: -500 });
    expect(result).toEqual({ ok: true, value: -6_000 });
  });

  it("reports a missing monthly cash flow", () => {
    const result = annualCashFlow({ monthlyCashFlow: null });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "monthlyCashFlow" } });
  });
});

describe("capRate", () => {
  it("divides annual NOI by total acquisition cost", () => {
    const result = capRate({ annualNOI: 16_800, totalAcquisitionCost: 250_000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(0.0672, 6);
    }
  });

  it("returns a defined division-by-zero error instead of Infinity", () => {
    const result = capRate({ annualNOI: 16_800, totalAcquisitionCost: 0 });
    expect(result).toEqual({ ok: false, error: { code: "DIVISION_BY_ZERO", field: "totalAcquisitionCost" } });
  });

  it("computes literally for a negative annual NOI", () => {
    const result = capRate({ annualNOI: -6_000, totalAcquisitionCost: 250_000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(-0.024, 6);
    }
  });

  it("reports a missing annual NOI", () => {
    const result = capRate({ annualNOI: undefined, totalAcquisitionCost: 250_000 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "annualNOI" } });
  });

  it("reports a non-finite total acquisition cost as invalid", () => {
    const result = capRate({ annualNOI: 16_800, totalAcquisitionCost: Infinity });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "totalAcquisitionCost", reason: "must be a finite number" },
    });
  });
});

describe("cashOnCashReturn", () => {
  it("divides annual cash flow by down payment", () => {
    const result = cashOnCashReturn({ annualCashFlow: 4_800, downPayment: 50_000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(0.096, 6);
    }
  });

  it("returns a defined division-by-zero error for a zero down payment instead of Infinity", () => {
    const result = cashOnCashReturn({ annualCashFlow: 4_800, downPayment: 0 });
    expect(result).toEqual({ ok: false, error: { code: "DIVISION_BY_ZERO", field: "downPayment" } });
  });

  it("rejects a negative down payment as invalid", () => {
    const result = cashOnCashReturn({ annualCashFlow: 4_800, downPayment: -1 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "downPayment", reason: "must not be negative" },
    });
  });

  it("computes literally for a negative annual cash flow", () => {
    const result = cashOnCashReturn({ annualCashFlow: -6_000, downPayment: 50_000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(-0.12, 6);
    }
  });

  it("reports a missing annual cash flow", () => {
    const result = cashOnCashReturn({ annualCashFlow: undefined, downPayment: 50_000 });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "annualCashFlow" } });
  });
});

describe("pricePerSquareFoot", () => {
  it("divides total acquisition cost by square footage", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: 250_000, squareFootage: 2_000 });
    expect(result).toEqual({ ok: true, value: 125 });
  });

  it("returns a defined division-by-zero error for zero square footage instead of Infinity", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: 250_000, squareFootage: 0 });
    expect(result).toEqual({ ok: false, error: { code: "DIVISION_BY_ZERO", field: "squareFootage" } });
  });

  it("rejects negative square footage as invalid", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: 250_000, squareFootage: -1 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "squareFootage", reason: "must not be negative" },
    });
  });

  it("reports a missing square footage", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: 250_000, squareFootage: undefined });
    expect(result).toEqual({ ok: false, error: { code: "MISSING_INPUT", field: "squareFootage" } });
  });

  it("reports a non-finite total acquisition cost as invalid", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: NaN, squareFootage: 2_000 });
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_INPUT", field: "totalAcquisitionCost", reason: "must be a finite number" },
    });
  });

  it("preserves full precision instead of rounding to the nearest cent (regression)", () => {
    const result = pricePerSquareFoot({ totalAcquisitionCost: 100_000, squareFootage: 3 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(33333.333333333336, 6);
      const roundedToCents = Math.round(result.value * 100) / 100;
      expect(result.value).not.toBe(roundedToCents);
    }
  });
});

describe("premature rounding regression: full deal chain", () => {
  it("does not round the mortgage payment before it is consumed by cash flow and cash-on-cash return", () => {
    // Independently computed (not derived from the engine) so this can't silently
    // agree with a rounding bug reintroduced anywhere along the chain.
    const loan = 100_000;
    const rate = 0.0575;
    const termYears = 15;
    const n = termYears * 12;
    const r = rate / 12;
    const expectedPayment = (r * loan) / (1 - Math.pow(1 + r, -n));

    const paymentResult = monthlyMortgagePayment({ loanAmount: loan, interestRate: rate, loanTermYears: termYears });
    expect(paymentResult.ok).toBe(true);
    if (!paymentResult.ok) return;
    expect(paymentResult.value).toBe(expectedPayment);

    const noi = 1_000;
    const cashFlowResult = monthlyCashFlow({ monthlyNOI: noi, monthlyMortgagePayment: paymentResult.value });
    expect(cashFlowResult.ok).toBe(true);
    if (!cashFlowResult.ok) return;
    expect(cashFlowResult.value).toBe(noi - expectedPayment);

    const annualCashFlowResult = annualCashFlow({ monthlyCashFlow: cashFlowResult.value });
    expect(annualCashFlowResult.ok).toBe(true);
    if (!annualCashFlowResult.ok) return;
    expect(annualCashFlowResult.value).toBe((noi - expectedPayment) * 12);

    const downPayment = 20_000;
    const cocResult = cashOnCashReturn({ annualCashFlow: annualCashFlowResult.value, downPayment });
    expect(cocResult.ok).toBe(true);
    if (!cocResult.ok) return;
    expect(cocResult.value).toBeCloseTo(((noi - expectedPayment) * 12) / downPayment, 10);
  });
});

describe("realistic high-value scenario: $50 million property", () => {
  it("produces coherent results across the whole engine with no Infinity/NaN", () => {
    const totalAcquisitionCost = 50_000_000;
    const downPayment = 10_000_000;
    const squareFootage = 100_000;
    const expenses = {
      propertyTaxes: 20_000,
      insurance: 8_000,
      propertyManagement: 15_000,
      maintenanceReserve: 6_000,
      hoa: 0,
      vacancyReserve: 9_000,
      utilities: 4_000,
    };
    const monthlyRentalIncome = 300_000;

    const loanResult = loanAmount({ totalAcquisitionCost, downPayment });
    expect(loanResult).toEqual({ ok: true, value: 40_000_000 });
    if (!loanResult.ok) return;

    const paymentResult = monthlyMortgagePayment({
      loanAmount: loanResult.value,
      interestRate: 0.055,
      loanTermYears: 30,
    });
    expect(paymentResult.ok).toBe(true);
    if (!paymentResult.ok) return;
    expect(paymentResult.value).toBeCloseTo(227_115.60053880024, 4);

    const monthlyNOIResult = monthlyNOI({ monthlyRentalIncome, ...expenses });
    expect(monthlyNOIResult).toEqual({ ok: true, value: 238_000 });
    if (!monthlyNOIResult.ok) return;

    const annualNOIResult = annualNOI({ monthlyRentalIncome, ...expenses });
    expect(annualNOIResult).toEqual({ ok: true, value: 2_856_000 });
    if (!annualNOIResult.ok) return;

    const monthlyCashFlowResult = monthlyCashFlow({
      monthlyNOI: monthlyNOIResult.value,
      monthlyMortgagePayment: paymentResult.value,
    });
    expect(monthlyCashFlowResult.ok).toBe(true);
    if (!monthlyCashFlowResult.ok) return;
    expect(monthlyCashFlowResult.value).toBeCloseTo(10_884.399461199762, 4);

    const annualCashFlowResult = annualCashFlow({ monthlyCashFlow: monthlyCashFlowResult.value });
    expect(annualCashFlowResult.ok).toBe(true);
    if (!annualCashFlowResult.ok) return;
    expect(annualCashFlowResult.value).toBeCloseTo(130_612.79353439715, 4);

    const capRateResult = capRate({ annualNOI: annualNOIResult.value, totalAcquisitionCost });
    expect(capRateResult).toEqual({ ok: true, value: 0.05712 });

    const cocResult = cashOnCashReturn({ annualCashFlow: annualCashFlowResult.value, downPayment });
    expect(cocResult.ok).toBe(true);
    if (!cocResult.ok) return;
    expect(cocResult.value).toBeCloseTo(0.013061279353439715, 10);

    const pricePerSqftResult = pricePerSquareFoot({ totalAcquisitionCost, squareFootage });
    expect(pricePerSqftResult).toEqual({ ok: true, value: 500 });

    for (const result of [
      loanResult,
      paymentResult,
      monthlyNOIResult,
      annualNOIResult,
      monthlyCashFlowResult,
      annualCashFlowResult,
      capRateResult,
      cocResult,
      pricePerSqftResult,
    ]) {
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Number.isFinite(result.value)).toBe(true);
      }
    }
  });
});
