"use client";

import { useState } from "react";
import type {
  ManualDealCalculationResults,
  ManualDealFormValues,
  ManualDealMetricResult,
  FieldProvenance,
} from "@/lib/deal-analyzer/manual-deal-types";
import { formatCurrency, formatPercent } from "@/lib/deal-analyzer/format";
import { formatPercentInput, type DownPaymentMode } from "@/lib/deal-analyzer/down-payment-input";

const NOT_PROVIDED = "Not provided";
const INFORMATIONAL_NOTE = "Not included in these calculations.";
const BLANK_OPTIONAL_FIELDS_NOTICE =
  "Calculations use only the expenses and financing details you provided. Blank optional expense fields are treated as $0. Missing financing fields may prevent financing-dependent results from being calculated.";

const PROVENANCE_LABELS: Record<FieldProvenance, string> = {
  user_input: "User input",
  from_property_data: "From property data",
  from_property_data_edited: "From property data (edited)",
};

interface EntryRow {
  key: keyof ManualDealFormValues;
  label: string;
  format: (value: never) => string;
  informational?: boolean;
}

const PROPERTY_SUMMARY_ENTRY_ROWS: EntryRow[] = [
  { key: "address", label: "Address", format: (v: string) => v },
  { key: "purchasePrice", label: "Purchase price", format: (v: number) => formatCurrency(v) },
  { key: "bedrooms", label: "Bedrooms", format: (v: number) => String(v) },
  { key: "bathrooms", label: "Bathrooms", format: (v: number) => String(v) },
  { key: "squareFootage", label: "Square footage", format: (v: number) => `${v.toLocaleString()} sqft` },
];

// Informational only — never fed into any calculation, but shown alongside
// the rest of the property's facts since that's where they conceptually belong.
const PROPERTY_SUMMARY_INFO_ROWS: EntryRow[] = [
  { key: "numberOfUnits", label: "Number of units", format: (v: number) => String(v), informational: true },
  {
    key: "renovationCosts",
    label: "Renovation costs",
    format: (v: number) => formatCurrency(v),
    informational: true,
  },
  { key: "occupancy", label: "Occupancy", format: (v: string) => v, informational: true },
  { key: "section8Status", label: "Section 8 status", format: (v: string) => v, informational: true },
  { key: "propertyCondition", label: "Property condition", format: (v: string) => v, informational: true },
];

// Down payment is rendered separately (see the Financing section below) since
// its display depends on which input mode produced it.
const FINANCING_ENTRY_ROWS: EntryRow[] = [
  { key: "interestRatePercent", label: "Interest rate", format: (v: number) => `${v}%` },
  { key: "loanTermYears", label: "Loan term", format: (v: number) => `${v} years` },
];

const INCOME_EXPENSE_ENTRY_ROWS: EntryRow[] = [
  { key: "monthlyRent", label: "Monthly rent", format: (v: number) => formatCurrency(v) },
  { key: "propertyTaxes", label: "Property taxes", format: (v: number) => formatCurrency(v) },
  { key: "insurance", label: "Insurance", format: (v: number) => formatCurrency(v) },
  { key: "propertyManagement", label: "Property management", format: (v: number) => formatCurrency(v) },
  { key: "maintenanceReserve", label: "Maintenance reserve", format: (v: number) => formatCurrency(v) },
  { key: "hoa", label: "HOA", format: (v: number) => formatCurrency(v) },
  { key: "vacancyReserve", label: "Monthly vacancy reserve", format: (v: number) => formatCurrency(v) },
  { key: "utilities", label: "Utilities", format: (v: number) => formatCurrency(v) },
];

interface MetricRow {
  key: keyof ManualDealCalculationResults;
  label: string;
  format: (value: number) => string;
}

const PROPERTY_SUMMARY_METRIC_ROWS: MetricRow[] = [
  { key: "pricePerSquareFoot", label: "Price per square foot", format: formatCurrency },
];

const FINANCING_METRIC_ROWS: MetricRow[] = [
  { key: "loanAmount", label: "Loan amount", format: formatCurrency },
  { key: "monthlyMortgagePayment", label: "Monthly mortgage payment", format: formatCurrency },
];

