import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPropertyDataProvider } from "@/lib/property-data";
import { PropertyPhotoGallerySection } from "@/components/property/property-photo-gallery-section";
import { PhotoLoadingSkeleton } from "@/components/property/photo-loading-skeleton";
import { PropertyFactsTable } from "@/components/property/property-facts-table";
import { DataSourcesPanel, type DataSourceRow } from "@/components/property/data-sources-panel";
import { buildDataSourceRow } from "@/lib/property-data/data-source-row";
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/property-data/labels";

/**
 * General property page (spec section 8.5, basic version). Investor/Home
 * Buyer/Section 8 analysis, comps, and environmental risk land in later
 * milestones — this establishes facts, photos, and source transparency.
 */
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getPropertyDataProvider().getById(propertyId);

  if (!property) {
    notFound();
  }

  const dataSourceRows: DataSourceRow[] = [
    buildDataSourceRow("price", "Price", property.price, (v) => `$${v.toLocaleString()}`),
    buildDataSourceRow(
      "listingStatus",
      "Listing status",
      property.listingStatus,
      (v) => LISTING_STATUS_LABELS[v],
    ),
    buildDataSourceRow(
      "propertyType",
      "Property type",
      property.propertyType,
      (v) => PROPERTY_TYPE_LABELS[v],
    ),
    buildDataSourceRow("bedrooms", "Bedrooms", property.bedrooms),
    buildDataSourceRow("bathrooms", "Bathrooms", property.bathrooms),
    buildDataSourceRow(
      "squareFootage",
      "Square footage",
      property.squareFootage,
      (v) => `${v.toLocaleString()} sqft`,
    ),
    buildDataSourceRow(
      "lotSizeSqft",
      "Lot size",
      property.lotSizeSqft,
      (v) => `${v.toLocaleString()} sqft`,
    ),
    buildDataSourceRow("yearBuilt", "Year built", property.yearBuilt),
  ];

  const isOffMarket = property.listingStatus.value === "off_market";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {isOffMarket && (
        <div
          role="status"
          className="mb-6 rounded-md border border-gold-500 bg-surface-muted px-4 py-3 text-sm font-medium text-navy-900 dark:text-white"
        >
          Off-market property — not currently listed for sale. Facts below reflect the most
          recently available information.
        </div>
      )}

      <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-white">
        {property.address.value?.formatted ?? "Address not available"}
      </h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
        Last updated {new Date(property.lastUpdatedAt).toLocaleString()}
      </p>

      <div className="mt-6">
        <Suspense
          fallback={
            <PhotoLoadingSkeleton className="aspect-video w-full rounded-lg border border-border-subtle" />
          }
        >
          <PropertyPhotoGallerySection propertyId={property.id} />
        </Suspense>
      </div>

      <div className="mt-8">
        <PropertyFactsTable property={property} />
      </div>

      <div className="mt-8">
        <DataSourcesPanel rows={dataSourceRows} />
      </div>
    </div>
  );
}
