import { ManualDealEntryForm } from "@/components/deal-analyzer/manual-deal-entry-form";

export default function ManualDealEntryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-white">
        Manual Deal Entry
      </h1>
      <p className="mt-4 text-base text-ink-600 dark:text-ink-400">
        Enter a deal by hand and see it run through the same tested Financial Calculation Engine
        used everywhere else on DealFactor. Nothing here is saved — this page recalculates live in
        your browser and nothing is sent to a server.
      </p>
      <ManualDealEntryForm />
    </div>
  );
}
