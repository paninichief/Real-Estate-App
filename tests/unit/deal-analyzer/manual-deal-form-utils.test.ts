import { describe, it, expect } from "vitest";
import {
  EMPTY_MANUAL_DEAL_RAW_VALUES,
  parseManualDealValues,
  validateManualDealRawValues,
  type ManualDealRawValues,
} from "@/lib/deal-analyzer/manual-deal-form-utils";

function raw(overrides: Partial<ManualDealRawValues>): ManualDealRawValues {
  return { ...EMPTY_MANUAL_DEAL_RAW_VALUES, ...overrides };
}

const VALID_RAW: ManualDealRawValues = raw({
  address: "123 Main St, Detroit, MI",
  purchasePrice: "250000",
  monthlyRent: "2000",
  bedrooms: "3",
  bathrooms: "1.5",
  squareFootage: "1250",
  downPayment: "50000",
  interestRatePercent: "6",
  loanTermYears: "30",
  propertyTaxes: "200",
  insurance: "100",
  propertyManagement: "150",
  maintenanceReserve: "75",
  hoa: "0",
  vacancyReserve: "50",
  utilities: "25",
  numberOfUnits: "1",
  renovationCosts: "0",
  occupancy: "Occupied",
  section8Status: "",
});

describe("parseManualDealValues", () => {
  it("parses every field of a fully populated raw form", () => {
    const values = parseManualDealValues(VALID_RAW);
    expect(values).toEqual({
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
      propertyCondition: null,
    });
  });

  it("parses every blank field as null rather than 0 or empty string", () => {
    const values = parseManualDealValues(EMPTY_MANUAL_DEAL_RAW_VALUES);
    for (const [key, value] of Object.entries(values)) {
      expect(value, `expected ${key} to be null`).toBeNull();
    }
  });

  it("parses an explicit 0 as 0, not as missing", () => {
    const values = parseManualDealValues(raw({ hoa: "0", downPayment: "0" }));
    expect(values.hoa).toBe(0);
    expect(values.downPayment).toBe(0);
  });

  it("trims whitespace around numeric and text input", () => {
    const values = parseManualDealValues(
      raw({ purchasePrice: "  250000  ", address: "  123 Main St  " }),
    );
    expect(values.purchasePrice).toBe(250_000);
    expect(values.address).toBe("123 Main St");
  });

  it("parses a non-numeric string in a numeric field as null rather than NaN", () => {
    const values = parseManualDealValues(raw({ purchasePrice: "abc" }));
    expect(values.purchasePrice).toBeNull();
  });
});

describe("validateManualDealRawValues — required fields", () => {
  it("reports every required field missing on a blank form", () => {
    const errors = validateManualDealRawValues(EMPTY_MANUAL_DEAL_RAW_VALUES);
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "purchasePrice", "monthlyRent", "bedrooms", "bathrooms", "squareFootage"].sort(),
    );
  });

  it("has no errors for a fully valid form", () => {
    const errors = validateManualDealRawValues(VALID_RAW);
    expect(errors).toEqual({});
  });

  it("rejects a zero purchase price", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, purchasePrice: "0" }));
    expect(errors.purchasePrice).toMatch(/positive/i);
  });

  it("rejects a negative purchase price", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, purchasePrice: "-1" }));
    expect(errors.purchasePrice).toMatch(/positive/i);
  });

  it("rejects a zero square footage", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, squareFootage: "0" }));
    expect(errors.squareFootage).toMatch(/positive/i);
  });

  it("rejects a negative monthly rent", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, monthlyRent: "-1" }));
    expect(errors.monthlyRent).toBeTruthy();
  });

  it("allows a $0 monthly rent", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, monthlyRent: "0" }));
    expect(errors.monthlyRent).toBeUndefined();
  });

  it("rejects negative bedrooms/bathrooms", () => {
    const errors = validateManualDealRawValues(
      raw({ ...VALID_RAW, bedrooms: "-1", bathrooms: "-1" }),
    );
    expect(errors.bedrooms).toBeTruthy();
    expect(errors.bathrooms).toBeTruthy();
  });

  it("accepts 0 bedrooms", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, bedrooms: "0" }));
    expect(errors.bedrooms).toBeUndefined();
  });

  it("accepts 1 bedroom", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, bedrooms: "1" }));
    expect(errors.bedrooms).toBeUndefined();
  });

  it("rejects a fractional bedroom count", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, bedrooms: "1.5" }));
    expect(errors.bedrooms).toMatch(/whole number/i);
  });

  it("does not require bathrooms to be a whole number (half-baths are valid)", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, bathrooms: "1.5" }));
    expect(errors.bathrooms).toBeUndefined();
  });

  it("rejects a down payment that exceeds the purchase price", () => {
    const errors = validateManualDealRawValues(
      raw({ ...VALID_RAW, purchasePrice: "100000", downPayment: "150000" }),
    );
    expect(errors.downPayment).toMatch(/exceed/i);
  });

  it("allows a down payment exactly equal to the purchase price (100% down)", () => {
    const errors = validateManualDealRawValues(
      raw({ ...VALID_RAW, purchasePrice: "100000", downPayment: "100000" }),
    );
    expect(errors.downPayment).toBeUndefined();
  });
});

describe("validateManualDealRawValues — optional fields", () => {
  it("has no errors when every optional field is left blank", () => {
    const errors = validateManualDealRawValues(
      raw({
        address: VALID_RAW.address,
        purchasePrice: VALID_RAW.purchasePrice,
        monthlyRent: VALID_RAW.monthlyRent,
        bedrooms: VALID_RAW.bedrooms,
        bathrooms: VALID_RAW.bathrooms,
        squareFootage: VALID_RAW.squareFootage,
      }),
    );
    expect(errors).toEqual({});
  });

  it("rejects a negative loan term", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, loanTermYears: "-5" }));
    expect(errors.loanTermYears).toBeTruthy();
  });

  it("rejects a zero loan term", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, loanTermYears: "0" }));
    expect(errors.loanTermYears).toBeTruthy();
  });

  it("rejects a negative value in any operating-expense field", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, hoa: "-10" }));
    expect(errors.hoa).toMatch(/hoa/i);
  });

  it("allows an explicit $0 operating-expense field", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, hoa: "0" }));
    expect(errors.hoa).toBeUndefined();
  });

  it("rejects a fractional number of units", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, numberOfUnits: "1.5" }));
    expect(errors.numberOfUnits).toBeTruthy();
  });

  it("rejects zero units", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, numberOfUnits: "0" }));
    expect(errors.numberOfUnits).toBeTruthy();
  });

  it("rejects negative renovation costs", () => {
    const errors = validateManualDealRawValues(raw({ ...VALID_RAW, renovationCosts: "-1" }));
    expect(errors.renovationCosts).toBeTruthy();
  });

  it("never validates occupancy or Section 8 status as numeric", () => {
    const errors = validateManualDealRawValues(
      raw({ ...VALID_RAW, occupancy: "Vacant", section8Status: "HAP Contract Confirmed" }),
    );
    expect(errors.occupancy).toBeUndefined();
    expect(errors.section8Status).toBeUndefined();
  });
});
