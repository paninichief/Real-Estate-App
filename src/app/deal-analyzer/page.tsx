import { EmptyState } from "@/components/ui/empty-state";

export default function DealAnalyzerPage() {
  return (
    <EmptyState
      title="Deal Analyzer"
      description="Analyze a single property or compare several, from a DealFactor search, an address, a manual entry, or an uploaded document."
      note="One-property manual entry and the financial engine land in Milestone 3; address-search and comparison follow in later milestones."
    />
  );
}
