/** Residential property types supported at launch (spec section 1.5). */
export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "duplex"
  | "triplex"
  | "fourplex"
  | "unknown";

export type ListingStatus = "active" | "off_market" | "unknown";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  formatted: string;
}

/**
 * Every provider that can report a property fact. Only "mock" is exercised
 * today; "rentcast" is wired up by the real adapter in a later step, and
 * "realtor" | "zillow" | "redfin" represent the future sources the
 * conflict-resolution rules in spec section 10.2 are written against.
 */
export type PropertyDataSourceId =
  | "rentcast"
  | "realtor"
  | "zillow"
  | "redfin"
  | "manual_entry"
  | "mock";

/**
 * Status vocabulary from spec sections 1.2 / 10.2, restricted to the subset
 * relevant to raw property facts (as opposed to analysis/scoring output,
 * which adds statuses like "benchmark" and "assumption" in later milestones).
 */
export type FactStatus =
  | "confirmed"
  | "reported"
  | "estimated"
  | "unverified"
  | "low_confidence"
  | "insufficient_data"
  | "not_available";

export interface SourceValue<T> {
  source: PropertyDataSourceId;
  value: T;
  retrievedAt: string;
  status?: FactStatus;
  confidence?: number;
}

export type ConflictResolutionRule =
  | "no_data"
  | "single_source"
  | "majority"
  | "priority_fallback";

export interface FactProvenance {
  status: FactStatus;
  source: PropertyDataSourceId | null;
  retrievedAt: string | null;
  confidence: number | null;
  selectionRule: ConflictResolutionRule;
  selectionExplanation: string;
}

/**
 * A single normalized property fact: the resolved value plus full
 * provenance, with every conflicting source value preserved internally
 * (spec section 10.2).
 */
export interface PropertyFact<T> {
  value: T | null;
  provenance: FactProvenance;
  sourceValues: SourceValue<T>[];
}

export interface NormalizedProperty {
  id: string;
  address: PropertyFact<Address>;
  propertyType: PropertyFact<PropertyType>;
  bedrooms: PropertyFact<number>;
  bathrooms: PropertyFact<number>;
  squareFootage: PropertyFact<number>;
  lotSizeSqft: PropertyFact<number>;
  yearBuilt: PropertyFact<number>;
  price: PropertyFact<number>;
  listingStatus: PropertyFact<ListingStatus>;
  /** Most recent retrievedAt across every fact (spec section 10.3). */
  lastUpdatedAt: string;
}

/** Only "placeholder" exists until a licensed photo feed is connected. */
export type PhotoSourceId = "placeholder";

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  /** Null for generated placeholders — see PlaceholderMediaAdapter. */
  url: string | null;
  isPrimary: boolean;
  displayOrder: number;
  altText: string;
  source: PhotoSourceId;
  attribution: string | null;
  licenseNotes: string | null;
}
