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
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="bg-cream border-[3px] border-black text-black text-[10px] font-black uppercase tracking-widest px-2 h-9 shadow-[3px_3px_0_0_#000] focus:outline-none focus:shadow-[5px_5px_0_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-[transform,box-shadow] duration-100 max-w-[150px]"
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
