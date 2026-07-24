import { MockFixtureAdapter } from "./mock-fixture-adapter";
import type { PropertyDataProvider } from "./provider";

let cachedProvider: PropertyDataProvider | null = null;

/**
 * Returns the active PropertyDataProvider. The mock fixture adapter is the
 * only implementation wired up so far (Configuration A) — a RentCastAdapter
 * plugs in here once it's built, with no caller needing to change.
 */
export function getPropertyDataProvider(): PropertyDataProvider {
  if (!cachedProvider) {
    cachedProvider = new MockFixtureAdapter();
  }
  return cachedProvider;
}
