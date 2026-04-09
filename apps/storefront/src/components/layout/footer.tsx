import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, NAV_LINKS } from "@/lib/constants";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=-created_at" },
    { label: "Sale", href: "/products?min_price=0&max_price=5000" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Orders", href: "/account" },
    { label: "Wishlist", href: "/account" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Shipping Info", href: "#" },
    { label: "Returns", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-2xl font-display font-black text-gradient tracking-tight"
            >
              {SITE_NAME}
            </Link>
            <p className="text-sm text-text-muted mt-2">{SITE_TAGLINE}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-display font-semibold text-text mb-3 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-display font-semibold text-text mb-3 uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-display font-semibold text-text mb-3 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link href="#" className="hover:text-text transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-text transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
