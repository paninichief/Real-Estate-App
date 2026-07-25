import type { Address, ListingStatus, PropertyType, SourceValue } from "@/types/property";

/**
 * Deterministic development/test property data. Every address here is a
 * fabricated sample for Milestone 2 development — not a real listing or
 * real RentCast/Realtor/Zillow/Redfin response.
 */
export interface RawPropertyFixture {
  id: string;
  /** Lowercase strings a normalized query is matched against. */
  searchAliases: string[];
  address: SourceValue<Address>[];
  propertyType: SourceValue<PropertyType>[];
  bedrooms: SourceValue<number>[];
  bathrooms: SourceValue<number>[];
  squareFootage: SourceValue<number>[];
  lotSizeSqft: SourceValue<number>[];
  yearBuilt: SourceValue<number>[];
  price: SourceValue<number>[];
  listingStatus: SourceValue<ListingStatus>[];
}

const MAPLE_ADDRESS: Address = {
  line1: "514 Maple Street",
  city: "Detroit",
  state: "MI",
  zip: "48214",
  formatted: "514 Maple Street, Detroit, MI 48214",
};

/**
 * Demonstrates both conflict-resolution rules from spec section 10.2 at
 * once: bedrooms resolves by majority (Realtor/Zillow agree over Redfin),
 * square footage resolves by priority fallback (all three disagree).
 */
