"use client";

import { useMemo, useState } from "react";
import { calculateManualDeal } from "@/lib/deal-analyzer/manual-deal-calculations";
import {
  EMPTY_MANUAL_DEAL_RAW_VALUES,
  parseManualDealValues,
  parseOptionalNumber,
  validateManualDealRawValues,
  type ManualDealRawValues,
} from "@/lib/deal-analyzer/manual-deal-form-utils";
import {
  amountToPercent,
  formatDownPaymentAmountForInput,
  formatPercentInput,
  percentToAmount,
  validateDownPaymentPercent,
  type DownPaymentMode,
} from "@/lib/deal-analyzer/down-payment-input";
import { formatCurrency } from "@/lib/deal-analyzer/format";
import { ManualDealResults } from "./manual-deal-results";

type FieldKey = keyof ManualDealRawValues;

interface FieldConfig {
  key: FieldKey;
  label: string;
  type: "text" | "number";
  step?: string;
  selectOptions?: string[];
}

const REQUIRED_FIELDS: FieldConfig[] = [
  { key: "address", label: "Address", type: "text" },
  { key: "purchasePrice", label: "Purchase price", type: "number" },
  { key: "monthlyRent", label: "Monthly rent", type: "number" },
  { key: "bedrooms", label: "Bedrooms", type: "number" },
  { key: "bathrooms", label: "Bathrooms", type: "number", step: "0.5" },
  { key: "squareFootage", label: "Square footage", type: "number" },
];

// Down payment is handled by the dedicated <DownPaymentField> below, not by
// the generic FieldGroup renderer, since it has two alternate inputs plus a
// mode selector and a live calculated-amount preview.
const FINANCING_FIELDS: FieldConfig[] = [
  { key: "interestRatePercent", label: "Interest rate (%)", type: "number", step: "0.01" },
  { key: "loanTermYears", label: "Loan term (years)", type: "number" },
];

const EXPENSE_FIELDS: FieldConfig[] = [
  { key: "propertyTaxes", label: "Property taxes (monthly)", type: "number" },
  { key: "insurance", label: "Insurance (monthly)", type: "number" },
  { key: "propertyManagement", label: "Property management (monthly)", type: "number" },
  { key: "maintenanceReserve", label: "Maintenance reserve (monthly)", type: "number" },
  { key: "hoa", label: "HOA (monthly)", type: "number" },
  { key: "vacancyReserve", label: "Monthly vacancy reserve", type: "number" },
  { key: "utilities", label: "Utilities (monthly)", type: "number" },
];

const OTHER_FIELDS: FieldConfig[] = [
  { key: "numberOfUnits", label: "Number of units", type: "number" },
  { key: "renovationCosts", label: "Renovation costs", type: "number" },
  { key: "occupancy", label: "Occupancy", type: "text", selectOptions: ["Occupied", "Vacant"] },
  {
    key: "section8Status",
    label: "Section 8 status",
    type: "text",
    selectOptions: [
      "Section 8 Mentioned — Unverified",
      "Section 8 Tenant Reported",
      "Active Section 8 Tenant — Confirmed",
      "HAP Contract Confirmed",
    ],
  },
];

const INPUT_CLASS =
  "mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-900 dark:text-white";

