"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Maps shortcut keywords to dedicated pages so users searching for a section
 * (e.g. "art", "cart") land there instead of a random product match.
 */
const SECTION_SHORTCUTS: Array<{ keywords: string[]; href: string }> = [
  { keywords: ["art", "arts", "gallery", "painting", "paintings"], href: "/art" },
  { keywords: ["cart", "bag", "basket", "checkout"], href: "/cart" },
  { keywords: ["shop", "store", "all products", "products", "merch"], href: "/products" },
  { keywords: ["home", "homepage"], href: "/" },
];

function resolveDestination(rawQuery: string): string {
  const q = rawQuery.trim().toLowerCase();
  for (const { keywords, href } of SECTION_SHORTCUTS) {
    if (keywords.includes(q)) return href;
  }
  return `/products?q=${encodeURIComponent(rawQuery.trim())}`;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Focus once the modal mounts
    setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    onClose();
    router.push(resolveDestination(value));
    setQ("");
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-cream border-[5px] border-black shadow-[10px_10px_0_0_#51D6FF]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-primary text-white border-b-[4px] border-black px-4 py-3">
          <span className="text-xs font-black uppercase tracking-widest">
            ★ Search
          </span>
          <button
            aria-label="Close search"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center border-[3px] border-black bg-hotpink text-black hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5">
          <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
            What are you looking for?
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black pointer-events-none"
                strokeWidth={3}
              />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="HOODIES, TEES, ART..."
                className="w-full h-12 pl-11 pr-4 bg-cream border-[3px] border-black font-bold uppercase placeholder:text-muted focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:-translate-x-[2px] focus:-translate-y-[2px] transition-[transform,box-shadow] duration-100"
              />
            </div>
            <button
              type="submit"
              disabled={!q.trim()}
              className="inline-flex items-center justify-center font-black uppercase tracking-widest border-[3px] border-black bg-accent text-black px-6 h-12 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-1 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none transition-[transform,box-shadow] duration-100"
            >
              Go
            </button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-3">
            Press Enter or ESC to close
          </p>
        </form>
      </div>
    </div>
  );
}
