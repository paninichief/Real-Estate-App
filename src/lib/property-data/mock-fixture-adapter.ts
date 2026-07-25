import type { NormalizedProperty } from "@/types/property";
import { resolveSourceValues } from "./conflict-resolution";
import { PROPERTY_FIXTURES, type RawPropertyFixture } from "./fixtures/properties";
import type { PropertyDataProvider, PropertySearchQuery, PropertySearchResult } from "./provider";

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fixtureMatchesQuery(fixture: RawPropertyFixture, rawQuery: string): boolean {
  const normalizedQuery = normalize(rawQuery);
  if (!normalizedQuery) return false;

  return fixture.searchAliases.some((alias) => {
    const normalizedAlias = normalize(alias);
    return normalizedAlias.includes(normalizedQuery) || normalizedQuery.includes(normalizedAlias);
  });
}

function computeLastUpdatedAt(raw: RawPropertyFixture): string {
  const timestamps = [
    raw.address,
    raw.propertyType,
    raw.bedrooms,
    raw.bathrooms,
    raw.squareFootage,
    raw.lotSizeSqft,
    raw.yearBuilt,
    raw.price,
    raw.listingStatus,
  ].flatMap((sourceValues) => sourceValues.map((sv) => sv.retrievedAt));

  return timestamps.sort().at(-1) ?? new Date(0).toISOString();
}

function buildNormalizedProperty(raw: RawPropertyFixture): NormalizedProperty {
  return {
    id: raw.id,
    address: resolveSourceValues(raw.address),
    propertyType: resolveSourceValues(raw.propertyType),
    bedrooms: resolveSourceValues(raw.bedrooms),
    bathrooms: resolveSourceValues(raw.bathrooms),
    squareFootage: resolveSourceValues(raw.squareFootage),
    lotSizeSqft: resolveSourceValues(raw.lotSizeSqft),
    yearBuilt: resolveSourceValues(raw.yearBuilt),
    price: resolveSourceValues(raw.price),
    listingStatus: resolveSourceValues(raw.listingStatus),
    lastUpdatedAt: computeLastUpdatedAt(raw),
  };
}

/**
 * Deterministic development/test implementation of PropertyDataProvider,
 * backed entirely by in-memory fixtures. Never performs network I/O, so it
 * is safe to use in unit tests, e2e tests, and day-to-day development
 * without consuming any RentCast quota (Configuration A).
 */
export class MockFixtureAdapter implements PropertyDataProvider {
  readonly id = "mock-fixture";

  async searchByAddress(query: PropertySearchQuery): Promise<PropertySearchResult> {
    const matches = PROPERTY_FIXTURES.filter((fixture) => fixtureMatchesQuery(fixture, query.address));

    if (matches.length === 0) {
      return { status: "no_match" };
    }

    if (matches.length === 1) {
      return { status: "single_match", property: buildNormalizedProperty(matches[0]) };
    }

    return {
      status: "multiple_matches",
      matches: matches.map((fixture) => ({
        propertyId: fixture.id,
        formattedAddress:
          resolveSourceValues(fixture.address).value?.formatted ?? fixture.id,
      })),
    };
  }

  async getById(propertyId: string): Promise<NormalizedProperty | null> {
    const fixture = PROPERTY_FIXTURES.find((f) => f.id === propertyId);
    return fixture ? buildNormalizedProperty(fixture) : null;
  }
}
