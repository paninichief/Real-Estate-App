import { describe, it, expect } from "vitest";
import {
  loanAmount,
  monthlyMortgagePayment,
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
});
