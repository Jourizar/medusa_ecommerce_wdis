"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
      <Link
        href={createPageUrl(currentPage - 1)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          currentPage === 1
            ? "text-text-muted/40 pointer-events-none"
            : "text-text hover:bg-surface-elevated"
        )}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Link>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
          )
          .map((page, index, arr) => {
            const showEllipsis = index > 0 && page - arr[index - 1] > 1;

            return (
              <span key={page} className="flex items-center">
                {showEllipsis && (
                  <span className="px-2 text-text-muted">…</span>
                )}
                <Link
                  href={createPageUrl(page)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    page === currentPage
                      ? "bg-primary text-white"
                      : "text-text hover:bg-surface-elevated"
                  )}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Link>
              </span>
            );
          })}
      </div>

      <Link
        href={createPageUrl(currentPage + 1)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          currentPage === totalPages
            ? "text-text-muted/40 pointer-events-none"
            : "text-text hover:bg-surface-elevated"
        )}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