const INCOME_EXPENSE_METRIC_ROWS: MetricRow[] = [
  { key: "annualRentalIncome", label: "Annual rental income", format: formatCurrency },
  { key: "totalMonthlyOperatingExpenses", label: "Total monthly operating expenses", format: formatCurrency },
  { key: "totalAnnualOperatingExpenses", label: "Total annual operating expenses", format: formatCurrency },
];

const NOI_CAP_RATE_METRIC_ROWS: MetricRow[] = [
  { key: "monthlyNOI", label: "Monthly NOI", format: formatCurrency },
  { key: "annualNOI", label: "Annual NOI", format: formatCurrency },
  { key: "capRate", label: "Cap rate", format: formatPercent },
];

const CASH_FLOW_METRIC_ROWS: MetricRow[] = [
  { key: "monthlyCashFlow", label: "Monthly cash flow", format: formatCurrency },
  { key: "annualCashFlow", label: "Annual cash flow", format: formatCurrency },
];

const CASH_ON_CASH_METRIC_ROWS: MetricRow[] = [
  { key: "cashOnCashReturn", label: "Cash-on-cash return", format: formatPercent },
];

const ALL_METRIC_ROWS: MetricRow[] = [
  ...PROPERTY_SUMMARY_METRIC_ROWS,
  ...FINANCING_METRIC_ROWS,
  ...INCOME_EXPENSE_METRIC_ROWS,
  ...NOI_CAP_RATE_METRIC_ROWS,
  ...CASH_FLOW_METRIC_ROWS,
  ...CASH_ON_CASH_METRIC_ROWS,
];

/** Plain-language, factual definitions only — never AI-generated, never a stand-in for the numbers above. */
const METRIC_EXPLANATIONS: Record<keyof ManualDealCalculationResults, string> = {
  pricePerSquareFoot:
    "Purchase price divided by square footage — a quick way to compare properties of different sizes.",
  annualRentalIncome: "Monthly rent multiplied by 12.",
  loanAmount: "Purchase price minus down payment — the amount financed by the mortgage.",
  monthlyMortgagePayment:
    "The estimated monthly principal-and-interest payment for the loan amount, interest rate, and loan term entered.",
  totalMonthlyOperatingExpenses:
    "The sum of every monthly operating expense entered (property taxes, insurance, management, maintenance, HOA, vacancy reserve, and utilities), treating any blank expense as $0.",
  totalAnnualOperatingExpenses: "Total monthly operating expenses multiplied by 12.",
  monthlyNOI: "Monthly rent minus total monthly operating expenses, before any mortgage payment.",
  annualNOI: "Monthly NOI multiplied by 12.",
  monthlyCashFlow: "Monthly NOI minus the monthly mortgage payment — what's left over each month after financing.",
  annualCashFlow: "Monthly cash flow multiplied by 12.",
  capRate: "Annual NOI divided by purchase price — a measure of return independent of financing.",
  cashOnCashReturn:
    "Annual cash flow divided by the down payment — a measure of return on the cash actually invested.",
};

function MetricValue({ result, format }: { result: ManualDealMetricResult; format: (value: number) => string }) {
  if (result.status === "calculated") {
    return <span className="font-semibold tabular-nums text-navy-900 dark:text-white">{format(result.value)}</span>;
  }
  if (result.status === "not_calculated") {
    const parts: string[] = [];
    if (result.missingFields.length > 0) {
      parts.push(`Missing: ${result.missingFields.join(", ")}`);
    }
    if (result.invalidFields.length > 0) {
      parts.push(`Invalid: ${result.invalidFields.join(", ")}`);
    }
    return (
      <span className="text-sm text-ink-600 dark:text-ink-400">Not calculated — {parts.join(". ")}</span>
    );
  }
  return <span className="text-sm text-ink-600 dark:text-ink-400">{result.reason}</span>;
}

function EntryValue({ value, tag }: { value: string | null; tag: string }) {
  if (value === null) {
    return <span className="text-ink-400">{NOT_PROVIDED}</span>;
  }
  return (
    <>
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="rounded-full border border-border-subtle px-2 py-0.5 text-xs font-medium text-ink-400">
        {tag}
      </span>
    </>
  );
}

/**
 * Unions every metric's missing/invalid raw-field names into one
 * deduplicated pair of lists, so a field that blocks several metrics at
 * once (e.g. a missing down payment blocking both loan amount and
 * cash-on-cash return) is only ever named once.
 */
