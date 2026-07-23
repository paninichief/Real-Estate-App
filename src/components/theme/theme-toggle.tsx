"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

const emptySubscribe = () => () => {};

/**
 * True only after the client has hydrated. Avoids setState-in-effect (which
 * causes an extra render pass) — see https://react.dev/reference/react/useSyncExternalStore.
 */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Light / Dark / System selector (spec section 17.5). Renders as "not yet
 * active" until hydrated, since the resolved theme depends on client-only
 * state and would otherwise mismatch between server and client render.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-muted p-1 text-sm"
      role="group"
      aria-label="Appearance"
    >
      {OPTIONS.map((option) => {
        const isActive = isClient && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setTheme(option.value)}
            className={`rounded-full px-3 py-1 transition-colors ${
              isActive
                ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950"
                : "text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
