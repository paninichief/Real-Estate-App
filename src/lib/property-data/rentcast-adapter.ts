import "server-only";
import type { NormalizedProperty } from "@/types/property";
import { rentcastGet } from "./rentcast-client";
import type { RentCastListingRecord, RentCastPropertyRecord } from "./rentcast-mapper";
import { mapToNormalizedProperty, toSearchMatch } from "./rentcast-mapper";
import type { PropertyDataProvider, PropertySearchQuery, PropertySearchResult } from "./provider";

/**
 * Real, network-backed PropertyDataProvider (spec section 10.1). Every
 * request is authenticated server-side and never reaches the browser (this
 * module and everything it imports are server-only). RentCastError from the
 * client always propagates rather than being swallowed into a "no match"
 * result — a live failure must never look identical to "this property
 * doesn't exist."
 */
export class RentCastAdapter implements PropertyDataProvider {
  readonly id = "rentcast";

  async searchByAddress(query: PropertySearchQuery): Promise<PropertySearchResult> {
    const address = query.address.trim();
    if (!address) {
      return { status: "no_match" };
    }

    const retrievedAt = new Date().toISOString();

    // Listings first: for an actively-listed property this single call
    // supplies structural facts *and* price/status together, which is the
    // common case and keeps the happy path to one request.
    const listingsResult = await rentcastGet<RentCastListingRecord[]>("/listings/sale", { address });
    const listings = listingsResult.found ? listingsResult.data : [];

    if (listings.length > 1) {
      return { status: "multiple_matches", matches: listings.map(toSearchMatch) };
    }

    if (listings.length === 1) {
      const listing = listings[0];
      return {
        status: "single_match",
        property: mapToNormalizedProperty(listing.id, listing, listing, retrievedAt),
      };
    }

    // No active listing — fall back to the base property record so an
    // off-market property still resolves, with price/status left honest
    // (not_available / off_market) rather than estimated.
    const propertiesResult = await rentcastGet<RentCastPropertyRecord[]>("/properties", { address });
    const properties = propertiesResult.found ? propertiesResult.data : [];

    if (properties.length === 0) {
      return { status: "no_match" };
    }

    if (properties.length > 1) {
      return { status: "multiple_matches", matches: properties.map(toSearchMatch) };
    }

    const record = properties[0];
    return { status: "single_match", property: mapToNormalizedProperty(record.id, record, null, retrievedAt) };
  }

  async getById(propertyId: string): Promise<NormalizedProperty | null> {
    const retrievedAt = new Date().toISOString();

    const propertyResult = await rentcastGet<RentCastPropertyRecord>(
      `/properties/${encodeURIComponent(propertyId)}`,
      {},
    );
    if (!propertyResult.found) {
      return null;
    }

    const listingResult = await rentcastGet<RentCastListingRecord>(
      `/listings/sale/${encodeURIComponent(propertyId)}`,
      {},
    );
    const listing = listingResult.found ? listingResult.data : null;

    return mapToNormalizedProperty(propertyId, propertyResult.data, listing, retrievedAt);
  }
}
