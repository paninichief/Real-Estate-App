import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthControl } from "@/components/layout/auth-control";
import { MobileNav } from "@/components/layout/mobile-nav";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/investor-search", label: "Investor Search" },
  { href: "/home-buyers", label: "Home Buyers" },
  { href: "/deal-analyzer", label: "Deal Analyzer" },
  { href: "/my-deals", label: "My Deals" },
];

const SECONDARY_LINKS = [
  { href: "/help", label: "Help" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

/** Sticky desktop header + mobile header (spec section 7.1 / 7.2). */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700 bg-navy-900 text-white">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-display font-semibold tracking-tight">
            DealFactor
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm font-medium">
              {PRIMARY_LINKS.slice(1).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gold-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <nav aria-label="Secondary" className="hidden lg:block">
            <ul className="flex items-center gap-5 text-sm font-medium">
              {SECONDARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gold-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {isSignedIn && (
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-full p-1.5 text-white hover:bg-navy-800"
            >
              <span aria-hidden="true">🔔</span>
            </button>
          )}

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="hidden md:block">
            <AuthControl isSignedIn={isSignedIn} />
          </div>

          <MobileNav isSignedIn={isSignedIn} />
        </div>
      </div>
    </header>
  );
}
