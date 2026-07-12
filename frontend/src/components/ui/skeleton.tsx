interface SkeletonProps {
  className?: string;
  /** Rounds the skeleton to a circle (for avatars) */
  circle?: boolean;
}

export function Skeleton({ className = "", circle = false }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse bg-white/[0.07] ${
        circle ? "rounded-full" : "rounded-lg"
      } ${className}`}
    />
  );
}

/** Convenience: a full card-shaped skeleton */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle className="h-8 w-8 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
