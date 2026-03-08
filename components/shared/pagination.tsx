"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  // Build page number array: show at most 5 consecutive pages centred on current
  function buildPageNumbers(): (number | "ellipsis-start" | "ellipsis-end")[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
    pages.push(1);

    const windowStart = Math.max(2, page - 1);
    const windowEnd = Math.min(totalPages - 1, page + 1);

    if (windowStart > 2) pages.push("ellipsis-start");

    for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
    }

    if (windowEnd < totalPages - 1) pages.push("ellipsis-end");

    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = buildPageNumbers();

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex items-center justify-between rounded-2xl border border-secondary-100 bg-white px-5 py-3 shadow-sm"
    >
      {/* Info */}
      <span className="text-sm text-secondary-500">
        {t("page")} {page} {t("of")} {totalPages}
      </span>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label={t("previous")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <PrevIcon size={15} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) => {
          if (p === "ellipsis-start" || p === "ellipsis-end") {
            return (
              <span
                key={p}
                className="flex h-8 w-8 items-center justify-center text-sm text-secondary-400"
              >
                &hellip;
              </span>
            );
          }
          const isActive = page === p;
          return (
            <button
              key={`page-${p}-${idx}`}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`${t("page")} ${p}`}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-secondary-500 hover:bg-secondary-100"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label={t("next")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 transition-colors hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <NextIcon size={15} />
        </button>
      </div>
    </div>
  );
}
