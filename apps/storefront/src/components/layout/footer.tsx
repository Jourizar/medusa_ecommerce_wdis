import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "New Arrivals", href: "/products?sort=-created_at" },
    { label: "Sale", href: "/products?min_price=0&max_price=5000" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/account/wishlist" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Shipping Info", href: "#" },
    { label: "Returns", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 inline-block bg-primary px-3 py-1 border-[3px] border-white">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-base font-bold uppercase tracking-wide text-white hover:text-accent transition-colors inline-block hover:translate-x-1"
            >
              → {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-[6px] border-black mt-20">
      {/* Marquee bar */}
      <div className="overflow-hidden border-b-[4px] border-white bg-accent text-black py-3">
        <div className="marquee-track gap-12 font-black uppercase tracking-widest text-lg">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 pr-12 shrink-0">
              <span>★ {SITE_NAME}</span>
              <span>FREE SHIPPING OVER $100</span>
              <span>★ BOLD STREETWEAR</span>
              <span>LIMITED DROPS</span>
              <span>★ {SITE_NAME}</span>
              <span>SHOP THE LATEST</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-5xl md:text-6xl font-display font-black text-accent tracking-tighter inline-block leading-none"
            >
              {SITE_NAME}
            </Link>
            <p className="text-sm uppercase tracking-wider font-bold text-white mt-4">
              {SITE_TAGLINE}
            </p>
          </div>

          <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
          <FooterColumn title="Account" links={FOOTER_LINKS.account} />
          <FooterColumn title="Support" links={FOOTER_LINKS.support} />
        </div>

        {/* Bottom bar */}
        <div className="border-t-[3px] border-white pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white">
            &copy; {new Date().getFullYear()} {SITE_NAME}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            <Link href="#" className="text-white hover:text-accent transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-white hover:text-accent transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
