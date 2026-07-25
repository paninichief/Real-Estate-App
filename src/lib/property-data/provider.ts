import type { NormalizedProperty } from "@/types/property";

export interface PropertySearchQuery {
  address: string;
}

export interface PropertySearchMatch {
  propertyId: string;
  formattedAddress: string;
}

export type PropertySearchResult =
  | { status: "single_match"; property: NormalizedProperty }
  | { status: "multiple_matches"; matches: PropertySearchMatch[] }
  | { status: "no_match" };

/**
 * Replaceable contract for fetching property facts (spec section 10.1). No
 * page or component may depend on a specific implementation's response
 * shape — only on this interface and the normalized model it returns.
 */
export interface PropertyDataProvider {
  readonly id: string;
  searchByAddress(query: PropertySearchQuery): Promise<PropertySearchResult>;
  getById(propertyId: string): Promise<NormalizedProperty | null>;
}
