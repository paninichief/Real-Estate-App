import type { NormalizedProperty } from "@/types/property";
import type { ManualDealRawValues } from "./manual-deal-form-utils";

/**
 * The only `ManualDealRawValues` fields `NormalizedProperty` can ever supply
 * (spec Appendix A.3: never invent a fact). Rent, financing, and every
 * expense have no corresponding property-data fact and must always be
 * entered by the user, even for a property-seeded deal.
 */
export type ManualDealSeedField = "address" | "purchasePrice" | "bedrooms" | "bathrooms" | "squareFootage";

export interface ManualDealSeed {
  values: Partial<Pick<ManualDealRawValues, ManualDealSeedField>>;
  seededFields: Set<ManualDealSeedField>;
}

/**
 * Maps a `NormalizedProperty` (MockFixtureAdapter today, RentCastAdapter in
 * future) to the subset of manual-deal-entry fields it can honestly supply.
 * A fact with no resolved value (`null`) is simply omitted — the field stays
 * blank for the user to fill in, exactly as if they'd started from scratch.
 */
export function propertyToManualDealSeed(property: NormalizedProperty): ManualDealSeed {
  const values: Partial<Pick<ManualDealRawValues, ManualDealSeedField>> = {};
  const seededFields = new Set<ManualDealSeedField>();

  if (property.address.value) {
    values.address = property.address.value.formatted;
    seededFields.add("address");
  }
  if (property.price.value !== null) {
    values.purchasePrice = String(property.price.value);
    seededFields.add("purchasePrice");
  }
  if (property.bedrooms.value !== null) {
    values.bedrooms = String(property.bedrooms.value);
    seededFields.add("bedrooms");
  }
  if (property.bathrooms.value !== null) {
    values.bathrooms = String(property.bathrooms.value);
    seededFields.add("bathrooms");
  }
  if (property.squareFootage.value !== null) {
    values.squareFootage = String(property.squareFootage.value);
    seededFields.add("squareFootage");
  }

  return { values, seededFields };
}
