import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/investor-search", label: "Investor Search" },
      { href: "/home-buyers", label: "Home Buyers" },
      { href: "/deal-analyzer", label: "Deal Analyzer" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Help",
    links: [{ href: "/help", label: "Help Center" }],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms of Use" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/legal/investment-disclaimer", label: "Investment & Financial Disclaimer" },
      { href: "/legal/ai-disclaimer", label: "AI Disclaimer" },
      { href: "/legal/property-data-disclaimer", label: "Property-Data Disclaimer" },
      { href: "/legal/fair-housing", label: "Fair Housing Notice" },
      { href: "/legal/accessibility", label: "Accessibility Statement" },
    ],
  },
];

/** Sitewide footer (spec section 7.4). */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4">
            <p className="font-display text-lg font-semibold text-navy-900 dark:text-white">
              DealFactor
            </p>
            <p className="mt-2 max-w-md text-sm text-ink-600 dark:text-ink-400">
              Every factor behind every deal. Real-estate discovery and analysis for
              investors and home buyers, built on transparent data and honest,
              uncertainty-aware AI.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-navy-900 dark:text-white">
                {column.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-600 hover:text-navy-900 dark:text-ink-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border-subtle pt-6 text-xs text-ink-400">
          <p>
            DealFactor currently offers full advanced analysis in the Detroit market,
            with basic property search available nationwide where supported.
          </p>
          <p className="mt-2">
            Estimates, scores, and AI-generated analysis are informational only and are
            not a guarantee of investment returns, property value, or loan approval. See
            the{" "}
            <Link href="/legal/investment-disclaimer" className="underline hover:text-ink-600">
              Investment &amp; Financial Disclaimer
            </Link>
            .
          </p>
          <p className="mt-4">&copy; {year} DealFactor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
