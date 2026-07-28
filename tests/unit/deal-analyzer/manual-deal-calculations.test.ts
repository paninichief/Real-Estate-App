import { describe, it, expect } from "vitest";
import { calculateManualDeal } from "@/lib/deal-analyzer/manual-deal-calculations";
import type { ManualDealFormValues, ManualDealMetricResult } from "@/lib/deal-analyzer/manual-deal-types";

/**
 * Every calculateManualDeal test starts from this fully-populated baseline
 * and nulls out only the fields a given scenario cares about, so each test
 * exercises exactly one presence/absence condition at a time.
 */
const FULL_VALUES: ManualDealFormValues = {
  address: "123 Main St, Detroit, MI",
  purchasePrice: 250_000,
  monthlyRent: 2000,
  bedrooms: 3,
  bathrooms: 1.5,
  squareFootage: 1250,
  downPayment: 50_000,
  interestRatePercent: 6,
  loanTermYears: 30,
  propertyTaxes: 200,
  insurance: 100,
  propertyManagement: 150,
  maintenanceReserve: 75,
  hoa: 0,
  vacancyReserve: 50,
  utilities: 25,
  numberOfUnits: 1,
  renovationCosts: 0,
  occupancy: "Occupied",
  section8Status: null,
  propertyCondition: "Good",
};

const REQUIRED_ONLY_VALUES: ManualDealFormValues = {
  ...FULL_VALUES,
  downPayment: null,
  interestRatePercent: null,
  loanTermYears: null,
  propertyTaxes: null,
  insurance: null,
  propertyManagement: null,
  maintenanceReserve: null,
  hoa: null,
  vacancyReserve: null,
  utilities: null,
};

function calculated(result: ManualDealMetricResult): number {
  if (result.status !== "calculated") {
    throw new Error(`Expected "calculated", got "${result.status}": ${JSON.stringify(result)}`);
  }
  return result.value;
}

function missing(result: ManualDealMetricResult): string[] {
  if (result.status !== "not_calculated") {
    throw new Error(`Expected "not_calculated", got "${result.status}": ${JSON.stringify(result)}`);
  }
  return [...result.missingFields].sort();
}

function invalid(result: ManualDealMetricResult): string[] {
  if (result.status !== "not_calculated") {
    throw new Error(`Expected "not_calculated", got "${result.status}": ${JSON.stringify(result)}`);
  }
  return [...result.invalidFields].sort();
}

function unavailableReason(result: ManualDealMetricResult): string {
  if (result.status !== "unavailable") {
    throw new Error(`Expected "unavailable", got "${result.status}": ${JSON.stringify(result)}`);
  }
  return result.reason;
}

describe("calculateManualDeal — fully populated deal", () => {
  const results = calculateManualDeal(FULL_VALUES);

  it("computes price per square foot from purchase price and square footage", () => {
    expect(calculated(results.pricePerSquareFoot)).toBe(200);
  });

  it("computes annual rental income from monthly rent", () => {
    expect(calculated(results.annualRentalIncome)).toBe(24_000);
  });

  it("computes loan amount from purchase price and down payment", () => {
    expect(calculated(results.loanAmount)).toBe(200_000);
  });

  it("computes the monthly mortgage payment via PMT", () => {
    expect(calculated(results.monthlyMortgagePayment)).toBeCloseTo(1199.1, 1);
  });

  it("sums the seven operating expense line items", () => {
    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(600);
    expect(calculated(results.totalAnnualOperatingExpenses)).toBe(7200);
  });

  it("computes NOI as rent minus operating expenses", () => {
    expect(calculated(results.monthlyNOI)).toBe(1400);
    expect(calculated(results.annualNOI)).toBe(16_800);
  });

  it("computes cash flow as NOI minus the mortgage payment", () => {
    expect(calculated(results.monthlyCashFlow)).toBeCloseTo(200.9, 1);
    expect(calculated(results.annualCashFlow)).toBeCloseTo(2410.8, 0);
  });

  it("computes cap rate as annual NOI over purchase price", () => {
    expect(calculated(results.capRate)).toBeCloseTo(0.0672, 4);
  });

  it("computes cash-on-cash return as annual cash flow over down payment", () => {
    expect(calculated(results.cashOnCashReturn)).toBeCloseTo(0.0482, 3);
  });
});

