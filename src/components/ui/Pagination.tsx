"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 10;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotal = Math.max(totalPages, 1);
  const btn =
    "grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-all duration-200 hover:border-navy-200 hover:bg-navy-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
      <span>
        Page <span className="font-semibold text-ink">{currentPage}</span> of{" "}
        <span className="font-semibold text-ink">{safeTotal}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={btn}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= safeTotal}
          onClick={() => onPageChange(currentPage + 1)}
          className={btn}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
