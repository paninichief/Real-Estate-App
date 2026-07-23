import { EmptyState } from "@/components/ui/empty-state";

export default function AiDisclaimerPage() {
  return (
    <EmptyState
      title="AI Disclaimer"
      description="AI may make mistakes; application code performs critical calculations; AI explains and interprets, but does not invent missing information."
      note="Draft legal content is written in Milestone 10 and requires qualified legal review before real public launch."
    />
  );
}