describe("calculateManualDeal — required fields only", () => {
  const results = calculateManualDeal(REQUIRED_ONLY_VALUES);

  it("still computes the two metrics that only need required fields", () => {
    expect(calculated(results.pricePerSquareFoot)).toBe(200);
    expect(calculated(results.annualRentalIncome)).toBe(24_000);
  });

  it("cannot compute loan amount without a down payment", () => {
    expect(missing(results.loanAmount)).toEqual(["Down payment"]);
  });

  it("cannot compute the mortgage payment without financing terms", () => {
    expect(missing(results.monthlyMortgagePayment)).toEqual(
      ["Down payment", "Interest rate", "Loan term"].sort(),
    );
  });

  it("computes $0 total operating expenses, NOI equal to rent, and cap rate — every blank optional expense defaults to $0 rather than blocking", () => {
    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(0);
    expect(calculated(results.totalAnnualOperatingExpenses)).toBe(0);
    expect(calculated(results.monthlyNOI)).toBe(2000);
    expect(calculated(results.annualNOI)).toBe(24_000);
    expect(calculated(results.capRate)).toBeCloseTo(0.096, 4);
  });

  it("cannot compute cash flow or cash-on-cash without financing terms, even though NOI and cap rate now compute", () => {
    const expectedFinancingOnly = ["Down payment", "Interest rate", "Loan term"].sort();
    expect(missing(results.monthlyCashFlow)).toEqual(expectedFinancingOnly);
    expect(missing(results.annualCashFlow)).toEqual(expectedFinancingOnly);
    expect(missing(results.cashOnCashReturn)).toEqual(expectedFinancingOnly);
  });
});

describe("calculateManualDeal — cap rate is independent of financing", () => {
  it("computes cap rate when expenses are complete even though financing fields are blank", () => {
    const values: ManualDealFormValues = {
      ...FULL_VALUES,
      downPayment: null,
      interestRatePercent: null,
      loanTermYears: null,
    };
    const results = calculateManualDeal(values);

    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(600);
    expect(calculated(results.monthlyNOI)).toBe(1400);
    expect(calculated(results.annualNOI)).toBe(16_800);
    expect(calculated(results.capRate)).toBeCloseTo(0.0672, 4);

    expect(missing(results.loanAmount)).toEqual(["Down payment"]);
    expect(missing(results.monthlyMortgagePayment)).toEqual(
      ["Down payment", "Interest rate", "Loan term"].sort(),
    );
    expect(missing(results.monthlyCashFlow)).toEqual(
      ["Down payment", "Interest rate", "Loan term"].sort(),
    );
    expect(missing(results.cashOnCashReturn)).toEqual(
      ["Down payment", "Interest rate", "Loan term"].sort(),
    );
  });
});

