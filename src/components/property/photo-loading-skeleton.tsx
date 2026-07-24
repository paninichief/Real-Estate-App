type PhotoLoadingSkeletonProps = {
  className?: string;
};

/** Reusable shimmer state for any future async photo fetch (e.g. a
 * client-side refresh) — unused by the server-rendered gallery today, but
 * ready so a later loading path doesn't need a new component. */
export function PhotoLoadingSkeleton({ className = "" }: PhotoLoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-muted ${className}`}
    />
  );
}
