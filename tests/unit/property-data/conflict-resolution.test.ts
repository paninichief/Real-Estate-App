import { describe, it, expect } from "vitest";
import { resolveSourceValues } from "@/lib/property-data/conflict-resolution";
import type { SourceValue } from "@/types/property";

const RETRIEVED_AT = "2026-06-01T09:00:00.000Z";

function sv<T>(source: SourceValue<T>["source"], value: T, overrides: Partial<SourceValue<T>> = {}): SourceValue<T> {
  return { source, value, retrievedAt: RETRIEVED_AT, ...overrides };
}

describe("resolveSourceValues", () => {
  it("returns not_available with no source values", () => {
    const result = resolveSourceValues<number>([]);
    expect(result.value).toBeNull();
    expect(result.sourceValues).toEqual([]);
    expect(result.provenance.status).toBe("not_available");
    expect(result.provenance.source).toBeNull();
    expect(result.provenance.selectionRule).toBe("no_data");
  });

  it("uses the single source when only one reports a value", () => {
    const result = resolveSourceValues([sv("mock", 3)]);
    expect(result.value).toBe(3);
    expect(result.provenance.source).toBe("mock");
    expect(result.provenance.selectionRule).toBe("single_source");
    expect(result.provenance.status).toBe("reported");
  });

  it("preserves the given status/confidence when the source specifies them", () => {
    const result = resolveSourceValues([sv("mock", 1948, { status: "estimated", confidence: 0.6 })]);
    expect(result.provenance.status).toBe("estimated");
    expect(result.provenance.confidence).toBe(0.6);
  });

  it("picks the majority value when two of three sources agree (spec 10.2 rule 1)", () => {
    const values = [sv("realtor", 3), sv("zillow", 3), sv("redfin", 4)];
    const result = resolveSourceValues(values);
    expect(result.value).toBe(3);
    expect(result.provenance.selectionRule).toBe("majority");
    expect(result.provenance.source).toBe("realtor");
    // Every reported value is preserved regardless of which one was selected.
    expect(result.sourceValues).toHaveLength(3);
  });

  it("falls back to Realtor.com when all three sources conflict (spec 10.2 rule 2)", () => {
    const values = [sv("realtor", 1450), sv("zillow", 1620), sv("redfin", 1300)];
    const result = resolveSourceValues(values);
    expect(result.value).toBe(1450);
    expect(result.provenance.source).toBe("realtor");
    expect(result.provenance.selectionRule).toBe("priority_fallback");
  });

  it("falls back to Zillow when Realtor.com is unavailable and Zillow conflicts with Redfin (spec 10.2 rule 3)", () => {
    const values = [sv("zillow", 200000), sv("redfin", 210000)];
    const result = resolveSourceValues(values);
    expect(result.value).toBe(200000);
    expect(result.provenance.source).toBe("zillow");
    expect(result.provenance.selectionRule).toBe("priority_fallback");
  });

  it("resolves object-valued facts (e.g. Address) by deep equality", () => {
    const address = { line1: "1 Main St", city: "Detroit", state: "MI", zip: "48214", formatted: "1 Main St, Detroit, MI 48214" };
    const values = [sv("realtor", address), sv("zillow", { ...address }), sv("redfin", { ...address, city: "Livonia" })];
    const result = resolveSourceValues(values);
    expect(result.value).toEqual(address);
    expect(result.provenance.selectionRule).toBe("majority");
  });

  it("explains the selection in plain language", () => {
    const values = [sv("realtor", 1), sv("zillow", 2)];
    const result = resolveSourceValues(values);
    expect(result.provenance.selectionExplanation).toMatch(/realtor/i);
  });
});