describe("calculateManualDeal — a blank optional expense field is treated as $0, not missing", () => {
  // Uses a non-zero HOA so blanking it out changes the total measurably,
  // unlike FULL_VALUES where hoa is already 0.
  const WITH_NONZERO_HOA: ManualDealFormValues = { ...FULL_VALUES, hoa: 40 };

  it("produces the same total operating expenses whether HOA is left blank or entered as an explicit $0", () => {
    const blank = calculateManualDeal({ ...WITH_NONZERO_HOA, hoa: null });
    const explicitZero = calculateManualDeal({ ...WITH_NONZERO_HOA, hoa: 0 });

    expect(calculated(blank.totalMonthlyOperatingExpenses)).toBe(
      calculated(explicitZero.totalMonthlyOperatingExpenses),
    );
    expect(calculated(blank.totalMonthlyOperatingExpenses)).toBe(600);
  });

  it("treats a blank HOA as $0 rather than blocking NOI, cap rate, or cash flow", () => {
    const results = calculateManualDeal({ ...WITH_NONZERO_HOA, hoa: null });

    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(600);
    expect(calculated(results.monthlyNOI)).toBe(1400);
    expect(calculated(results.capRate)).toBeCloseTo(0.0672, 4);
    expect(calculated(results.monthlyCashFlow)).toBeCloseTo(200.9, 1);
  });

  it("treats a blank vacancy reserve as $0 rather than blocking totals", () => {
    const results = calculateManualDeal({ ...WITH_NONZERO_HOA, vacancyReserve: null });

    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(640 - 50);
    expect(calculated(results.monthlyNOI)).toBe(2000 - (640 - 50));
  });

  it("treats blank utilities as $0 rather than blocking totals", () => {
    const results = calculateManualDeal({ ...WITH_NONZERO_HOA, utilities: null });

    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(640 - 25);
    expect(calculated(results.monthlyNOI)).toBe(2000 - (640 - 25));
  });

  it("treats one entered expense with every other expense blank as contributing only that value, and still computes NOI and cap rate", () => {
    const values: ManualDealFormValues = {
      ...FULL_VALUES,
      propertyTaxes: 200,
      insurance: null,
      propertyManagement: null,
      maintenanceReserve: null,
      hoa: null,
      vacancyReserve: null,
      utilities: null,
    };
    const results = calculateManualDeal(values);

    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(200);
    expect(calculated(results.monthlyNOI)).toBe(1800);
    expect(calculated(results.annualNOI)).toBe(21_600);
    expect(calculated(results.capRate)).toBeCloseTo(21_600 / 250_000, 6);
  });
});

describe("calculateManualDeal — a user-entered $0 does not count as missing", () => {
  it("treats an explicit $0 down payment as present, not missing, and flags cash-on-cash as unavailable instead", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, downPayment: 0 };
    const results = calculateManualDeal(values);

    expect(calculated(results.loanAmount)).toBe(250_000);
    expect(calculated(results.monthlyMortgagePayment)).toBeGreaterThan(0);
    expect(unavailableReason(results.cashOnCashReturn)).toMatch(/\$0 down payment/i);
  });

  it("treats an explicit $0 HOA as present, not missing", () => {
    // FULL_VALUES already sets hoa: 0 — confirm it is not treated as blank.
    const results = calculateManualDeal(FULL_VALUES);
    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(600);
  });
});

