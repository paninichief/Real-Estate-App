import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent } from "@/lib/deal-analyzer/format";

describe("formatCurrency", () => {
  it("formats a whole-dollar amount with no decimals shown beyond cents", () => {
    expect(formatCurrency(250_000)).toBe("$250,000.00");
  });

  it("rounds an unrounded engine result to the nearest cent for display only", () => {
    // The mortgage-payment formula intentionally returns an unrounded value
    // (spec Appendix A.3: rounding happens at presentation, not mid-calculation).
    expect(formatCurrency(1199.104_65)).toBe("$1,199.10");
  });

  it("formats a negative amount with a leading minus sign", () => {
    expect(formatCurrency(-200.9)).toBe("-$200.90");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("converts a decimal ratio to a percentage string with two decimal places", () => {
    expect(formatPercent(0.0672)).toBe("6.72%");
  });

  it("formats a negative ratio", () => {
    expect(formatPercent(-0.015)).toBe("-1.50%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });
});
