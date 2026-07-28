import { describe, it, expect } from "vitest";
import {
  amountToPercent,
  percentToAmount,
  validateDownPaymentPercent,
  formatPercentInput,
  formatDownPaymentAmountForInput,
} from "@/lib/deal-analyzer/down-payment-input";

describe("percentToAmount", () => {
  it("converts 20% of a $150,000 purchase price to $30,000", () => {
    expect(percentToAmount(150_000, 20)).toBe(30_000);
  });

  it("accepts 0%", () => {
    expect(percentToAmount(150_000, 0)).toBe(0);
  });

  it("accepts 100%", () => {
    expect(percentToAmount(150_000, 100)).toBe(150_000);
  });

  it("returns null when the percentage is missing", () => {
    expect(percentToAmount(150_000, null)).toBeNull();
  });

  it("returns null when the purchase price is missing", () => {
    expect(percentToAmount(null, 20)).toBeNull();
  });

  it("returns null when the purchase price is zero or negative", () => {
    expect(percentToAmount(0, 20)).toBeNull();
    expect(percentToAmount(-150_000, 20)).toBeNull();
  });
});

describe("amountToPercent", () => {
  it("converts a $30,000 down payment on a $150,000 purchase price to 20%", () => {
    expect(amountToPercent(150_000, 30_000)).toBe(20);
  });

  it("accepts a $0 amount", () => {
    expect(amountToPercent(150_000, 0)).toBe(0);
  });

  it("returns null when the amount is missing", () => {
    expect(amountToPercent(150_000, null)).toBeNull();
  });

  it("returns null when the purchase price is missing, zero, or negative", () => {
    expect(amountToPercent(null, 30_000)).toBeNull();
    expect(amountToPercent(0, 30_000)).toBeNull();
    expect(amountToPercent(-1, 30_000)).toBeNull();
  });
});

describe("percentToAmount / amountToPercent round-trip", () => {
  it("round-trips without drift for a clean percentage", () => {
    const amount = percentToAmount(150_000, 20);
    const percentBack = amountToPercent(150_000, amount);
    expect(percentBack).toBe(20);
  });
});

describe("validateDownPaymentPercent", () => {
  it("allows a blank percentage", () => {
    expect(validateDownPaymentPercent(null)).toBeUndefined();
  });

  it("allows the 0 boundary", () => {
    expect(validateDownPaymentPercent(0)).toBeUndefined();
  });

  it("allows the 100 boundary", () => {
    expect(validateDownPaymentPercent(100)).toBeUndefined();
  });

  it("rejects a percentage below 0", () => {
    expect(validateDownPaymentPercent(-0.01)).toMatch(/between 0 and 100/i);
  });

  it("rejects a percentage above 100", () => {
    expect(validateDownPaymentPercent(100.01)).toMatch(/between 0 and 100/i);
  });
});

describe("formatPercentInput", () => {
  it("shows a whole number with no trailing decimal", () => {
    expect(formatPercentInput(20)).toBe("20");
  });

  it("shows zero with no trailing decimal", () => {
    expect(formatPercentInput(0)).toBe("0");
  });

  it("keeps a single meaningful decimal without padding to four", () => {
    expect(formatPercentInput(20.5)).toBe("20.5");
  });

  it("rounds to at most four decimal places", () => {
    expect(formatPercentInput(13.333_333)).toBe("13.3333");
  });

  it("trims trailing zeros produced by rounding to four decimals", () => {
    expect(formatPercentInput(12.1)).toBe("12.1");
  });
});

describe("formatDownPaymentAmountForInput", () => {
  it("shows a whole dollar amount with no trailing decimal", () => {
    expect(formatDownPaymentAmountForInput(30_000)).toBe("30000");
  });

  it("rounds to at most two decimal places", () => {
    expect(formatDownPaymentAmountForInput(33_333.333)).toBe("33333.33");
  });

  it("shows zero with no trailing decimal", () => {
    expect(formatDownPaymentAmountForInput(0)).toBe("0");
  });
});
