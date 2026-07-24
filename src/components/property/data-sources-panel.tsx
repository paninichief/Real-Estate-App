"use client";

import { useState } from "react";
import type { FactStatus, PropertyDataSourceId } from "@/types/property";
import { FACT_STATUS_LABELS, sourceLabel } from "@/lib/property-data/labels";

export interface DataSourceRowSourceValue {
  source: PropertyDataSourceId;
  displayValue: string;
}

/**
 * Plain, serializable row shape — every value is a pre-formatted string
 * built server-side (see buildDataSourceRow), never a function. This panel
 * is a Client Component, and functions cannot be passed across the
 * Server/Client Component boundary as props.
 */
export interface DataSourceRow {
  key: string;
  label: string;
  displayValue: string;
  status: FactStatus;
  source: PropertyDataSourceId | null;
  retrievedAt: string | null;
  selectionExplanation: string;
  sourceValues: DataSourceRowSourceValue[];
}

/**
 * Basic "View Data Sources" panel (spec section 10.28): for each fact,
 * shows the selected value, its status, which source it came from, when it
 * was retrieved, why it was selected, and — when sources disagreed — every
 * other value that was reported.
 */
export function DataSourcesPanel({ rows }: { rows: DataSourceRow[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="data-sources-heading"
      className="rounded-lg border border-border-subtle"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-900 dark:text-white"
      >
        <span id="data-sources-heading">View Data Sources</span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-border-subtle px-4 py-3">
          <ul className="divide-y divide-border-subtle">
            {rows.map((row) => {
              const hasOtherSources = row.sourceValues.length > 1;
              const rowExpanded = expandedRow === row.key;

              return (
                <li key={row.key} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-sm font-medium text-ink-900 dark:text-white">
                      {row.label}
                    </span>
                    <span className="tabular-nums text-sm text-ink-600 dark:text-ink-400">
                      {row.displayValue}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                    <span className="rounded-full border border-border-subtle px-2 py-0.5">
                      {FACT_STATUS_LABELS[row.status]}
                    </span>
                    {row.source && <span>Source: {sourceLabel(row.source)}</span>}
                    {row.retrievedAt && (
                      <span>Updated {new Date(row.retrievedAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-ink-400">{row.selectionExplanation}</p>

                  {hasOtherSources && (
                    <button
                      type="button"
                      onClick={() => setExpandedRow(rowExpanded ? null : row.key)}
                      aria-expanded={rowExpanded}
                      className="mt-1 text-xs font-medium text-navy-900 underline dark:text-gold-400"
                    >
                      {rowExpanded ? "Hide other sources" : "View Other Sources"}
                    </button>
                  )}

                  {hasOtherSources && rowExpanded && (
                    <ul className="mt-2 space-y-1 rounded-md bg-surface-muted p-2 text-xs text-ink-600 dark:text-ink-400">
                      {row.sourceValues.map((sv, index) => (
                        <li key={index} className="flex justify-between gap-2">
                          <span>{sourceLabel(sv.source)}</span>
                          <span className="tabular-nums">{sv.displayValue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
