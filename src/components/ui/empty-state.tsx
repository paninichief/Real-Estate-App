type EmptyStateProps = {
  title: string;
  description: string;
  note?: string;
};

/**
 * Placeholder content for routes whose real functionality lands in a later
 * milestone. Keeps every top-level route in the sitemap navigable and testable
 * from Milestone 1, without pretending the feature already exists.
 */
export function EmptyState({ title, description, note }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-navy-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-4 text-base text-ink-600 dark:text-ink-400">{description}</p>
      {note && (
        <p className="mt-6 rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
          {note}
        </p>
      )}
    </div>
  );
}
