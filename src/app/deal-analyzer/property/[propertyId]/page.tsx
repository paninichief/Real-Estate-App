import { notFound } from "next/navigation";
import { getMockPropertyDataProvider } from "@/lib/property-data";
import { propertyToManualDealSeed } from "@/lib/deal-analyzer/property-to-manual-deal";
import { ManualDealEntryForm } from "@/components/deal-analyzer/manual-deal-entry-form";

/**
 * Deal Analyzer, seeded from a DealFactor property. Explicitly mock-only
 * (Codex finding 2): resolves the property through
 * `getMockPropertyDataProvider()`, never the environment-selected general
 * provider, so this route can never make a live RentCast call or require an
 * API key regardless of `PROPERTY_DATA_PROVIDER`. Pre-fills whatever facts
 * the property-data layer actually has (address, purchase price, bedrooms,
 * bathrooms, square footage); rent, financing, and expenses have no such
 * source and always start blank, exactly as in manual-only entry.
 */
export default async function DealAnalyzerPropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const property = await getMockPropertyDataProvider().getById(propertyId);

  if (!property) {
    notFound();
  }

  const seed = propertyToManualDealSeed(property);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-white">Analyze this deal</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
        {property.address.value?.formatted ?? "Address not available"}
      </p>
      <p className="mt-4 text-base text-ink-600 dark:text-ink-400">
        Facts DealFactor already has are pre-filled below and marked From property data. Nothing
        here is saved — enter the remaining details (rent, financing, expenses) to see the same
        tested Financial Calculation Engine used everywhere else on DealFactor.
      </p>
      <ManualDealEntryForm seed={seed} />
    </div>
  );
}
