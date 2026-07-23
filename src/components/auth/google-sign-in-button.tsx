import { signInWithGoogle } from "@/lib/auth/actions";

export function GoogleSignInButton() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-ink-900 hover:bg-surface-muted dark:text-white"
      >
        Continue with Google
      </button>
    </form>
  );
}