function Field({
  config,
  value,
  error,
  onChange,
  onBlur,
}: {
  config: FieldConfig;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${config.key}-error`;

  return (
    <div>
      <label htmlFor={config.key} className="block text-sm font-medium text-ink-900 dark:text-white">
        {config.label}
      </label>
      {config.selectOptions ? (
        <select
          id={config.key}
          name={config.key}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={INPUT_CLASS}
        >
          <option value="" />
          {config.selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={config.key}
          name={config.key}
          type={config.type}
          step={config.step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={INPUT_CLASS}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function FieldGroup({
  fields,
  rawValues,
  errors,
  onChange,
  onBlur,
}: {
  fields: FieldConfig[];
  rawValues: ManualDealRawValues;
  errors: Partial<Record<FieldKey, string | undefined>>;
  onChange: (key: FieldKey, value: string) => void;
  onBlur: (key: FieldKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((config) => (
        <Field
          key={config.key}
          config={config}
          value={rawValues[config.key]}
          error={errors[config.key]}
          onChange={(value) => onChange(config.key, value)}
          onBlur={() => onBlur(config.key)}
        />
      ))}
    </div>
  );
}

const DOWN_PAYMENT_MODE_OPTIONS: { mode: DownPaymentMode; label: string }[] = [
  { mode: "amount", label: "Amount ($)" },
  { mode: "percent", label: "Percent (%)" },
];

/**
 * Lets the user enter down payment as a dollar amount or as a percentage of
 * purchase price (spec: down-payment input-mode selector). Only one input
 * is ever rendered at a time; the mode selector is a compact segmented
 * control built from native radio inputs, so it keeps full native keyboard
 * (arrow-key) and screen-reader radiogroup behavior while being visually
 * restyled as a pill pair.
 */
function DownPaymentField({
  mode,
  amountRaw,
  percentRaw,
  amountError,
  percentError,
  calculatedAmount,
  onModeChange,
  onAmountChange,
  onPercentChange,
  onBlur,
}: {
  mode: DownPaymentMode;
  amountRaw: string;
  percentRaw: string;
  amountError?: string;
  percentError?: string;
  calculatedAmount: number | null;
  onModeChange: (mode: DownPaymentMode) => void;
  onAmountChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink-900 dark:text-white">Down payment</span>

      <div
        role="radiogroup"
        aria-label="Choose amount or percent"
        className="mt-1 inline-flex rounded-md border border-border-subtle p-0.5"
      >
        {DOWN_PAYMENT_MODE_OPTIONS.map((option) => (
          <label
            key={option.mode}
            className={`relative cursor-pointer rounded px-3 py-1 text-sm font-medium transition-colors ${
              mode === option.mode
                ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950"
                : "text-ink-600 dark:text-ink-400"
            }`}
          >
            <input
              type="radio"
              name="downPaymentMode"
              value={option.mode}
              checked={mode === option.mode}
              onChange={() => onModeChange(option.mode)}
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="rounded px-1 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {mode === "amount" ? (
        <>
          <input
            id="downPayment"
            name="downPayment"
            type="number"
            aria-label="Down payment"
            value={amountRaw}
            onChange={(event) => onAmountChange(event.target.value)}
            onBlur={onBlur}
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? "downPayment-error" : undefined}
            className={`${INPUT_CLASS} mt-2`}
          />
          {amountError && (
            <p id="downPayment-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {amountError}
            </p>
          )}
        </>
      ) : (
        <>
          <input
            id="downPaymentPercent"
            name="downPaymentPercent"
            type="number"
            step="0.0001"
            aria-label="Down payment percentage"
            value={percentRaw}
            onChange={(event) => onPercentChange(event.target.value)}
            onBlur={onBlur}
            aria-invalid={percentError ? true : undefined}
            aria-describedby={percentError ? "downPaymentPercent-error" : "downPaymentPercent-calculated"}
            className={`${INPUT_CLASS} mt-2`}
          />
          {percentError && (
            <p id="downPaymentPercent-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {percentError}
            </p>
          )}
          <p id="downPaymentPercent-calculated" className="mt-1 text-xs text-ink-400">
            {calculatedAmount !== null
              ? `Calculated down payment: ${formatCurrency(calculatedAmount)}`
              : "Enter a valid purchase price to calculate the down payment amount."}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Manual Deal Entry (spec sections 5.6, 8.9, 10.25, 11.7). Calculates
 * entirely client-side against the already-tested FinancialEngine — no
 * server round trip, no persistence, nothing saved or submitted. Every
 * value recalculates live as the user types; there is no separate
 * "Calculate" step.
 */
export function ManualDealEntryForm() {
  const [rawValues, setRawValues] = useState<ManualDealRawValues>(EMPTY_MANUAL_DEAL_RAW_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downPaymentMode, setDownPaymentMode] = useState<DownPaymentMode>("amount");
  const [downPaymentPercentRaw, setDownPaymentPercentRaw] = useState("");

  const values = useMemo(() => parseManualDealValues(rawValues), [rawValues]);
  const allErrors = useMemo(() => validateManualDealRawValues(rawValues), [rawValues]);
  const results = useMemo(() => calculateManualDeal(values), [values]);

  const visibleErrors = useMemo(() => {
    const visible: Partial<Record<FieldKey, string | undefined>> = {};
    for (const key of Object.keys(touched) as FieldKey[]) {
      if (touched[key]) visible[key] = allErrors[key];
    }
    return visible;
  }, [touched, allErrors]);

  const downPaymentPercentValue = parseOptionalNumber(downPaymentPercentRaw);
  const downPaymentPercentError = touched.downPayment
    ? validateDownPaymentPercent(downPaymentPercentValue)
    : undefined;
  const calculatedDownPaymentAmount = percentToAmount(values.purchasePrice, downPaymentPercentValue);

  /**
   * Purchase price drives the down-payment shadow field: editing it while
   * in Percent mode immediately refreshes the calculated dollar amount;
   * editing it while in Amount mode keeps the percent shadow in sync so a
   * later switch to Percent mode is a lossless reveal, not a fresh
   * conversion (see the Percent<->Amount switch handlers below for why
   * that avoids drift).
   */
  function handleChange(key: FieldKey, value: string) {
    if (key === "purchasePrice") {
      const purchasePrice = parseOptionalNumber(value);
      if (downPaymentMode === "percent") {
        const amount = percentToAmount(purchasePrice, downPaymentPercentValue);
        setRawValues((prev) => ({
          ...prev,
          purchasePrice: value,
          downPayment: amount !== null ? formatDownPaymentAmountForInput(amount) : "",
        }));
        return;
      }
      const amount = parseOptionalNumber(rawValues.downPayment);
      const percent = amountToPercent(purchasePrice, amount);
      setDownPaymentPercentRaw(percent !== null ? formatPercentInput(percent) : "");
      setRawValues((prev) => ({ ...prev, purchasePrice: value }));
      return;
    }
    setRawValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(key: FieldKey) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  /** Typing a dollar amount directly keeps the percent shadow continuously in sync. */
  function handleDownPaymentAmountChange(value: string) {
    setRawValues((prev) => ({ ...prev, downPayment: value }));
    const amount = parseOptionalNumber(value);
    const percent = amountToPercent(values.purchasePrice, amount);
    setDownPaymentPercentRaw(percent !== null ? formatPercentInput(percent) : "");
  }

  /**
   * Typing a percentage keeps the dollar shadow continuously in sync. This
   * is what makes mode-switching itself a pure, lossless reveal rather than
   * a fresh (and potentially compounding) conversion: the target field is
   * already correct by the time the user switches to it.
   */
  function handleDownPaymentPercentChange(value: string) {
    setDownPaymentPercentRaw(value);
    const percent = parseOptionalNumber(value);
    const amount = percentToAmount(values.purchasePrice, percent);
    setRawValues((prev) => ({
      ...prev,
      downPayment: amount !== null ? formatDownPaymentAmountForInput(amount) : "",
    }));
  }

  /** A pure visibility toggle — no conversion happens here (see above). */
  function handleDownPaymentModeChange(mode: DownPaymentMode) {
    setDownPaymentMode(mode);
  }

  function handleDownPaymentBlur() {
    setTouched((prev) => ({ ...prev, downPayment: true }));
  }

  return (
    <div>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        <FieldGroup
          fields={REQUIRED_FIELDS}
          rawValues={rawValues}
          errors={visibleErrors}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="flex w-fit items-center gap-2 text-sm font-semibold text-navy-900 underline dark:text-gold-400"
        >
          <span>Add More Details</span>
          <span aria-hidden="true">{detailsOpen ? "−" : "+"}</span>
        </button>

        {detailsOpen && (
          <div className="flex flex-col gap-6 border-t border-border-subtle pt-6">
            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold text-navy-900 dark:text-white">Financing</legend>
              <DownPaymentField
                mode={downPaymentMode}
                amountRaw={rawValues.downPayment}
                percentRaw={downPaymentPercentRaw}
                amountError={visibleErrors.downPayment}
                percentError={downPaymentPercentError}
                calculatedAmount={calculatedDownPaymentAmount}
                onModeChange={handleDownPaymentModeChange}
                onAmountChange={handleDownPaymentAmountChange}
                onPercentChange={handleDownPaymentPercentChange}
                onBlur={handleDownPaymentBlur}
              />
              <FieldGroup
                fields={FINANCING_FIELDS}
                rawValues={rawValues}
                errors={visibleErrors}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold text-navy-900 dark:text-white">Operating expenses</legend>
              <FieldGroup
                fields={EXPENSE_FIELDS}
                rawValues={rawValues}
                errors={visibleErrors}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold text-navy-900 dark:text-white">Other</legend>
              <FieldGroup
                fields={OTHER_FIELDS}
                rawValues={rawValues}
                errors={visibleErrors}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </fieldset>
          </div>
        )}
      </form>

      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode={downPaymentMode}
        downPaymentPercent={downPaymentPercentValue}
      />
    </div>
  );
}
