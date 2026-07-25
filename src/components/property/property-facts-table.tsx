import type { NormalizedProperty } from "@/types/property";
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/property-data/labels";

const NOT_AVAILABLE = "Not available";

/** Core property facts (spec section 8.5). Never invents a value — every
 * missing fact displays "Not available" rather than being silently omitted. */
export function PropertyFactsTable({ property }: { property: NormalizedProperty }) {
  const rows: { label: string; value: string }[] = [
    {
      label: "Price",
      value: property.price.value != null ? `$${property.price.value.toLocaleString()}` : NOT_AVAILABLE,
    },
    {
      label: "Listing status",
      value: property.listingStatus.value
        ? LISTING_STATUS_LABELS[property.listingStatus.value]
        : NOT_AVAILABLE,
    },
    {
      label: "Property type",
      value: property.propertyType.value
        ? PROPERTY_TYPE_LABELS[property.propertyType.value]
        : NOT_AVAILABLE,
    },
    {
      label: "Bedrooms",
      value: property.bedrooms.value != null ? String(property.bedrooms.value) : NOT_AVAILABLE,
    },
    {
      label: "Bathrooms",
      value: property.bathrooms.value != null ? String(property.bathrooms.value) : NOT_AVAILABLE,
    },
    {
      label: "Square footage",
      value:
        property.squareFootage.value != null
          ? `${property.squareFootage.value.toLocaleString()} sqft`
          : NOT_AVAILABLE,
    },
    {
      label: "Lot size",
      value:
        property.lotSizeSqft.value != null
          ? `${property.lotSizeSqft.value.toLocaleString()} sqft`
          : NOT_AVAILABLE,
    },
    {
      label: "Year built",
      value: property.yearBuilt.value != null ? String(property.yearBuilt.value) : NOT_AVAILABLE,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums text-navy-900 dark:text-white">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
