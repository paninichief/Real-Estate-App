import type { PropertyPhoto } from "@/types/property";

/**
 * Replaceable contract for fetching property photos (spec section 10.1),
 * intentionally decoupled from PropertyDataProvider — the property-facts
 * source (RentCast) has no photo fields at all. Property cards, galleries,
 * and quick view must depend only on this interface.
 */
export interface PropertyMediaProvider {
  readonly id: string;
  getPhotos(propertyId: string): Promise<PropertyPhoto[]>;
}
