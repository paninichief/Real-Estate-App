import type {
  ManualDealCalculationResults,
  ManualDealFormValues,
  ManualDealMetricResult,
} from "@/lib/deal-analyzer/manual-deal-types";
import { formatCurrency, formatPercent } from "@/lib/deal-analyzer/format";
import { formatPercentInput, type DownPaymentMode } from "@/lib/deal-analyzer/down-payment-input";

const NOT_PROVIDED = "Not provided";
const INFORMATIONAL_NOTE = "Not included in these calculations.";
const BLANK_OPTIONAL_FIELDS_NOTICE =
  "Calculations use only the expenses and financing details you provided. Blank optional expense fields are treated as $0. Missing financing fields may prevent financing-dependent results from being calculated.";

interface EntryRow {
  key: keyof ManualDealFormValues;
  label: string;
  format: (value: never) => string;
  informational?: boolean;
}

// Down payment is rendered separately (see DownPaymentEntryRows below) since
// its display depends on which input mode produced it.
const ENTRY_ROWS_BEFORE_DOWN_PAYMENT: EntryRow[] = [
  { key: "address", label: "Address", format: (v: string) => v },
  { key: "purchasePrice", label: "Purchase price", format: (v: number) => formatCurrency(v) },
  { key: "monthlyRent", label: "Monthly rent", format: (v: number) => formatCurrency(v) },
  { key: "bedrooms", label: "Bedrooms", format: (v: number) => String(v) },
  { key: "bathrooms", label: "Bathrooms", format: (v: number) => String(v) },
  { key: "squareFootage", label: "Square footage", format: (v: number) => `${v.toLocaleString()} sqft` },
];

const ENTRY_ROWS_AFTER_DOWN_PAYMENT: EntryRow[] = [
  { key: "interestRatePercent", label: "Interest rate", format: (v: number) => `${v}%` },
  { key: "loanTermYears", label: "Loan term", format: (v: number) => `${v} years` },
  { key: "propertyTaxes", label: "Property taxes", format: (v: number) => formatCurrency(v) },
  { key: "insurance", label: "Insurance", format: (v: number) => formatCurrency(v) },
  { key: "propertyManagement", label: "Property management", format: (v: number) => formatCurrency(v) },
  { key: "maintenanceReserve", label: "Maintenance reserve", format: (v: number) => formatCurrency(v) },
  { key: "hoa", label: "HOA", format: (v: number) => formatCurrency(v) },
  { key: "vacancyReserve", label: "Monthly vacancy reserve", format: (v: number) => formatCurrency(v) },
  { key: "utilities", label: "Utilities", format: (v: number) => formatCurrency(v) },
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

interface MetricRow {
  key: keyof ManualDealCalculationResults;
  label: string;
  format: (value: number) => string;
}

const METRIC_ROWS: MetricRow[] = [
  { key: "pricePerSquareFoot", label: "Price per square foot", format: formatCurrency },
  { key: "annualRentalIncome", label: "Annual rental income", format: formatCurrency },
  { key: "loanAmount", label: "Loan amount", format: formatCurrency },
  { key: "monthlyMortgagePayment", label: "Monthly mortgage payment", format: formatCurrency },
  { key: "totalMonthlyOperatingExpenses", label: "Total monthly operating expenses", format: formatCurrency },
  { key: "totalAnnualOperatingExpenses", label: "Total annual operating expenses", format: formatCurrency },
  { key: "monthlyNOI", label: "Monthly NOI", format: formatCurrency },
  { key: "annualNOI", label: "Annual NOI", format: formatCurrency },
  { key: "monthlyCashFlow", label: "Monthly cash flow", format: formatCurrency },
  { key: "annualCashFlow", label: "Annual cash flow", format: formatCurrency },
  { key: "capRate", label: "Cap rate", format: formatPercent },
  { key: "cashOnCashReturn", label: "Cash-on-cash return", format: formatPercent },
];

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
 * Displays a manual deal entry alongside its FinancialEngine-derived
 * results. Entered values are always labeled "User input" (spec: entered
 * values must be labeled as such); blank optional fields show "Not
 * provided" rather than a fabricated default. Number of units, Renovation
 * costs, Occupancy, and Section 8 status are captured but explicitly
 * marked as excluded from the calculations below, since no approved
 * formula exists for them yet.
 */
export function ManualDealResults({
  values,
  results,
  downPaymentMode = "amount",
  downPaymentPercent = null,
}: {
  values: ManualDealFormValues;
  results: ManualDealCalculationResults;
  downPaymentMode?: DownPaymentMode;
  downPaymentPercent?: number | null;
}) {
  function renderEntryRow(row: EntryRow) {
    const value = values[row.key];
    return (
      <div key={row.key}>
        <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
        <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
          <EntryValue
            value={value !== null ? (row.format as (value: unknown) => string)(value) : null}
            tag="User input"
          />
        </dd>
        {row.informational && <p className="mt-1 text-xs text-ink-400">{INFORMATIONAL_NOTE}</p>}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <section aria-label="Your entries">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Your entries</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {ENTRY_ROWS_BEFORE_DOWN_PAYMENT.map(renderEntryRow)}

          {downPaymentMode === "percent" ? (
            <>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Down payment percentage
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                  <EntryValue
                    value={downPaymentPercent !== null ? `${formatPercentInput(downPaymentPercent)}%` : null}
                    tag="User input"
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Down payment (calculated)
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                  <EntryValue
                    value={values.downPayment !== null ? formatCurrency(values.downPayment) : null}
                    tag="Calculated from user input"
                  />
                </dd>
              </div>
            </>
          ) : (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Down payment</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-navy-900 dark:text-white">
                <EntryValue
                  value={values.downPayment !== null ? formatCurrency(values.downPayment) : null}
                  tag="User input"
                />
              </dd>
            </div>
          )}

          {ENTRY_ROWS_AFTER_DOWN_PAYMENT.map(renderEntryRow)}
        </dl>
      </section>

      <section aria-label="Calculated results">
        <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">Calculated results</h2>
        <p className="mt-2 text-xs text-ink-400">{BLANK_OPTIONAL_FIELDS_NOTICE}</p>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {METRIC_ROWS.map((row) => (
            <div key={row.key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{row.label}</dt>
              <dd className="mt-1">
                <MetricValue result={results[row.key]} format={row.format} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
