import type {
  ConflictResolutionRule,
  FactProvenance,
  PropertyDataSourceId,
  PropertyFact,
  SourceValue,
} from "@/types/property";
import { sourceLabel } from "./labels";

/** Spec section 10.2: "If all available sources conflict, priority is
 * Realtor.com, then Zillow, then Redfin." */
const PRIORITY_ORDER: PropertyDataSourceId[] = ["realtor", "zillow", "redfin"];

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function canonicalKey(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function pickByPriority<T>(values: SourceValue<T>[]): SourceValue<T> | undefined {
  for (const sourceId of PRIORITY_ORDER) {
    const match = values.find((v) => v.source === sourceId);
    if (match) return match;
  }
  return undefined;
}

function buildProvenance<T>(
  winner: SourceValue<T>,
  rule: ConflictResolutionRule,
  explanation: string,
): FactProvenance {
  return {
    status: winner.status ?? "reported",
    source: winner.source,
    retrievedAt: winner.retrievedAt,
    confidence: winner.confidence ?? null,
    selectionRule: rule,
    selectionExplanation: explanation,
  };
}

/**
 * Resolves possibly-conflicting per-source values for one property fact into
 * a single normalized value, per spec section 10.2:
 *   1. A value reported by a strict majority of sources wins.
 *   2. Otherwise, priority fallback applies: Realtor.com, then Zillow, then
 *      Redfin (this also covers "Realtor.com unavailable, Zillow vs. Redfin
 *      conflict — use Zillow").
 * Every source value is preserved in the result regardless of which one was
 * selected, and the selection is always explained in plain language.
 */
export function resolveSourceValues<T>(values: SourceValue<T>[]): PropertyFact<T> {
  if (values.length === 0) {
    return {
      value: null,
      sourceValues: [],
      provenance: {
        status: "not_available",
        source: null,
        retrievedAt: null,
        confidence: null,
        selectionRule: "no_data",
        selectionExplanation: "No source reported a value for this fact.",
      },
    };
  }

  if (values.length === 1) {
    const only = values[0];
    return {
      value: only.value,
      sourceValues: values,
      provenance: buildProvenance(
        only,
        "single_source",
        `${sourceLabel(only.source)} was the only source reporting this value.`,
      ),
    };
  }

  const groups = new Map<string, SourceValue<T>[]>();
  for (const sourceValue of values) {
    const key = canonicalKey(sourceValue.value);
    const group = groups.get(key) ?? [];
    group.push(sourceValue);
    groups.set(key, group);
  }

  const majorityThreshold = values.length / 2;
  const majorityGroup = [...groups.values()].find(
    (group) => group.length > majorityThreshold && group.length > 1,
  );

  if (majorityGroup) {
    const winner = pickByPriority(majorityGroup) ?? majorityGroup[0];
    const agreeingSources = majorityGroup.map((sv) => sourceLabel(sv.source)).join(", ");
    return {
      value: winner.value,
      sourceValues: values,
      provenance: buildProvenance(
        winner,
        "majority",
        `${majorityGroup.length} of ${values.length} sources agreed on this value (${agreeingSources}).`,
      ),
    };
  }

  const prioritized = pickByPriority(values) ?? values[0];
  return {
    value: prioritized.value,
    sourceValues: values,
    provenance: buildProvenance(
      prioritized,
      "priority_fallback",
      `Sources disagreed; ${sourceLabel(prioritized.source)} was used based on the standard priority order (Realtor.com, then Zillow, then Redfin).`,
    ),
  };
}
