import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("shimmer rounded-xl", className)} />
  );
}

interface SkeletonGridProps {
  count: number;
  columns?: number;
}

function SkeletonGrid({ count, columns = 1 }: SkeletonGridProps) {
  return (
    <div
      className={cn("grid gap-6", {
        "grid-cols-1": columns === 1,
        "grid-cols-1 sm:grid-cols-2": columns === 2,
        "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3": columns === 3,
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4": columns === 4,
      })}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonGrid };
