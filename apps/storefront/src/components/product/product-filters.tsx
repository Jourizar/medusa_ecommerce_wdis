"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { ProductCategory } from "@/lib/medusa/categories";
import { SortDropdown } from "@/components/product/sort-dropdown";

interface Props {
  categories: ProductCategory[];
  priceMin: number;
  priceMax: number;
  priceStep?: number;
}

export function ProductFilters({
  categories,
  priceMin,
  priceMax,
  priceStep = 5,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlMin = clamp(Number(searchParams.get("min_price")) || priceMin, priceMin, priceMax);
  const urlMax = clamp(Number(searchParams.get("max_price")) || priceMax, priceMin, priceMax);
  const activeCategory = searchParams.get("category") || "";

  const [lo, setLo] = useState(urlMin);
  const [hi, setHi] = useState(urlMax);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape; move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setLo(urlMin);
    setHi(urlMax);
  }, [urlMin, urlMax]);

  const commitTimer = useRef<number | null>(null);
  const commit = (nextLo: number, nextHi: number) => {
    if (commitTimer.current) window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (nextLo > priceMin) params.set("min_price", String(nextLo));
      else params.delete("min_price");
      if (nextHi < priceMax) params.set("max_price", String(nextHi));
      else params.delete("max_price");
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  };

  const setCategory = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("category", id);
    else params.delete("category");
    // Switching/clearing a category should reset any leftover search query
    // — otherwise a no-match search like "?q=zzz" silently filters out the
    // newly-picked category and the page renders empty.
    params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const hasActiveFilters =
    activeCategory || lo > priceMin || hi < priceMax;
  const activeCount =
    (activeCategory ? 1 : 0) + (urlMin > priceMin || urlMax < priceMax ? 1 : 0);

  const range = priceMax - priceMin;
  const loPct = range > 0 ? ((lo - priceMin) / range) * 100 : 0;
  const hiPct = range > 0 ? ((hi - priceMin) / range) * 100 : 100;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="product-filters-panel"
        className={`relative inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm border-[3px] border-black px-4 py-2.5 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-100 ${
          open ? "bg-black text-white" : "bg-cream text-black"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={3} />
        Filters
        {activeCount > 0 && (
          <span className="absolute -top-2.5 -right-2.5 min-w-[22px] h-[22px] px-1 inline-flex items-center justify-center bg-hotpink text-black border-[2px] border-black text-[11px] leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div
            id="product-filters-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            className="absolute right-0 top-full mt-4 z-50 w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100svh-12rem)] overflow-y-auto bg-cream border-[4px] border-black shadow-[8px_8px_0_0_#000] p-5 space-y-6 outline-none"
          >
            <div className="border-b-[3px] border-black pb-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black uppercase tracking-widest text-black">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="h-9 w-9 inline-flex items-center justify-center border-[3px] border-black bg-hotpink hover:bg-accent shadow-[2px_2px_0_0_#000]"
                >
                  <X className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <SortDropdown />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-widest border-[2px] border-black bg-hotpink text-black px-2 py-1 hover:bg-accent transition-colors"
                  >
                    <X className="w-3 h-3 mr-1" strokeWidth={3} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black mb-3">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(isActive ? "" : cat.id)}
                        className={`text-[11px] font-black uppercase tracking-widest border-[3px] border-black px-2.5 py-1.5 transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-cream text-black hover:bg-accent"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price range slider */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-black mb-3">
                Price
              </h3>

              <div className="flex items-center justify-between mb-3">
                <span className="inline-block bg-cream border-[2px] border-black px-2 py-0.5 text-xs font-black tracking-tight">
                  ${lo}
                </span>
                <span className="inline-block bg-accent border-[2px] border-black px-2 py-0.5 text-xs font-black tracking-tight">
                  ${hi}
                  {hi >= priceMax ? "+" : ""}
                </span>
              </div>

              <div className="relative h-10 select-none">
                {/* Track + fill, inset by half a handle (11px) so the fill's ends
                    line up with handle centers, which never reach the outer edges */}
                <div className="absolute inset-y-0 left-[11px] right-[11px]">
                  <div className="absolute -left-[11px] -right-[11px] top-1/2 -translate-y-1/2 h-2 border-[3px] border-black bg-cream" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2 bg-primary"
                    style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
                  />
                </div>
                {/* Min handle */}
                <input
                  type="range"
                  min={priceMin}
                  max={priceMax}
                  step={priceStep}
                  value={lo}
                  onChange={(e) => {
                    const requested = Number(e.target.value);
                    const cap = hi - priceStep;
                    const v = Math.max(priceMin, Math.min(requested, cap));
                    setLo(v);
                    commit(v, hi);
                  }}
                  aria-label="Minimum price"
                  className="price-range-input absolute inset-0 w-full"
                  style={{ zIndex: lo > priceMax - range / 4 ? 5 : 3 }}
                />
                {/* Max handle */}
                <input
                  type="range"
                  min={priceMin}
                  max={priceMax}
                  step={priceStep}
                  value={hi}
                  onChange={(e) => {
                    const requested = Number(e.target.value);
                    const floor = lo + priceStep;
                    const v = Math.min(priceMax, Math.max(requested, floor));
                    setHi(v);
                    commit(lo, v);
                  }}
                  aria-label="Maximum price"
                  className="price-range-input absolute inset-0 w-full"
                  style={{ zIndex: 4 }}
                />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-3">
                Drag handles to filter
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}
