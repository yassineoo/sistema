import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page:       number;
  count:      number;
  pageSize:   number;
  onChange:   (page: number) => void;
  className?: string;
}

export default function Pagination({ page, count, pageSize, onChange, className = "" }: PaginationProps) {
  const totalPages = Math.ceil(count / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, count);

  // Show at most 5 page buttons; always include first, last and neighbours of current
  const pageNumbers: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3)              pageNumbers.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPages - 2) pageNumbers.push("…");
    pageNumbers.push(totalPages);
  }

  return (
    <div className={`flex items-center justify-between rounded-2xl border border-secondary-100 bg-white px-5 py-3 shadow-sm ${className}`}>
      <span className="text-sm text-secondary-500">
        {from}–{to} / {count}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Page précédente"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        {pageNumbers.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-secondary-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? "bg-secondary-900 text-white"
                  : "text-secondary-500 hover:bg-secondary-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Page suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
