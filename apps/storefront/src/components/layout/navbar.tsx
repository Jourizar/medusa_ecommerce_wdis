"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils/cn";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchOverlay } from "@/components/layout/search-overlay";

// Section links stay highlighted on their sub-pages (e.g. /art/all).
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const reduce = useReducedMotion();

  // Wiggle the cart button whenever the item count goes up.
  const cartControls = useAnimationControls();
  const prevCount = useRef(itemCount);
  useEffect(() => {
    if (itemCount > prevCount.current && !reduce) {
      cartControls.start({
        rotate: [0, -10, 8, -5, 0],
        scale: [1, 1.12, 1],
        transition: { duration: 0.5 },
      });
    }
    prevCount.current = itemCount;
  }, [itemCount, cartControls, reduce]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream border-b-[4px] border-black">
        <div className="max-w-container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              aria-label={`${SITE_NAME} — home`}
              className="inline-flex items-center hover:-rotate-2 transition-transform duration-150"
            >
              <span
                className="text-brutal text-4xl md:text-5xl text-accent"
                style={{ WebkitTextStroke: "2px #000" }}
              >
                {SITE_NAME}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative isolate px-4 py-2 text-sm font-black uppercase tracking-widest border-[3px] transition-[transform,box-shadow,color] duration-100",
                      active
                        ? "text-white border-transparent"
                        : "text-black border-transparent hover:border-black hover:shadow-[4px_4px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px]"
                    )}
                  >
                    {active && (
                      // Shared layoutId: the pill slides between links on navigation.
                      <motion.span
                        layoutId="nav-active-pill"
                        aria-hidden
                        className="absolute -inset-[3px] -z-10 bg-primary border-[3px] border-black shadow-[4px_4px_0_0_#000]"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="h-11 w-11 inline-flex items-center justify-center border-[3px] border-black bg-cream hover:bg-accent transition-colors"
              >
                <Search className="w-5 h-5" strokeWidth={3} />
              </button>

              <motion.button
                aria-label="Open cart"
                onClick={() => setCartOpen(true)}
                animate={cartControls}
                className="relative h-11 inline-flex items-center justify-center gap-2 px-3 border-[3px] border-black bg-hotpink text-black font-black uppercase tracking-widest hover:bg-accent transition-colors"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={3} />
                <span className="hidden sm:inline text-xs">Cart</span>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={reduce ? false : { scale: 1.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    className="ml-1 min-w-[1.5rem] h-6 inline-flex items-center justify-center px-1 bg-black text-white text-xs font-black"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>

              <Link
                href="/account"
                aria-label="Account"
                className="h-11 w-11 inline-flex items-center justify-center border-[3px] border-black bg-cream hover:bg-accent transition-colors"
              >
                <User className="w-5 h-5" strokeWidth={3} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                aria-label="Toggle menu"
                className="md:hidden h-11 w-11 inline-flex items-center justify-center border-[3px] border-black bg-primary text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={3} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Striped marquee band */}
        <div className="brutal-stripes brutal-stripes-scroll h-2 border-t-[3px] border-black" />
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-cream pt-24 md:hidden">
          <nav className="flex flex-col items-stretch gap-3 px-4 py-8">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={reduce ? false : { opacity: 0, x: -28, rotate: -2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 420, damping: 28 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-5 py-4 text-xl font-black uppercase tracking-wider border-[4px] border-black",
                    isActive(pathname, link.href)
                      ? "bg-primary text-white shadow-[6px_6px_0_0_#000]"
                      : "bg-cream text-black shadow-[6px_6px_0_0_#000]"
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
