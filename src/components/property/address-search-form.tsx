"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  searchPropertyByAddress,
  type AddressSearchState,
} from "@/lib/property-data/search-actions";

const initialState: AddressSearchState = {
  error: null,
  matches: null,
  noMatch: false,
  submittedAddress: null,
};

/**
 * "Analyze a Specific Property" entry point (spec section 8.1): a secondary
 * action that expands an inline address field on selection. Address
 * submission requires only the address (spec section 11.2).
 */
export function AddressSearchForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [state, formAction, isPending] = useActionState(searchPropertyByAddress, initialState);

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex flex-col rounded-lg border border-border-subtle bg-surface p-5 text-left transition-colors hover:border-gold-500"
      >
        <span className="font-semibold text-navy-900 dark:text-white">
          Analyze a Specific Property
        </span>
        <span className="mt-1 text-sm text-ink-600 dark:text-ink-400">
          Enter an address, or bring your own deal, and see the full analysis.
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-gold-500 bg-surface p-5 text-left">
      <label htmlFor="address" className="font-semibold text-navy-900 dark:text-white">
        Property address
      </label>
      <form action={formAction} className="mt-2 flex flex-col gap-2 sm:flex-row" noValidate>
        <input
          id="address"
          name="address"
          type="text"
          required
          aria-required="true"
          placeholder="123 Main St, Detroit, MI"
          defaultValue={state.submittedAddress ?? ""}
          aria-describedby={state.error ? "address-search-error" : undefined}
          className="flex-1 rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-ink-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
        >
          {isPending ? "Searching…" : "Search"}
        </button>
      </form>

      {state.error && (
        <p id="address-search-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {state.matches && state.matches.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-ink-600 dark:text-ink-400">
            More than one property matched. Select the correct address:
          </p>
          <ul className="mt-2 space-y-1">
            {state.matches.map((match) => (
              <li key={match.propertyId}>
                <Link
                  href={`/property/${match.propertyId}`}
                  className="text-sm font-medium text-navy-900 underline dark:text-gold-400"
                >
                  {match.formattedAddress}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.noMatch && (
        <p className="mt-3 rounded-md border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-ink-600 dark:text-ink-400">
          We couldn&apos;t find that address. Manual deal entry lands in Milestone 3 — for now,
          double-check the address and try again.
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="mt-3 self-start text-xs font-medium text-ink-400 underline"
      >
        Cancel
      </button>
    </div>
  );
}
