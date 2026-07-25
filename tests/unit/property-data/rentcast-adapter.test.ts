import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRentcastGet } = vi.hoisted(() => ({ mockRentcastGet: vi.fn() }));

vi.mock("@/lib/property-data/rentcast-client", () => ({
  rentcastGet: mockRentcastGet,
}));

import { RentCastAdapter } from "@/lib/property-data/rentcast-adapter";
import { RentCastError } from "@/lib/property-data/rentcast-errors";
import type { PropertyDataProvider } from "@/lib/property-data/provider";

const adapter: PropertyDataProvider = new RentCastAdapter();

beforeEach(() => {
  mockRentcastGet.mockReset();
});

describe("RentCastAdapter contract", () => {
  it("satisfies the PropertyDataProvider interface with a distinct id", () => {
    expect(adapter.id).toBe("rentcast");
    expect(typeof adapter.searchByAddress).toBe("function");
    expect(typeof adapter.getById).toBe("function");
  });
});

describe("RentCastAdapter.searchByAddress", () => {
  it("returns no_match without calling RentCast for a blank address", async () => {
    const result = await adapter.searchByAddress({ address: "   " });
    expect(result).toEqual({ status: "no_match" });
    expect(mockRentcastGet).not.toHaveBeenCalled();
  });

  it("resolves a single active listing in one call", async () => {
    mockRentcastGet.mockResolvedValueOnce({
      found: true,
      data: [{ id: "rc-1", formattedAddress: "1 Test St", status: "Active", price: 200_000, bedrooms: 3 }],
    });

    const result = await adapter.searchByAddress({ address: "1 Test St" });

    expect(mockRentcastGet).toHaveBeenCalledTimes(1);
    expect(mockRentcastGet).toHaveBeenCalledWith("/listings/sale", { address: "1 Test St" });
    expect(result.status).toBe("single_match");
    if (result.status === "single_match") {
      expect(result.property.id).toBe("rc-1");
      expect(result.property.price.value).toBe(200_000);
      expect(result.property.listingStatus.value).toBe("active");
    }
  });

  it("falls back to /properties when no listing is found, marking the property off-market", async () => {
    mockRentcastGet
      .mockResolvedValueOnce({ found: true, data: [] }) // /listings/sale
      .mockResolvedValueOnce({ found: true, data: [{ id: "rc-2", formattedAddress: "2 Test St" }] }); // /properties

    const result = await adapter.searchByAddress({ address: "2 Test St" });

    expect(mockRentcastGet).toHaveBeenCalledTimes(2);
    expect(mockRentcastGet).toHaveBeenNthCalledWith(2, "/properties", { address: "2 Test St" });
    expect(result.status).toBe("single_match");
    if (result.status === "single_match") {
      expect(result.property.listingStatus.value).toBe("off_market");
      expect(result.property.price.value).toBeNull();
    }
  });

  it("returns no_match when neither listings nor properties find anything", async () => {
    mockRentcastGet
      .mockResolvedValueOnce({ found: true, data: [] })
      .mockResolvedValueOnce({ found: true, data: [] });

    const result = await adapter.searchByAddress({ address: "999 Nowhere Rd" });
    expect(result).toEqual({ status: "no_match" });
  });

  it("returns no_match when RentCast reports 400/404 (found:false) at both steps", async () => {
    mockRentcastGet.mockResolvedValueOnce({ found: false }).mockResolvedValueOnce({ found: false });
    const result = await adapter.searchByAddress({ address: "bad address" });
    expect(result).toEqual({ status: "no_match" });
  });

  it("returns multiple_matches when several listings match", async () => {
    mockRentcastGet.mockResolvedValueOnce({
      found: true,
      data: [
        { id: "rc-a", formattedAddress: "22 Elm Ct, Springfield, IL" },
        { id: "rc-b", formattedAddress: "22 Elm Ct, Springfield, MO" },
      ],
    });

    const result = await adapter.searchByAddress({ address: "22 Elm Ct" });
    expect(result.status).toBe("multiple_matches");
    if (result.status === "multiple_matches") {
      expect(result.matches).toHaveLength(2);
    }
  });

  it("propagates a RentCastError instead of masking it as no_match", async () => {
    mockRentcastGet.mockRejectedValueOnce(new RentCastError("rate_limited", "too many requests"));

    await expect(adapter.searchByAddress({ address: "1 Test St" })).rejects.toMatchObject({
      kind: "rate_limited",
    });
  });
});

describe("RentCastAdapter.getById", () => {
  it("returns null when the property record isn't found", async () => {
    mockRentcastGet.mockResolvedValueOnce({ found: false });
    const result = await adapter.getById("rc-missing");
    expect(result).toBeNull();
    expect(mockRentcastGet).toHaveBeenCalledTimes(1);
    expect(mockRentcastGet).toHaveBeenCalledWith("/properties/rc-missing", {});
  });

  it("combines the property record with its listing when both exist", async () => {
    mockRentcastGet
      .mockResolvedValueOnce({ found: true, data: { id: "rc-1", bedrooms: 4, yearBuilt: 1975 } })
      .mockResolvedValueOnce({ found: true, data: { id: "rc-1", status: "Active", price: 250_000 } });

    const property = await adapter.getById("rc-1");

    expect(mockRentcastGet).toHaveBeenNthCalledWith(2, "/listings/sale/rc-1", {});
    expect(property?.bedrooms.value).toBe(4);
    expect(property?.price.value).toBe(250_000);
    expect(property?.listingStatus.value).toBe("active");
  });

  it("treats a not-found listing as off-market rather than an error", async () => {
    mockRentcastGet
      .mockResolvedValueOnce({ found: true, data: { id: "rc-1", bedrooms: 2 } })
      .mockResolvedValueOnce({ found: false });

    const property = await adapter.getById("rc-1");
    expect(property?.listingStatus.value).toBe("off_market");
    expect(property?.price.value).toBeNull();
  });

  it("propagates a RentCastError from the property lookup", async () => {
    mockRentcastGet.mockRejectedValueOnce(new RentCastError("server_error", "boom"));
    await expect(adapter.getById("rc-1")).rejects.toMatchObject({ kind: "server_error" });
  });

  it("propagates a RentCastError from the listing lookup", async () => {
    mockRentcastGet
      .mockResolvedValueOnce({ found: true, data: { id: "rc-1" } })
      .mockRejectedValueOnce(new RentCastError("timeout", "boom"));
    await expect(adapter.getById("rc-1")).rejects.toMatchObject({ kind: "timeout" });
  });
});
