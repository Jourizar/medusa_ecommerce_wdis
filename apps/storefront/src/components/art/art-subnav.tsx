"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { label: "Gallery", href: "/art" },
  { label: "All Pieces", href: "/art/all" },
];

/** Sticks just under the navbar (h-20 + 4px border). */
export function ArtSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Art"
      className="sticky top-[84px] z-20 bg-cream border-b-[4px] border-black"
    >
      <div className="max-w-container mx-auto px-4 h-14 flex items-center gap-2">
        <span className="hidden sm:inline mr-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted">
          Art /
        </span>
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 text-xs font-black uppercase tracking-widest border-[3px] transition-[transform,box-shadow] duration-100",
                active
                  ? "bg-black text-white border-black shadow-[3px_3px_0_0_#51D6FF]"
                  : "text-black border-transparent hover:border-black hover:shadow-[3px_3px_0_0_#000] hover:-translate-x-[1px] hover:-translate-y-[1px]"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
