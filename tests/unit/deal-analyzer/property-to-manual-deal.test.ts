import { describe, it, expect } from "vitest";
import { MockFixtureAdapter } from "@/lib/property-data/mock-fixture-adapter";
import { propertyToManualDealSeed } from "@/lib/deal-analyzer/property-to-manual-deal";
import type { NormalizedProperty } from "@/types/property";

const adapter = new MockFixtureAdapter();

const NOT_AVAILABLE_PROVENANCE = {
  status: "not_available" as const,
  source: null,
  retrievedAt: null,
  confidence: null,
  selectionRule: "no_data" as const,
  selectionExplanation: "No source reported this fact.",
};

/**
 * A fabricated property with every fact missing, to prove the mapper never
 * invents a value for a fact the property-data layer doesn't have.
 */
const EMPTY_PROPERTY: NormalizedProperty = {
  id: "prop-empty",
  address: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  propertyType: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  bedrooms: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  bathrooms: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  squareFootage: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  lotSizeSqft: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  yearBuilt: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  price: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  listingStatus: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  lastUpdatedAt: new Date(0).toISOString(),
};

describe("propertyToManualDealSeed", () => {
  it("maps every fact NormalizedProperty actually has (address, price, bedrooms, bathrooms, square footage)", async () => {
    const property = await adapter.getById("prop-maple-514");
    if (!property) throw new Error("fixture missing");

    const seed = propertyToManualDealSeed(property);

    expect(seed.values.address).toBe("514 Maple Street, Detroit, MI 48214");
    expect(seed.values.purchasePrice).toBe("189000");
    expect(seed.values.bedrooms).toBe("3");
    expect(seed.values.bathrooms).toBe("1.5");
    expect(seed.values.squareFootage).toBe("1450");
    expect(seed.seededFields).toEqual(
      new Set(["address", "purchasePrice", "bedrooms", "bathrooms", "squareFootage"]),
    );
  });

  it("never populates monthly rent, financing, or expenses — no source for them exists on NormalizedProperty", async () => {
    const property = await adapter.getById("prop-maple-514");
    if (!property) throw new Error("fixture missing");

    const seed = propertyToManualDealSeed(property);

    expect(seed.values).not.toHaveProperty("monthlyRent");
    expect(seed.values).not.toHaveProperty("downPayment");
    expect(seed.values).not.toHaveProperty("interestRatePercent");
    expect(seed.values).not.toHaveProperty("propertyTaxes");
  });

  it("omits a fact from both the values and seededFields when the property data layer has no value for it", () => {
    const seed = propertyToManualDealSeed(EMPTY_PROPERTY);

    expect(seed.values).toEqual({});
    expect(seed.seededFields.size).toBe(0);
  });

  it("only marks the facts that are actually present as seeded, leaving the rest for the user to fill in", async () => {
    // prop-oak-812 has every fact this mapper reads (address, price, beds, baths, sqft).
    const property = await adapter.getById("prop-oak-812");
    if (!property) throw new Error("fixture missing");

    const seed = propertyToManualDealSeed(property);

    expect(seed.seededFields.has("address")).toBe(true);
    expect(seed.seededFields.has("purchasePrice")).toBe(true);
    expect(seed.seededFields.has("bedrooms")).toBe(true);
    expect(seed.seededFields.has("bathrooms")).toBe(true);
    expect(seed.seededFields.has("squareFootage")).toBe(true);
  });
});
