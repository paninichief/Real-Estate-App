import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSearchByAddress = vi.fn();

vi.mock("@/lib/property-data", () => ({
  getPropertyDataProvider: () => ({
    id: "mock",
    searchByAddress: mockSearchByAddress,
    getById: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { searchPropertyByAddress, type AddressSearchState } from "@/lib/property-data/search-actions";

const initialState: AddressSearchState = {
  error: null,
  matches: null,
  noMatch: false,
  submittedAddress: null,
};

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

beforeEach(() => {
  mockSearchByAddress.mockReset();
});

describe("searchPropertyByAddress", () => {
  it("returns a validation error without calling the provider when the address is blank", async () => {
    const result = await searchPropertyByAddress(initialState, formData({ address: "  " }));
    expect(result.error).toMatch(/enter an address/i);
    expect(mockSearchByAddress).not.toHaveBeenCalled();
  });

  it("redirects to the property page on a single match", async () => {
    mockSearchByAddress.mockResolvedValue({
      status: "single_match",
      property: { id: "prop-maple-514" },
    });

    await expect(
      searchPropertyByAddress(initialState, formData({ address: "514 Maple Street" })),
    ).rejects.toThrow("REDIRECT:/property/prop-maple-514");
  });

  it("returns the match list without redirecting on multiple matches", async () => {
    const matches = [
      { propertyId: "prop-elm-il", formattedAddress: "22 Elm Court, Springfield, IL 62704" },
      { propertyId: "prop-elm-mo", formattedAddress: "22 Elm Court, Springfield, MO 65801" },
    ];
    mockSearchByAddress.mockResolvedValue({ status: "multiple_matches", matches });

    const result = await searchPropertyByAddress(initialState, formData({ address: "22 Elm Court" }));
    expect(result.matches).toEqual(matches);
    expect(result.noMatch).toBe(false);
  });

  it("returns noMatch: true when nothing is found", async () => {
    mockSearchByAddress.mockResolvedValue({ status: "no_match" });

    const result = await searchPropertyByAddress(initialState, formData({ address: "999 Nowhere Rd" }));
    expect(result.noMatch).toBe(true);
    expect(result.matches).toBeNull();
  });
});
