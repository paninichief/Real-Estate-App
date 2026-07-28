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

describe("getMockPropertyDataProvider (Codex finding 2)", () => {
  it("always returns MockFixtureAdapter, even when PROPERTY_DATA_PROVIDER is explicitly 'rentcast'", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";
    const { getMockPropertyDataProvider } = await import("@/lib/property-data");
    expect(getMockPropertyDataProvider().id).toBe("mock-fixture");
  });

  it("returns MockFixtureAdapter when PROPERTY_DATA_PROVIDER is unset too", async () => {
    delete process.env.PROPERTY_DATA_PROVIDER;
    const { getMockPropertyDataProvider } = await import("@/lib/property-data");
    expect(getMockPropertyDataProvider().id).toBe("mock-fixture");
  });

  it("returns real mock fixture data regardless of the configured provider", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";
    const { getMockPropertyDataProvider } = await import("@/lib/property-data");
    const property = await getMockPropertyDataProvider().getById("prop-maple-514");
    expect(property?.address.value?.formatted).toBe("514 Maple Street, Detroit, MI 48214");
  });

  it("does not share a cached instance with getPropertyDataProvider — selecting rentcast for the general provider never leaks into the mock-only accessor", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";
    const { getPropertyDataProvider, getMockPropertyDataProvider } = await import("@/lib/property-data");
    expect(getPropertyDataProvider().id).toBe("rentcast");
    expect(getMockPropertyDataProvider().id).toBe("mock-fixture");
  });

  it("caches its own instance across calls, independent of getPropertyDataProvider's cache", async () => {
    delete process.env.PROPERTY_DATA_PROVIDER;
    const { getMockPropertyDataProvider } = await import("@/lib/property-data");
    expect(getMockPropertyDataProvider()).toBe(getMockPropertyDataProvider());
  });
});
