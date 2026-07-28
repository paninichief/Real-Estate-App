import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function DealAnalyzerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <EmptyState
        title="Deal Analyzer"
        description="Analyze a single property or compare several, from a DealFactor search, an address, a manual entry, or an uploaded document."
        note="Address-search results, multi-property comparison, and document upload land in later milestones."
      />
      <div className="mx-auto -mt-16 w-full max-w-2xl px-4 pb-24 sm:px-6 lg:px-8">
        <Link
          href="/deal-analyzer/manual"
          className="inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
        >
          Manual Deal Entry
        </Link>
      </div>
    </div>
  );
}
