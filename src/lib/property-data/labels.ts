import type {
  FactStatus,
  ListingStatus,
  PropertyDataSourceId,
  PropertyType,
} from "@/types/property";

const SOURCE_LABELS: Record<PropertyDataSourceId, string> = {
  rentcast: "RentCast",
  realtor: "Realtor.com",
  zillow: "Zillow",
  redfin: "Redfin",
  manual_entry: "Manual entry",
  mock: "Mock fixture",
};

export function sourceLabel(source: PropertyDataSourceId | null): string {
  if (!source) return "Unknown source";
  return SOURCE_LABELS[source] ?? source;
}

export const FACT_STATUS_LABELS: Record<FactStatus, string> = {
  confirmed: "Confirmed",
  reported: "Reported",
  estimated: "Estimated",
  unverified: "Unverified",
  low_confidence: "Low confidence",
  insufficient_data: "Insufficient data",
  not_available: "Not available",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_family: "Single-family",
  condo: "Condominium",
  townhouse: "Townhouse",
  duplex: "Duplex",
  triplex: "Triplex",
  fourplex: "Fourplex",
  unknown: "Unknown",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: "Active listing",
  off_market: "Off-market",
  unknown: "Unknown",
};
