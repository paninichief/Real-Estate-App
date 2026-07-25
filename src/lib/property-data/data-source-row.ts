import type { PropertyFact } from "@/types/property";
import type { DataSourceRow } from "@/components/property/data-sources-panel";

/**
 * Builds a plain, serializable DataSourceRow from a PropertyFact — runs
 * server-side (e.g. in the property page) so the resulting props passed to
 * the client-side DataSourcesPanel are strings, never formatter functions.
 */
export function buildDataSourceRow<T>(
  key: string,
  label: string,
  fact: PropertyFact<T>,
  formatValue?: (value: T) => string,
): DataSourceRow {
  const format = (value: T | null): string => {
    if (value === null || value === undefined) return "Not available";
    return formatValue ? formatValue(value) : String(value);
  };

  return {
    key,
    label,
    displayValue: format(fact.value),
    status: fact.provenance.status,
    source: fact.provenance.source,
    retrievedAt: fact.provenance.retrievedAt,
    selectionExplanation: fact.provenance.selectionExplanation,
    sourceValues: fact.sourceValues.map((sv) => ({
      source: sv.source,
      displayValue: format(sv.value),
    })),
  };
}
