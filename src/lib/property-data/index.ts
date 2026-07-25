import { MockFixtureAdapter } from "./mock-fixture-adapter";
import { RentCastAdapter } from "./rentcast-adapter";
import type { PropertyDataProvider } from "./provider";

let cachedProvider: PropertyDataProvider | null = null;

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
