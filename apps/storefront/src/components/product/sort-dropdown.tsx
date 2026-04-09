"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortDropdown() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "-created_at";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.set("page", "1"); // Reset to first page on sort change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="bg-surface border border-border text-text text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
