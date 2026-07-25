import type { Address, ListingStatus, NormalizedProperty, PropertyType, SourceValue } from "@/types/property";
import { resolveSourceValues } from "./conflict-resolution";

/** Fields shared by RentCast's /properties and /listings/sale records. */
export interface RentCastPropertyRecord {
  id: string;
  formattedAddress?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFootage?: number | null;
  lotSize?: number | null;
  yearBuilt?: number | null;
}

/** A /listings/sale record: a property record plus listing-specific fields. */
export interface RentCastListingRecord extends RentCastPropertyRecord {
  status?: string | null;
  price?: number | null;
}

/**
 * Only the RentCast propertyType values that map cleanly onto our supported
 * launch types (spec section 1.5). "Multi-Family" (2-4 units) doesn't
 * distinguish duplex/triplex/fourplex, "Apartment" means a 5+ unit building
 * (unsupported), and "Manufactured" has no equivalent — all three map to
 * "unknown" rather than guessing a unit count RentCast didn't report.
 */
const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  "Single Family": "single_family",
  Condo: "condo",
  Townhouse: "townhouse",
};

function mapPropertyType(raw: string | null | undefined): PropertyType {
  if (!raw) return "unknown";
  return PROPERTY_TYPE_MAP[raw] ?? "unknown";
}

function mapListingStatus(raw: string | null | undefined): ListingStatus {
  if (raw === "Active") return "active";
  if (raw === "Inactive") return "off_market";
  return "unknown";
}

function present<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function asSourceValues<T>(value: T | null | undefined, retrievedAt: string): SourceValue<T>[] {
  return present(value) ? [{ source: "rentcast", value, retrievedAt }] : [];
}

/** Returns null when RentCast didn't report enough to build an address at all. */
export function buildAddressFromRecord(record: RentCastPropertyRecord): Address | null {
  if (!present(record.addressLine1) && !present(record.formattedAddress)) {
    return null;
  }

  const line1 = record.addressLine1 ?? "";
  const city = record.city ?? "";
  const state = record.state ?? "";
  const zip = record.zipCode ?? "";

  return {
    line1,
    line2: record.addressLine2 ?? undefined,
    city,
    state,
    zip,
    latitude: record.latitude ?? undefined,
    longitude: record.longitude ?? undefined,
    formatted: record.formattedAddress ?? [line1, city, [state, zip].filter(Boolean).join(" ")].filter(Boolean).join(", "),
  };
}

export function toSearchMatch(record: RentCastPropertyRecord): { propertyId: string; formattedAddress: string } {
  return {
    propertyId: record.id,
    formattedAddress: record.formattedAddress ?? record.id,
  };
}

/**
 * Maps a RentCast property record (structural facts) plus an optional
 * listing record (current price/status) into the app's NormalizedProperty
 * model. `listing` is null for an off-market property — that absence is
 * itself the signal for listingStatus "off_market" and price
 * "not_available"; it is never replaced with an estimated figure RentCast
 * did not provide.
 */
export function mapToNormalizedProperty(
  propertyId: string,
  record: RentCastPropertyRecord,
  listing: RentCastListingRecord | null,
  retrievedAt: string,
): NormalizedProperty {
  const address = buildAddressFromRecord(record);
  const listingStatusValue: ListingStatus = listing ? mapListingStatus(listing.status) : "off_market";

  return {
    id: propertyId,
    address: resolveSourceValues(asSourceValues(address, retrievedAt)),
    propertyType: resolveSourceValues(asSourceValues(mapPropertyType(record.propertyType), retrievedAt)),
    bedrooms: resolveSourceValues(asSourceValues(record.bedrooms, retrievedAt)),
    bathrooms: resolveSourceValues(asSourceValues(record.bathrooms, retrievedAt)),
    squareFootage: resolveSourceValues(asSourceValues(record.squareFootage, retrievedAt)),
    lotSizeSqft: resolveSourceValues(asSourceValues(record.lotSize, retrievedAt)),
    yearBuilt: resolveSourceValues(asSourceValues(record.yearBuilt, retrievedAt)),
    price: resolveSourceValues(asSourceValues(listing?.price, retrievedAt)),
    listingStatus: resolveSourceValues(asSourceValues(listingStatusValue, retrievedAt)),
    lastUpdatedAt: retrievedAt,
  };
}
