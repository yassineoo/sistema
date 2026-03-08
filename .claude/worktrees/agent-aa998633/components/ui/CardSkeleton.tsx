interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export default function CardSkeleton({ count = 4, className = "" }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-3 ${className}`}
        >
          <div className="h-10 w-10 rounded-xl bg-secondary-100" />
          <div className="h-7 w-24 rounded bg-secondary-100" />
          <div className="h-4 w-32 rounded bg-secondary-100" />
        </div>
      ))}
    </>
  );
}
