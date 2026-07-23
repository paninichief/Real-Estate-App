"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthControl } from "@/components/layout/auth-control";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/investor-search", label: "Investor Search" },
  { href: "/home-buyers", label: "Home Buyers" },
  { href: "/deal-analyzer", label: "Deal Analyzer" },
  { href: "/my-deals", label: "My Deals" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

/** Mobile menu: logo stays in the header; this supplies the simplified nav (spec section 7.2). */
export function MobileNav({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md p-2 text-white hover:bg-navy-800 dark:hover:bg-navy-800"
      >
        <span aria-hidden="true" className="block h-5 w-5">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-40 border-t border-navy-700 bg-navy-900 px-4 py-3 shadow-lg"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-white hover:bg-navy-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-navy-700 pt-3">
            <ThemeToggle />
            <AuthControl isSignedIn={isSignedIn} />
          </div>
        </nav>
      )}
    </div>
  );
}
