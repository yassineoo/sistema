interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export default function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
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
