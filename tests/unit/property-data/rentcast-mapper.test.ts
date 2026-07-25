import { describe, it, expect } from "vitest";
import {
  buildAddressFromRecord,
  mapToNormalizedProperty,
  toSearchMatch,
  type RentCastListingRecord,
  type RentCastPropertyRecord,
} from "@/lib/property-data/rentcast-mapper";

const RETRIEVED_AT = "2026-07-24T12:00:00.000Z";

const FULL_RECORD: RentCastPropertyRecord = {
  id: "rc-123",
  formattedAddress: "514 Maple Street, Detroit, MI 48214",
  addressLine1: "514 Maple Street",
  city: "Detroit",
  state: "MI",
  zipCode: "48214",
  latitude: 42.35,
  longitude: -83.05,
  propertyType: "Single Family",
  bedrooms: 3,
  bathrooms: 1.5,
  squareFootage: 1450,
  lotSize: 5000,
  yearBuilt: 1948,
};

describe("buildAddressFromRecord", () => {
  it("returns null when RentCast reports no address at all", () => {
    expect(buildAddressFromRecord({ id: "rc-1" })).toBeNull();
  });

  it("builds a formatted address from parts when formattedAddress is missing", () => {
    const address = buildAddressFromRecord({
      id: "rc-1",
      addressLine1: "9 Oak Ave",
      city: "Flint",
      state: "MI",
      zipCode: "48503",
    });
    expect(address?.formatted).toBe("9 Oak Ave, Flint, MI 48503");
  });

  it("uses RentCast's formattedAddress verbatim when present", () => {
    const address = buildAddressFromRecord(FULL_RECORD);
    expect(address?.formatted).toBe("514 Maple Street, Detroit, MI 48214");
  });
});

describe("toSearchMatch", () => {
  it("falls back to the record id when formattedAddress is missing", () => {
    expect(toSearchMatch({ id: "rc-9" })).toEqual({ propertyId: "rc-9", formattedAddress: "rc-9" });
  });
});

describe("mapToNormalizedProperty — property type mapping", () => {
  it.each([
    ["Single Family", "single_family"],
    ["Condo", "condo"],
    ["Townhouse", "townhouse"],
  ] as const)("maps RentCast %s to %s", (raw, expected) => {
    const property = mapToNormalizedProperty(
      "rc-1",
      { ...FULL_RECORD, propertyType: raw },
      null,
      RETRIEVED_AT,
    );
    expect(property.propertyType.value).toBe(expected);
  });

  it.each(["Multi-Family", "Apartment", "Manufactured", "Land", "Something Unrecognized"])(
    "maps unsupported/unrecognized RentCast type %s to unknown rather than guessing",
    (raw) => {
      const property = mapToNormalizedProperty("rc-1", { ...FULL_RECORD, propertyType: raw }, null, RETRIEVED_AT);
      expect(property.propertyType.value).toBe("unknown");
    },
  );

  it("maps a missing propertyType to unknown", () => {
    const property = mapToNormalizedProperty("rc-1", { ...FULL_RECORD, propertyType: undefined }, null, RETRIEVED_AT);
    expect(property.propertyType.value).toBe("unknown");
  });
});

describe("mapToNormalizedProperty — off-market (no listing)", () => {
  const property = mapToNormalizedProperty("rc-1", FULL_RECORD, null, RETRIEVED_AT);

  it("never fabricates a price", () => {
    expect(property.price.value).toBeNull();
    expect(property.price.provenance.status).toBe("not_available");
  });

  it("derives listingStatus off_market from the absence of a listing", () => {
    expect(property.listingStatus.value).toBe("off_market");
  });

  it("still resolves structural facts from the property record", () => {
    expect(property.bedrooms.value).toBe(3);
    expect(property.bathrooms.value).toBe(1.5);
    expect(property.squareFootage.value).toBe(1450);
    expect(property.yearBuilt.value).toBe(1948);
  });

  it("sets lastUpdatedAt to the retrieval timestamp", () => {
    expect(property.lastUpdatedAt).toBe(RETRIEVED_AT);
  });
});

describe("mapToNormalizedProperty — active listing", () => {
  const listing: RentCastListingRecord = { ...FULL_RECORD, status: "Active", price: 189_000 };
  const property = mapToNormalizedProperty("rc-1", listing, listing, RETRIEVED_AT);

  it("resolves price and status from the listing", () => {
    expect(property.price.value).toBe(189_000);
    expect(property.price.provenance.source).toBe("rentcast");
    expect(property.listingStatus.value).toBe("active");
  });

  it("maps an Inactive listing status to off_market", () => {
    const inactive: RentCastListingRecord = { ...listing, status: "Inactive" };
    const inactiveProperty = mapToNormalizedProperty("rc-1", inactive, inactive, RETRIEVED_AT);
    expect(inactiveProperty.listingStatus.value).toBe("off_market");
  });

  it("maps an unrecognized listing status to unknown rather than guessing", () => {
    const weird: RentCastListingRecord = { ...listing, status: "Pending" };
    const weirdProperty = mapToNormalizedProperty("rc-1", weird, weird, RETRIEVED_AT);
    expect(weirdProperty.listingStatus.value).toBe("unknown");
  });
});

describe("mapToNormalizedProperty — partial/missing fields", () => {
  it("labels missing numeric fields as not_available instead of inventing a value", () => {
    const property = mapToNormalizedProperty(
      "rc-1",
      { id: "rc-1", formattedAddress: "1 Test St", yearBuilt: null, lotSize: undefined },
      null,
      RETRIEVED_AT,
    );
    expect(property.yearBuilt.value).toBeNull();
    expect(property.yearBuilt.provenance.status).toBe("not_available");
    expect(property.lotSizeSqft.value).toBeNull();
    expect(property.lotSizeSqft.provenance.status).toBe("not_available");
  });

  it("treats bedrooms/bathrooms of 0 as real values, not missing data", () => {
    const property = mapToNormalizedProperty(
      "rc-1",
      { ...FULL_RECORD, bedrooms: 0, bathrooms: 0 },
      null,
      RETRIEVED_AT,
    );
    expect(property.bedrooms.value).toBe(0);
    expect(property.bedrooms.provenance.status).not.toBe("not_available");
    expect(property.bathrooms.value).toBe(0);
  });
});
