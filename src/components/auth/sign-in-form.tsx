"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithPassword, type AuthActionState } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const initialState: AuthActionState = { error: null };

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithPassword, initialState);

  return (
    <div className="mx-auto w-full max-w-sm">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-900 dark:text-white">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={state.error ? "sign-in-error" : undefined}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-ink-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-900 dark:text-white">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
            aria-describedby={state.error ? "sign-in-error" : undefined}
            className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-ink-900 dark:text-white"
          />
        </div>

        {state.error && (
          <p id="sign-in-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400"
        >
          {isPending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-border-subtle" />
        or
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-400">
        Don&apos;t have an account?{" "}
        <Link href="/create-account" className="font-medium text-navy-900 underline dark:text-white">
          Create one
        </Link>
      </p>
    </div>
  );
}