function collectMissingAndInvalid(results: ManualDealCalculationResults): { missing: string[]; invalid: string[] } {
  const missing = new Set<string>();
  const invalid = new Set<string>();
  for (const key of Object.keys(results) as (keyof ManualDealCalculationResults)[]) {
    const result = results[key];
    if (result.status === "not_calculated") {
      result.missingFields.forEach((field) => missing.add(field));
      result.invalidFields.forEach((field) => invalid.add(field));
    }
  }
  return { missing: Array.from(missing), invalid: Array.from(invalid) };
}

/**
 * Displays a manual deal entry alongside its FinancialEngine-derived
 * results, organized into named sections (property summary, financing,
 * income and expenses, NOI and cap rate, cash flow, cash-on-cash return,
 * missing/invalid inputs, and metric explanations). Entered values are
 * labeled by their true provenance (spec: honesty about where a value came
 * from); blank optional fields show "Not provided" rather than a fabricated
 * default. Number of units, Renovation costs, Occupancy, Section 8 status,
 * and Property condition are captured but explicitly marked as excluded
 * from the calculations, since no approved formula exists for them yet.
 */
export function ManualDealResults({
  values,
  results,
  downPaymentMode = "amount",
  downPaymentSource = "amount",
  downPaymentPercent = null,
  downPaymentPercentInvalid = false,
  fieldProvenance,
}: {
  values: ManualDealFormValues;
  results: ManualDealCalculationResults;
  /** Which input is currently displayed — controls whether one or two down-payment rows render. */
  downPaymentMode?: DownPaymentMode;
  /**
   * Which input the user actually typed into — controls provenance tags
   * ("User input" vs "Calculated from user input"), independent of which
   * mode is merely being *viewed*. Switching `downPaymentMode` alone must
   * never change these tags.
   */
  downPaymentSource?: DownPaymentMode;
  downPaymentPercent?: number | null;
  /**
   * True while the active percentage fails validation. While true, the
   * calculated dollar amount is hidden (shown as "Not provided") rather
   * than displaying a stale, no-longer-current figure as if it were a
   * fresh calculated result.
   */
  downPaymentPercentInvalid?: boolean;
  /**
   * Per-field provenance for a property-seeded deal — a field seeded from
   * the property-data layer reads "From property data" until edited, then
   * "From property data (edited)" (never reverting to plain "User input",
   * so the original source is never hidden). Fields absent from this map
   * default to "User input", matching manual-only entry.
   */
  fieldProvenance?: Partial<Record<keyof ManualDealFormValues, FieldProvenance>>;
}) {
  const dollarAmountForDisplay =
    downPaymentSource === "percent" && downPaymentPercentInvalid ? null : values.downPayment;
  const downPaymentTag = downPaymentSource === "amount" ? "User input" : "Calculated from user input";
  const downPaymentPercentTag = downPaymentSource === "percent" ? "User input" : "Calculated from user input";
  // The heading must never contradict the tag: whichever field is the true
  // source gets the plain heading; the derived one is explicitly marked
  // "(calculated)" in its own heading, not just its tag.
  const downPaymentHeading = downPaymentSource === "amount" ? "Down payment" : "Down payment (calculated)";
  const downPaymentPercentHeading =
    downPaymentSource === "percent" ? "Down payment percentage" : "Down payment percentage (calculated)";

  const { missing, invalid } = collectMissingAndInvalid(results);
  const hasMissingOrInvalid = missing.length > 0 || invalid.length > 0;
  const [explanationsOpen, setExplanationsOpen] = useState(false);

  function renderEntryRow(row: EntryRow) {
    const value = values[row.key];
    const provenance = fieldProvenance?.[row.key] ?? "user_input";
    return (
      <div key={row.key}>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
        <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
          <EntryValue
            value={value !== null ? (row.format as (value: unknown) => string)(value) : null}
            tag={PROVENANCE_LABELS[provenance]}
          />
        </dd>
        {row.informational && <p className="mt-1 text-xs text-ink-400">{INFORMATIONAL_NOTE}</p>}
      </div>
    );
  }

  function renderMetricRow(row: MetricRow) {
    return (
      <div key={row.key}>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
        <dd className="mt-1">
          <MetricValue result={results[row.key]} format={row.format} />
        </dd>
      </div>
    );
  }

  function renderMissingInvalidLists() {
    if (!hasMissingOrInvalid) {
      return (
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-400">
          Every input needed for these calculations is present and valid.
        </p>
      );
    }
    return (
      <div className="mt-2 flex flex-col gap-1 text-sm text-navy-900 dark:text-white">
        {missing.length > 0 && <p>Missing: {missing.join(", ")}</p>}
        {invalid.length > 0 && <p>Invalid: {invalid.join(", ")}</p>}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {hasMissingOrInvalid && (
        <div
          role="status"
          aria-label="Missing or invalid inputs summary"
          className="rounded-md border border-gold-500 bg-surface-muted px-4 py-3"
        >
          <p className="text-sm font-semibold text-navy-900 dark:text-white">
            Some results below are Not calculated because of missing or invalid inputs.
          </p>
          {missing.length > 0 && (
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">Missing: {missing.join(", ")}</p>
          )}
          {invalid.length > 0 && (
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">Invalid: {invalid.join(", ")}</p>
          )}
        </div>
      )}

      <p className="text-xs text-ink-400">{BLANK_OPTIONAL_FIELDS_NOTICE}</p>

      <section aria-label="Property summary">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Property summary</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {PROPERTY_SUMMARY_ENTRY_ROWS.map(renderEntryRow)}
          {PROPERTY_SUMMARY_METRIC_ROWS.map(renderMetricRow)}
          {PROPERTY_SUMMARY_INFO_ROWS.map(renderEntryRow)}
        </dl>
      </section>

      <section aria-label="Financing">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Financing</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {downPaymentMode === "percent" ? (
            <>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  {downPaymentPercentHeading}
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                  <EntryValue
                    value={downPaymentPercent !== null ? `${formatPercentInput(downPaymentPercent)}%` : null}
                    tag={downPaymentPercentTag}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{downPaymentHeading}</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                  <EntryValue
                    value={dollarAmountForDisplay !== null ? formatCurrency(dollarAmountForDisplay) : null}
                    tag={downPaymentTag}
                  />
                </dd>
              </div>
            </>
          ) : (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{downPaymentHeading}</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                <EntryValue
                  value={dollarAmountForDisplay !== null ? formatCurrency(dollarAmountForDisplay) : null}
                  tag={downPaymentTag}
                />
              </dd>
            </div>
          )}
          {FINANCING_ENTRY_ROWS.map(renderEntryRow)}
          {FINANCING_METRIC_ROWS.map(renderMetricRow)}
        </dl>
      </section>

      <section aria-label="Income and expenses">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Income and expenses</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {INCOME_EXPENSE_ENTRY_ROWS.map(renderEntryRow)}
          {INCOME_EXPENSE_METRIC_ROWS.map(renderMetricRow)}
        </dl>
      </section>

      <section aria-label="NOI and cap rate">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">NOI and cap rate</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {NOI_CAP_RATE_METRIC_ROWS.map(renderMetricRow)}
        </dl>
      </section>

      <section aria-label="Cash flow">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Cash flow</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {CASH_FLOW_METRIC_ROWS.map(renderMetricRow)}
        </dl>
      </section>

      <section aria-label="Cash-on-cash return">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Cash-on-cash return</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {CASH_ON_CASH_METRIC_ROWS.map(renderMetricRow)}
        </dl>
      </section>

      <section aria-label="Missing or invalid inputs">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
          Missing or invalid inputs
        </h2>
        {renderMissingInvalidLists()}
      </section>

      <section aria-label="Metric explanations">
        <details open={explanationsOpen}>
          <summary
            onClick={(event) => {
              // Handled entirely via state rather than the native toggle
              // behavior, so the disclosure's open/closed state is never out
              // of sync with which content is actually rendered.
              event.preventDefault();
              setExplanationsOpen((open) => !open);
            }}
            className="cursor-pointer font-display text-lg font-semibold text-navy-900 dark:text-white"
          >
            Metric explanations
          </summary>
          {explanationsOpen && (
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {ALL_METRIC_ROWS.map((row) => (
                <div key={row.key}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
                  <dd className="mt-1 text-sm text-ink-600 dark:text-ink-400">{METRIC_EXPLANATIONS[row.key]}</dd>
                </div>
              ))}
            </dl>
          )}
        </details>
      </section>
    </div>
  );
}
