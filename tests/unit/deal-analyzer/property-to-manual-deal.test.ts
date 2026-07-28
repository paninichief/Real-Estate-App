import { describe, it, expect } from "vitest";
import { MockFixtureAdapter } from "@/lib/property-data/mock-fixture-adapter";
import { propertyToManualDealSeed } from "@/lib/deal-analyzer/property-to-manual-deal";
import type { FactStatus, NormalizedProperty } from "@/types/property";

const adapter = new MockFixtureAdapter();

const NOT_AVAILABLE_PROVENANCE = {
  status: "not_available" as const,
  source: null,
  retrievedAt: null,
  confidence: null,
  selectionRule: "no_data" as const,
  selectionExplanation: "No source reported this fact.",
};

/** Builds a minimal single-source provenance with an explicit, arbitrary status, for status-mapping tests. */
function provenanceWithStatus(status: FactStatus) {
  return {
    status,
    source: "mock" as const,
    retrievedAt: "2026-01-01T00:00:00.000Z",
    confidence: null,
    selectionRule: "single_source" as const,
    selectionExplanation: "Test fixture.",
  };
}

/**
 * A fabricated property exercising every canonical FactStatus not already
 * covered by the real mock fixtures (which only ever produce "reported" or
 * "estimated" for these five fields) — proves the mapper preserves whatever
 * status the property-data layer actually assigned, never inventing one.
 */
const MULTI_STATUS_PROPERTY: NormalizedProperty = {
  id: "prop-multi-status",
  address: {
    value: { line1: "1 Confirmed Way", city: "Detroit", state: "MI", zip: "48201", formatted: "1 Confirmed Way, Detroit, MI 48201" },
    provenance: provenanceWithStatus("confirmed"),
    sourceValues: [],
  },
  propertyType: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  bedrooms: { value: 5, provenance: provenanceWithStatus("unverified"), sourceValues: [] },
  bathrooms: { value: 2.5, provenance: provenanceWithStatus("low_confidence"), sourceValues: [] },
  squareFootage: { value: 2200, provenance: provenanceWithStatus("insufficient_data"), sourceValues: [] },
  lotSizeSqft: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  yearBuilt: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  price: { value: 210000, provenance: provenanceWithStatus("estimated"), sourceValues: [] },
  listingStatus: { value: null, provenance: NOT_AVAILABLE_PROVENANCE, sourceValues: [] },
  lastUpdatedAt: new Date(0).toISOString(),
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

describe("propertyToManualDealSeed — preserves the property-data confidence status", () => {
  it("captures the resolved status for every seeded field, never inventing one", () => {
    const seed = propertyToManualDealSeed(MULTI_STATUS_PROPERTY);

    expect(seed.statuses.address).toBe("confirmed");
    expect(seed.statuses.bedrooms).toBe("unverified");
    expect(seed.statuses.bathrooms).toBe("low_confidence");
    expect(seed.statuses.squareFootage).toBe("insufficient_data");
    expect(seed.statuses.purchasePrice).toBe("estimated");
  });

  it("defaults to the resolved 'reported' status for a single-source fixture with no explicit status override", async () => {
    // MockFixtureAdapter's Maple Street fixture never sets an explicit
    // `status` on any of its source values for these five fields, so
    // conflict-resolution's own default ("reported") is what should surface.
    const property = await adapter.getById("prop-maple-514");
    if (!property) throw new Error("fixture missing");

    const seed = propertyToManualDealSeed(property);

    expect(seed.statuses.address).toBe("reported");
    expect(seed.statuses.purchasePrice).toBe("reported");
    expect(seed.statuses.bedrooms).toBe("reported");
    expect(seed.statuses.bathrooms).toBe("reported");
    expect(seed.statuses.squareFootage).toBe("reported");
  });

  it("preserves an explicit 'estimated' status from the fixture rather than defaulting it away", async () => {
    // Oak Avenue's price is explicitly marked "estimated" in the fixture.
    const property = await adapter.getById("prop-oak-812");
    if (!property) throw new Error("fixture missing");

    const seed = propertyToManualDealSeed(property);

    expect(seed.statuses.purchasePrice).toBe("estimated");
  });

  it("never records a status for a field that wasn't seeded", () => {
    const seed = propertyToManualDealSeed(EMPTY_PROPERTY);

    expect(seed.statuses).toEqual({});
  });
});
