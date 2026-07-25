import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_PROVIDER = process.env.PROPERTY_DATA_PROVIDER;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  if (ORIGINAL_PROVIDER === undefined) {
    delete process.env.PROPERTY_DATA_PROVIDER;
  } else {
    process.env.PROPERTY_DATA_PROVIDER = ORIGINAL_PROVIDER;
  }
});

describe("getPropertyDataProvider", () => {
  it("defaults to MockFixtureAdapter when PROPERTY_DATA_PROVIDER is unset", async () => {
    delete process.env.PROPERTY_DATA_PROVIDER;
    const { getPropertyDataProvider } = await import("@/lib/property-data");
    expect(getPropertyDataProvider().id).toBe("mock-fixture");
  });

  it("defaults to MockFixtureAdapter for any value other than the exact opt-in string", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "mock";
    const { getPropertyDataProvider } = await import("@/lib/property-data");
    expect(getPropertyDataProvider().id).toBe("mock-fixture");
  });

  it("uses RentCastAdapter only when explicitly set to 'rentcast'", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";
    const { getPropertyDataProvider } = await import("@/lib/property-data");
    expect(getPropertyDataProvider().id).toBe("rentcast");
  });

  it("caches the provider instance across calls", async () => {
    delete process.env.PROPERTY_DATA_PROVIDER;
    const { getPropertyDataProvider } = await import("@/lib/property-data");
    expect(getPropertyDataProvider()).toBe(getPropertyDataProvider());
  });
});
