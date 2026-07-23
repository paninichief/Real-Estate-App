import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

/**
 * Right-side auth control (spec section 7.1): Sign In / Create Account for a
 * guest, or Profile + sign-out for a signed-in user. Guests keep full access to
 * search/analysis — this control only governs persistence-related actions.
 */
export function AuthControl({ isSignedIn }: { isSignedIn: boolean }) {
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-sm font-medium text-white hover:text-gold-400"
        >
          Profile
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-ink-400 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/sign-in" className="text-sm font-medium text-white hover:text-gold-400">
        Sign In
      </Link>
      <Link
        href="/create-account"
        className="rounded-full bg-gold-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
      >
        Create Account
      </Link>
    </div>
  );
}
