// ── Product Card Skeleton ─────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Image placeholder */}
      <div className="aspect-[4/3] w-full animate-pulse bg-secondary-100" />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Category chip */}
        <div className="h-4 w-20 animate-pulse rounded-full bg-secondary-100" />
        {/* Title */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-secondary-100" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-secondary-100" />
        {/* Description */}
        <div className="h-4 w-full animate-pulse rounded bg-secondary-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-secondary-100" />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-secondary-100 p-4 pt-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <div className="h-4 w-14 animate-pulse rounded bg-secondary-100" />
          <div className="h-6 w-24 animate-pulse rounded bg-secondary-100" />
        </div>
        {/* Button */}
        <div className="h-10 w-full animate-pulse rounded-xl bg-secondary-100" />
      </div>
    </div>
  );
}

// ── Table Skeleton ────────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  const widths = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-36"];

  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4">
              <div
                className={`h-4 animate-pulse rounded bg-secondary-100 ${widths[(r + c) % widths.length]}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Stat Card Skeleton ────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        {/* Icon placeholder */}
        <div className="h-10 w-10 rounded-xl bg-secondary-100" />
        {/* Badge placeholder */}
        <div className="h-5 w-16 rounded-full bg-secondary-100" />
      </div>
      <div className="mt-4 space-y-2">
        {/* Value */}
        <div className="h-7 w-28 rounded bg-secondary-100" />
        {/* Label */}
        <div className="h-4 w-20 rounded bg-secondary-100" />
      </div>
    </div>
  );
}
