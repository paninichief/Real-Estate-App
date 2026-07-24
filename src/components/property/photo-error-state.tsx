type PhotoErrorStateProps = {
  className?: string;
};

/** Shown when a real photo URL (future provider) fails to load. */
export function PhotoErrorState({ className = "" }: PhotoErrorStateProps) {
  return (
    <div
      role="img"
      aria-label="Photo failed to load"
      className={`flex flex-col items-center justify-center gap-2 bg-surface-muted text-ink-400 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <span className="px-2 text-center text-xs font-medium">Photo failed to load</span>
    </div>
  );
}
