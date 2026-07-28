import { MockFixtureAdapter } from "./mock-fixture-adapter";
import { RentCastAdapter } from "./rentcast-adapter";
import type { PropertyDataProvider } from "./provider";

let cachedProvider: PropertyDataProvider | null = null;
let cachedMockProvider: PropertyDataProvider | null = null;

/**
 * Returns the active PropertyDataProvider. Defaults to MockFixtureAdapter
 * (Configuration A) everywhere — the public site, every automated test, and
 * day-to-day dev all stay on mock data unless PROPERTY_DATA_PROVIDER is
 * explicitly set to "rentcast". That variable is for local manual
 * verification only; it must not be set in Vercel without separate
 * approval, since doing so would switch the live site to real RentCast data.
 */
export function getPropertyDataProvider(): PropertyDataProvider {
  if (!cachedProvider) {
    cachedProvider =
      process.env.PROPERTY_DATA_PROVIDER === "rentcast" ? new RentCastAdapter() : new MockFixtureAdapter();
  }
  return cachedProvider;
}

/**
 * Returns a MockFixtureAdapter unconditionally, ignoring
 * `PROPERTY_DATA_PROVIDER` entirely. For surfaces that must stay mock-only
 * regardless of the site's general provider selection (Milestone 3C's
 * property-seeded Deal Analyzer route) — never live RentCast, never an API
 * key. Cached independently of `getPropertyDataProvider`'s own instance.
 */
export function getMockPropertyDataProvider(): PropertyDataProvider {
  if (!cachedMockProvider) {
    cachedMockProvider = new MockFixtureAdapter();
  }
  return cachedMockProvider;
}