describe("calculateManualDeal — invalid values never contribute, only block the metrics that need them", () => {
  it("blocks expense-dependent metrics and names HOA when it is negative, leaving unrelated metrics calculated", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));

    expect(invalid(results.totalMonthlyOperatingExpenses)).toEqual(["HOA"]);
    expect(missing(results.totalMonthlyOperatingExpenses)).toEqual([]);
    expect(invalid(results.totalAnnualOperatingExpenses)).toEqual(["HOA"]);
    expect(invalid(results.monthlyNOI)).toEqual(["HOA"]);
    expect(invalid(results.annualNOI)).toEqual(["HOA"]);
    expect(invalid(results.capRate)).toEqual(["HOA"]);
    expect(invalid(results.monthlyCashFlow)).toEqual(["HOA"]);
    expect(invalid(results.annualCashFlow)).toEqual(["HOA"]);
    expect(invalid(results.cashOnCashReturn)).toEqual(["HOA"]);

    // Unrelated metrics are not hidden just because HOA is invalid elsewhere.
    expect(calculated(results.pricePerSquareFoot)).toBe(200);
    expect(calculated(results.annualRentalIncome)).toBe(24_000);
    expect(calculated(results.loanAmount)).toBe(200_000);
    expect(calculated(results.monthlyMortgagePayment)).toBeCloseTo(1199.1, 1);
  });

  it("never lets a negative expense value reach the calculated total", () => {
    // If -50 were actually summed in, the total would be 600 - 50 = 550 and
    // would report as "calculated" — it must instead be fully blocked.
    const values: ManualDealFormValues = { ...FULL_VALUES, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));
    expect(results.totalMonthlyOperatingExpenses.status).toBe("not_calculated");
  });

  it("blocks loan amount and financing metrics and names Down payment when it exceeds purchase price, leaving cap rate calculated", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, downPayment: 300_000 };
    const results = calculateManualDeal(values, new Set(["downPayment"]));

    expect(invalid(results.loanAmount)).toEqual(["Down payment"]);
    expect(invalid(results.monthlyMortgagePayment)).toEqual(["Down payment"]);
    expect(invalid(results.monthlyCashFlow)).toEqual(["Down payment"]);
    expect(invalid(results.annualCashFlow)).toEqual(["Down payment"]);
    expect(invalid(results.cashOnCashReturn)).toEqual(["Down payment"]);

    // Cap rate needs purchase price and NOI, not down payment — unaffected.
    expect(calculated(results.capRate)).toBeCloseTo(0.0672, 4);
    expect(calculated(results.totalMonthlyOperatingExpenses)).toBe(600);
    expect(calculated(results.monthlyNOI)).toBe(1400);
  });

  it("reports both a missing and an invalid field together when both apply to the same metric", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, monthlyRent: null, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));

    expect(missing(results.monthlyNOI)).toEqual(["Monthly rent"]);
    expect(invalid(results.monthlyNOI)).toEqual(["HOA"]);
  });

  it("restores calculation once the invalid field is corrected", () => {
    const invalidValues: ManualDealFormValues = { ...FULL_VALUES, hoa: -50 };
    const blocked = calculateManualDeal(invalidValues, new Set(["hoa"]));
    expect(blocked.totalMonthlyOperatingExpenses.status).toBe("not_calculated");
    expect(blocked.capRate.status).toBe("not_calculated");

    const fixed = calculateManualDeal(FULL_VALUES, new Set());
    expect(calculated(fixed.totalMonthlyOperatingExpenses)).toBe(600);
    expect(calculated(fixed.capRate)).toBeCloseTo(0.0672, 4);
  });

  it("blocks the mortgage payment and names Interest rate when it is negative", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, interestRatePercent: -1 };
    const results = calculateManualDeal(values, new Set(["interestRatePercent"]));

    expect(invalid(results.monthlyMortgagePayment)).toEqual(["Interest rate"]);
    expect(invalid(results.monthlyCashFlow)).toEqual(["Interest rate"]);
    expect(calculated(results.loanAmount)).toBe(200_000);
  });

  it("blocks the mortgage payment and names Loan term when it is not positive", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, loanTermYears: 0 };
    const results = calculateManualDeal(values, new Set(["loanTermYears"]));

    expect(invalid(results.monthlyMortgagePayment)).toEqual(["Loan term"]);
    expect(invalid(results.cashOnCashReturn)).toEqual(["Loan term"]);
  });

  it("does not treat an untouched, valid field as invalid just because other fields are invalid", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));
    expect(results.loanAmount.status).toBe("calculated");
  });

  it("blocks loan amount and cash-on-cash return and names Down payment percentage as invalid, independent of purchase price validity", () => {
    const results = calculateManualDeal(FULL_VALUES, new Set(["downPaymentPercent"]));

    expect(invalid(results.loanAmount)).toEqual(["Down payment percentage"]);
    expect(invalid(results.monthlyMortgagePayment)).toEqual(["Down payment percentage"]);
    expect(invalid(results.monthlyCashFlow)).toEqual(["Down payment percentage"]);
    expect(invalid(results.cashOnCashReturn)).toEqual(["Down payment percentage"]);

    // Cap rate needs neither down payment nor its percentage — unaffected.
    expect(calculated(results.capRate)).toBeCloseTo(0.0672, 4);
  });
});

describe("calculateManualDeal — defensive division-by-zero handling", () => {
  it("flags price per square foot as unavailable, not crashing, on 0 square feet", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, squareFootage: 0 };
    const results = calculateManualDeal(values);
    expect(unavailableReason(results.pricePerSquareFoot)).toMatch(/square f(oo|ee)t/i);
  });

  it("flags cap rate as unavailable, not crashing, on a $0 purchase price", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 0 };
    const results = calculateManualDeal(values);
    expect(unavailableReason(results.capRate)).toMatch(/purchase price/i);
  });
});
