import { describe, it, expect } from "vitest";
import { MockFixtureAdapter } from "@/lib/property-data/mock-fixture-adapter";
import type { PropertyDataProvider } from "@/lib/property-data/provider";

const adapter: PropertyDataProvider = new MockFixtureAdapter();

describe("MockFixtureAdapter.searchByAddress", () => {
  it("returns a single match for an exact fixture address", async () => {
    const result = await adapter.searchByAddress({ address: "514 Maple Street, Detroit, MI 48214" });
    expect(result.status).toBe("single_match");
    if (result.status === "single_match") {
      expect(result.property.id).toBe("prop-maple-514");
    }
  });

  it("is case- and punctuation-insensitive", async () => {
    const result = await adapter.searchByAddress({ address: "  514 MAPLE st, detroit MI" });
    expect(result.status).toBe("single_match");
  });

  it("returns multiple matches when the same street/number exists in two cities", async () => {
    const result = await adapter.searchByAddress({ address: "22 Elm Court" });
    expect(result.status).toBe("multiple_matches");
    if (result.status === "multiple_matches") {
      expect(result.matches.map((m) => m.propertyId).sort()).toEqual(["prop-elm-il", "prop-elm-mo"]);
      expect(result.matches.every((m) => m.formattedAddress.length > 0)).toBe(true);
    }
  });

  it("returns no_match for an address with no fixture", async () => {
    const result = await adapter.searchByAddress({ address: "999 Nowhere Road, Nowhere, ZZ 00000" });
    expect(result.status).toBe("no_match");
  });

  it("returns no_match for an empty address", async () => {
    const result = await adapter.searchByAddress({ address: "   " });
    expect(result.status).toBe("no_match");
  });
});

describe("MockFixtureAdapter.getById", () => {
  it("returns null for an unknown id", async () => {
    const property = await adapter.getById("does-not-exist");
    expect(property).toBeNull();
  });

  it("builds a normalized property with resolved facts and provenance for a multi-source fixture", async () => {
    const property = await adapter.getById("prop-maple-514");
    expect(property).not.toBeNull();
    if (!property) return;

    expect(property.address.value?.formatted).toBe("514 Maple Street, Detroit, MI 48214");
    // Majority rule: Realtor/Zillow both report 3 bedrooms, Redfin reports 4.
    expect(property.bedrooms.value).toBe(3);
    expect(property.bedrooms.provenance.selectionRule).toBe("majority");
    // All three square-footage values conflict -> priority fallback to Realtor.com.
    expect(property.squareFootage.value).toBe(1450);
    expect(property.squareFootage.provenance.selectionRule).toBe("priority_fallback");
    // No source reported lot size.
    expect(property.lotSizeSqft.value).toBeNull();
    expect(property.lotSizeSqft.provenance.status).toBe("not_available");
    // Every source value is preserved even though only one was selected.
    expect(property.squareFootage.sourceValues).toHaveLength(3);
  });

  it("labels a missing field as not_available for a single-source fixture", async () => {
    const property = await adapter.getById("prop-oak-812");
    expect(property).not.toBeNull();
    if (!property) return;

    expect(property.listingStatus.value).toBe("off_market");
    expect(property.yearBuilt.value).toBeNull();
    expect(property.yearBuilt.provenance.status).toBe("not_available");
  });

  it("computes lastUpdatedAt as the most recent retrievedAt across all facts", async () => {
    const property = await adapter.getById("prop-maple-514");
    expect(property).not.toBeNull();
    // Redfin's 2026-06-03 readings are the most recent across all facts.
    expect(property?.lastUpdatedAt).toBe("2026-06-03T09:00:00.000Z");
  });
});

describe("PropertyDataProvider contract", () => {
  it("MockFixtureAdapter satisfies the PropertyDataProvider interface", () => {
    expect(typeof adapter.searchByAddress).toBe("function");
    expect(typeof adapter.getById).toBe("function");
    expect(typeof adapter.id).toBe("string");
  });
});
