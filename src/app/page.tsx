import Link from "next/link";

const ENTRY_POINTS = [
  {
    href: "/investor-search",
    label: "Explore Investor Properties",
    description: "Find and analyze residential investment properties, including Section 8.",
  },
  {
    href: "/home-buyers",
    label: "Find a Home to Buy",
    description: "Affordability, condition, neighborhood fit, and resale analysis.",
  },
  {
    href: "/deal-analyzer",
    label: "Analyze a Specific Property",
    description: "Enter an address, or bring your own deal, and see the full analysis.",
  },
];

/**
 * Home / Landing page shell (spec section 8.1). The investor natural-language
 * search, strategy selections, and address lookup are Milestone 4 features —
 * this milestone establishes the layout and entry points that will host them.
 */
export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-navy-900 dark:text-white sm:text-5xl">
        DealFactor
      </h1>
      <p className="mt-3 text-lg text-ink-600 dark:text-ink-400">
        Every factor behind every deal.
      </p>
      <p className="mt-6 max-w-2xl text-base text-ink-600 dark:text-ink-400">
        DealFactor helps residential real-estate investors and home buyers understand
        whether a property is genuinely a good deal — combining property data from
        multiple sources with transparent, uncertainty-aware AI analysis.
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        {ENTRY_POINTS.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="flex flex-col rounded-lg border border-border-subtle bg-surface p-5 text-left transition-colors hover:border-gold-500"
          >
            <span className="font-semibold text-navy-900 dark:text-white">
              {entry.label}
            </span>
            <span className="mt-1 text-sm text-ink-600 dark:text-ink-400">
              {entry.description}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
        This is the Milestone 1 foundation shell. Natural-language search, property
        analysis, and AI features are built in later milestones.
      </p>
    </div>
  );
}
