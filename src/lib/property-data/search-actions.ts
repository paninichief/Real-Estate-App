"use server";

import { redirect } from "next/navigation";
import { getPropertyDataProvider } from "@/lib/property-data";
import type { PropertySearchMatch } from "./provider";

export type AddressSearchState = {
  error: string | null;
  matches: PropertySearchMatch[] | null;
  noMatch: boolean;
  submittedAddress: string | null;
};

/**
 * Landing-page address search (spec sections 8.1, 11.2). Runs entirely
 * server-side so the active PropertyDataProvider — and, once it exists, the
 * RentCast API key — never reaches the browser. A single confident match
 * routes straight to the general property page; multiple matches or no
 * match are returned for inline rendering instead of a redirect.
 */
export async function searchPropertyByAddress(
  _prevState: AddressSearchState,
  formData: FormData,
): Promise<AddressSearchState> {
  const address = String(formData.get("address") ?? "").trim();

  if (!address) {
    return { error: "Enter an address to search.", matches: null, noMatch: false, submittedAddress: null };
  }

  const provider = getPropertyDataProvider();
  const result = await provider.searchByAddress({ address });

  if (result.status === "single_match") {
    redirect(`/property/${result.property.id}`);
  }

  if (result.status === "multiple_matches") {
    return { error: null, matches: result.matches, noMatch: false, submittedAddress: address };
  }

  return { error: null, matches: null, noMatch: true, submittedAddress: address };
}
