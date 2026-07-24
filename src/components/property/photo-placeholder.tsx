type PhotoPlaceholderProps = {
  label?: string;
  className?: string;
};

/**
 * Generated placeholder graphic shown whenever no real property photo is
 * available — including the zero-photos case. Never a real image, so it
 * carries no licensing risk (spec Milestone 2 photo-ready requirements).
 */
export function PhotoPlaceholder({
  label = "No property photo available yet",
  className = "",
}: PhotoPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
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
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L6 19" />
      </svg>
      <span className="px-2 text-center text-xs font-medium">{label}</span>
    </div>
  );
}