const MAPLE_STREET_FIXTURE: RawPropertyFixture = {
  id: "prop-maple-514",
  searchAliases: [
    "514 maple street, detroit, mi 48214",
    "514 maple street detroit mi",
    "514 maple st detroit",
  ],
  address: [
    { source: "realtor", value: MAPLE_ADDRESS, retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: MAPLE_ADDRESS, retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: MAPLE_ADDRESS, retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
  propertyType: [
    { source: "realtor", value: "single_family", retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: "single_family", retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: "single_family", retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
  bedrooms: [
    { source: "realtor", value: 3, retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: 3, retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: 4, retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
  bathrooms: [
    { source: "realtor", value: 1.5, retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: 1.5, retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: 1.5, retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
  squareFootage: [
    { source: "realtor", value: 1450, retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: 1620, retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: 1300, retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
  lotSizeSqft: [],
  yearBuilt: [
    { source: "zillow", value: 1948, retrievedAt: "2026-06-02T09:00:00.000Z", status: "estimated" },
  ],
  price: [{ source: "realtor", value: 189000, retrievedAt: "2026-06-01T09:00:00.000Z" }],
  listingStatus: [
    { source: "realtor", value: "active", retrievedAt: "2026-06-01T09:00:00.000Z" },
    { source: "zillow", value: "active", retrievedAt: "2026-06-02T09:00:00.000Z" },
    { source: "redfin", value: "active", retrievedAt: "2026-06-03T09:00:00.000Z" },
  ],
};

const OAK_ADDRESS: Address = {
  line1: "812 Oak Avenue",
  city: "Detroit",
  state: "MI",
  zip: "48207",
  formatted: "812 Oak Avenue, Detroit, MI 48207",
};

/** Off-market, single-source, with intentionally missing fields. */
const OAK_AVENUE_FIXTURE: RawPropertyFixture = {
  id: "prop-oak-812",
  searchAliases: ["812 oak avenue, detroit, mi 48207", "812 oak ave detroit"],
  address: [{ source: "mock", value: OAK_ADDRESS, retrievedAt: "2026-05-20T09:00:00.000Z" }],
  propertyType: [{ source: "mock", value: "duplex", retrievedAt: "2026-05-20T09:00:00.000Z" }],
  bedrooms: [{ source: "mock", value: 4, retrievedAt: "2026-05-20T09:00:00.000Z" }],
  bathrooms: [{ source: "mock", value: 2, retrievedAt: "2026-05-20T09:00:00.000Z" }],
  squareFootage: [{ source: "mock", value: 2100, retrievedAt: "2026-05-20T09:00:00.000Z" }],
  lotSizeSqft: [],
  yearBuilt: [],
  price: [
    { source: "mock", value: 96000, retrievedAt: "2026-05-20T09:00:00.000Z", status: "estimated" },
  ],
  listingStatus: [{ source: "mock", value: "off_market", retrievedAt: "2026-05-20T09:00:00.000Z" }],
};

const BIRCH_ADDRESS: Address = {
  line1: "215 Birch Lane",
  city: "Ann Arbor",
  state: "MI",
  zip: "48104",
  formatted: "215 Birch Lane, Ann Arbor, MI 48104",
};

/** Nationwide (non-Detroit) coverage, active, and zero photos. */
const BIRCH_LANE_FIXTURE: RawPropertyFixture = {
  id: "prop-birch-215",
  searchAliases: ["215 birch lane, ann arbor, mi 48104", "215 birch ln ann arbor"],
  address: [{ source: "mock", value: BIRCH_ADDRESS, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  propertyType: [{ source: "mock", value: "condo", retrievedAt: "2026-07-01T09:00:00.000Z" }],
  bedrooms: [{ source: "mock", value: 2, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  bathrooms: [{ source: "mock", value: 2, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  squareFootage: [{ source: "mock", value: 980, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  lotSizeSqft: [{ source: "mock", value: 0, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  yearBuilt: [{ source: "mock", value: 2005, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  price: [{ source: "mock", value: 154000, retrievedAt: "2026-07-01T09:00:00.000Z" }],
  listingStatus: [{ source: "mock", value: "active", retrievedAt: "2026-07-01T09:00:00.000Z" }],
};

const ELM_IL_ADDRESS: Address = {
  line1: "22 Elm Court",
  city: "Springfield",
  state: "IL",
  zip: "62704",
  formatted: "22 Elm Court, Springfield, IL 62704",
};

/** Same street name/number as ELM_COURT_MO — exercises multiple-matches. */
const ELM_COURT_IL_FIXTURE: RawPropertyFixture = {
  id: "prop-elm-il",
  searchAliases: ["22 elm court", "22 elm court, springfield, il 62704"],
  address: [{ source: "mock", value: ELM_IL_ADDRESS, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  propertyType: [{ source: "mock", value: "single_family", retrievedAt: "2026-06-15T09:00:00.000Z" }],
  bedrooms: [{ source: "mock", value: 3, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  bathrooms: [{ source: "mock", value: 2, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  squareFootage: [{ source: "mock", value: 1500, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  lotSizeSqft: [{ source: "mock", value: 6000, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  yearBuilt: [{ source: "mock", value: 1962, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  price: [{ source: "mock", value: 175000, retrievedAt: "2026-06-15T09:00:00.000Z" }],
  listingStatus: [{ source: "mock", value: "active", retrievedAt: "2026-06-15T09:00:00.000Z" }],
};

const ELM_MO_ADDRESS: Address = {
  line1: "22 Elm Court",
  city: "Springfield",
  state: "MO",
  zip: "65801",
  formatted: "22 Elm Court, Springfield, MO 65801",
};

const ELM_COURT_MO_FIXTURE: RawPropertyFixture = {
  id: "prop-elm-mo",
  searchAliases: ["22 elm court", "22 elm court, springfield, mo 65801"],
  address: [{ source: "mock", value: ELM_MO_ADDRESS, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  propertyType: [{ source: "mock", value: "townhouse", retrievedAt: "2026-06-10T09:00:00.000Z" }],
  bedrooms: [{ source: "mock", value: 3, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  bathrooms: [{ source: "mock", value: 1.5, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  squareFootage: [{ source: "mock", value: 1350, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  lotSizeSqft: [],
  yearBuilt: [{ source: "mock", value: 1998, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  price: [{ source: "mock", value: 149500, retrievedAt: "2026-06-10T09:00:00.000Z" }],
  listingStatus: [{ source: "mock", value: "active", retrievedAt: "2026-06-10T09:00:00.000Z" }],
};

export const PROPERTY_FIXTURES: RawPropertyFixture[] = [
  MAPLE_STREET_FIXTURE,
  OAK_AVENUE_FIXTURE,
  BIRCH_LANE_FIXTURE,
  ELM_COURT_IL_FIXTURE,
  ELM_COURT_MO_FIXTURE,
];
